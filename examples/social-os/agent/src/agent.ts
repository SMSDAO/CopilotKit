/**
 * Social OS AI Agent
 * 
 * This agent provides personalized AI assistance for each user including:
 * - Text generation in user's style
 * - Image generation
 * - Post suggestions
 * - Content recommendations
 */

import { z } from "zod";
import { RunnableConfig } from "@langchain/core/runnables";
import { tool } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { AIMessage, SystemMessage } from "@langchain/core/messages";
import { MemorySaver, START, StateGraph } from "@langchain/langgraph";
import { Annotation } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";

// Import CopilotKit helpers
import { convertActionsToDynamicStructuredTools } from "@copilotkit/sdk-js/langgraph";
import { CopilotKitStateAnnotation } from "@copilotkit/sdk-js/langgraph";

// Define agent state
export const AgentStateAnnotation = Annotation.Root({
  userStyle: Annotation<string>,
  userName: Annotation<string>,
  ...CopilotKitStateAnnotation.spec,
});

export type AgentState = typeof AgentStateAnnotation.State;

// Tool: Generate post content in user's style
const generatePostContent = tool(
  async ({ topic, tone, length }) => {
    // In a production system, this would use user's learned patterns
    const toneMap: Record<string, string> = {
      casual: "Keep it friendly and conversational",
      professional: "Use professional and polished language",
      creative: "Be creative, use metaphors and vivid language",
      humorous: "Add humor and wit",
    };

    const lengthMap: Record<string, number> = {
      short: 50,
      medium: 150,
      long: 300,
    };

    const guidance = toneMap[tone] || toneMap.casual;
    const targetLength = lengthMap[length] || lengthMap.medium;

    return `Generate a social media post about "${topic}". ${guidance}. Target length: approximately ${targetLength} characters. Make it engaging and authentic.`;
  },
  {
    name: "generatePostContent",
    description: "Generate social media post content based on topic, tone, and length preferences",
    schema: z.object({
      topic: z.string().describe("The topic or theme for the post"),
      tone: z.enum(["casual", "professional", "creative", "humorous"]).describe("The tone of the post"),
      length: z.enum(["short", "medium", "long"]).describe("The desired length of the post"),
    }),
  }
);

// Tool: Suggest post ideas
const suggestPostIdeas = tool(
  async ({ interests, count }) => {
    const ideas = [
      `Share a thought about the future of AI in ${interests[0] || 'technology'}`,
      `Ask your followers a question about ${interests[1] || 'innovation'}`,
      `Share a personal experience or learning from today`,
      `Recommend a resource or tool you find valuable`,
      `Celebrate a small win or achievement`,
    ];

    return ideas.slice(0, count).join('\n- ');
  },
  {
    name: "suggestPostIdeas",
    description: "Suggest post ideas based on user interests",
    schema: z.object({
      interests: z.array(z.string()).describe("User's areas of interest"),
      count: z.number().default(3).describe("Number of ideas to suggest"),
    }),
  }
);

// Tool: Generate image prompt
const generateImagePrompt = tool(
  async ({ description, style }) => {
    return `Create an image: ${description}. Style: ${style}. High quality, detailed, suitable for social media.`;
  },
  {
    name: "generateImagePrompt",
    description: "Generate an optimized image generation prompt",
    schema: z.object({
      description: z.string().describe("What the image should depict"),
      style: z.string().default("modern, vibrant").describe("The artistic style of the image"),
    }),
  }
);

// Collect all tools
const tools = [generatePostContent, suggestPostIdeas, generateImagePrompt];

// Main chat node
async function chat_node(state: AgentState, config: RunnableConfig) {
  const model = new ChatOpenAI({ 
    temperature: 0.7, 
    model: "gpt-4o",
    modelKwargs: {
      response_format: { type: "text" }
    }
  });

  // Bind tools including CopilotKit actions
  const modelWithTools = model.bindTools!([
    ...convertActionsToDynamicStructuredTools(state.copilotkit?.actions || []),
    ...tools,
  ]);

  // System message with user context
  const systemMessage = new SystemMessage({
    content: `You are a personalized AI agent for ${state.userName || 'the user'}. 
    
Your role is to:
- Help create engaging social media posts in the user's style
- Generate creative content ideas
- Assist with image generation
- Provide suggestions for growing engagement

Writing Style: ${state.userStyle || 'Friendly and conversational'}

Be helpful, creative, and align your responses with the user's personality and preferences. 
When generating content, make it authentic and engaging for social media.`,
  });

  const response = await modelWithTools.invoke(
    [systemMessage, ...state.messages],
    config
  );

  return {
    messages: response,
  };
}

// Determine next step
function shouldContinue({ messages, copilotkit }: AgentState) {
  const lastMessage = messages[messages.length - 1] as AIMessage;

  if (lastMessage.tool_calls?.length) {
    const actions = copilotkit?.actions;
    const toolCallName = lastMessage.tool_calls![0].name;

    // Route to tool node if not a CopilotKit action
    if (!actions || actions.every((action) => action.name !== toolCallName)) {
      return "tool_node";
    }
  }

  return "__end__";
}

// Build the workflow
const workflow = new StateGraph(AgentStateAnnotation)
  .addNode("chat_node", chat_node)
  .addNode("tool_node", new ToolNode(tools))
  .addEdge(START, "chat_node")
  .addEdge("tool_node", "chat_node")
  .addConditionalEdges("chat_node", shouldContinue as any);

const memory = new MemorySaver();

export const graph = workflow.compile({
  checkpointer: memory,
});
