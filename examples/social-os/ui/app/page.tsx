"use client";

import { useEffect, useState } from "react";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useCopilotAction } from "@copilotkit/react-core";
import { Timeline } from "@/components/timeline/Timeline";
import { CreatePost } from "@/components/post/CreatePost";
import { User, Post } from "@/lib/types";
import { UserCircle, Sparkles } from "lucide-react";

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch users and posts
  useEffect(() => {
    async function fetchData() {
      try {
        const [usersRes, postsRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/posts')
        ]);
        
        const usersData = await usersRes.json();
        const postsData = await postsRes.json();
        
        if (usersData.success) {
          setUsers(usersData.data);
          // Set first user as current user for demo
          if (usersData.data.length > 0) {
            setCurrentUserId(usersData.data[0].id);
          }
        }
        
        if (postsData.success) {
          setPosts(postsData.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const currentUser = users.find(u => u.id === currentUserId);

  // Agent action for generating post content
  useCopilotAction({
    name: "generatePostContent",
    available: "remote",
    parameters: [
      {
        name: "content",
        type: "string",
        description: "The generated post content based on user style and preferences",
      },
      {
        name: "topic",
        type: "string",
        description: "The topic or theme of the generated content",
      },
    ],
    render: ({ args }) => {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-2">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-blue-700">AI Generated Content</span>
          </div>
          <p className="text-gray-700">{args.content}</p>
          {args.topic && (
            <p className="text-sm text-gray-500 mt-2">Topic: {args.topic}</p>
          )}
        </div>
      );
    },
  });

  // Agent action for generating images
  useCopilotAction({
    name: "generateImage",
    available: "remote",
    parameters: [
      {
        name: "prompt",
        type: "string",
        description: "The image generation prompt",
      },
      {
        name: "imageUrl",
        type: "string",
        description: "The URL of the generated image",
      },
    ],
    render: ({ args }) => {
      return (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 my-2">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="font-semibold text-purple-700">AI Generated Image</span>
          </div>
          {args.imageUrl && (
            <img 
              src={args.imageUrl} 
              alt={args.prompt} 
              className="rounded-lg max-w-sm"
            />
          )}
          <p className="text-sm text-gray-600 mt-2">{args.prompt}</p>
        </div>
      );
    },
  });

  const handlePostCreated = (newPost: Post) => {
    setPosts([newPost, ...posts]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Social OS...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-blue-500" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">AiCopilot Social OS</h1>
                  <p className="text-sm text-gray-500">Your AI-Powered Social Platform</p>
                </div>
              </div>
              
              {currentUser && (
                <div className="flex items-center gap-3">
                  {currentUser.avatar_url ? (
                    <img 
                      src={currentUser.avatar_url} 
                      alt={currentUser.display_name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <UserCircle className="w-10 h-10 text-gray-400" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{currentUser.display_name}</p>
                    <p className="text-xs text-gray-500">@{currentUser.username}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
          {/* Sidebar - User Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Users</h2>
              <div className="space-y-3">
                {users.map((user) => (
                  <div 
                    key={user.id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      user.id === currentUserId ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setCurrentUserId(user.id)}
                  >
                    {user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.display_name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <UserCircle className="w-10 h-10 text-gray-400" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{user.display_name}</p>
                      <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {currentUserId && (
              <CreatePost 
                userId={currentUserId} 
                onPostCreated={handlePostCreated}
              />
            )}
            
            <Timeline posts={posts} currentUserId={currentUserId} />
          </div>
        </div>
      </div>

      {/* AI Assistant Sidebar */}
      <CopilotSidebar
        defaultOpen={false}
        labels={{
          title: "Your AI Agent",
          initial: currentUser 
            ? `Hi! I'm ${currentUser.display_name}'s Agent. I can help you create posts, generate content, and more!`
            : "Hi! I'm your AI Agent. How can I help you today?",
        }}
        instructions={
          currentUser
            ? `You are the personal AI agent for ${currentUser.display_name} (@${currentUser.username}). 
               Help them create engaging social media posts, generate images, and interact with the platform. 
               You should write in their style and represent their personality.
               Their bio: ${currentUser.bio || 'No bio yet'}
               Be helpful, creative, and friendly.`
            : "You are a helpful AI assistant for the Social OS platform."
        }
      />
    </main>
  );
}
