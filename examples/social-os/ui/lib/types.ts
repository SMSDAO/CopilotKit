// Core data types for Social OS platform

export interface User {
  id: string;
  username: string;
  display_name: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserAgent {
  id: string;
  user_id: string;
  agent_name: string;
  personality_traits: {
    traits?: string[];
  };
  writing_style: {
    tone?: string;
    length?: string;
  };
  preferred_topics: string[];
  learned_patterns: Record<string, any>;
  generation_settings: {
    model?: string;
    temperature?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  is_public: boolean;
  image_url?: string;
  metadata: Record<string, any>;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
  user?: User; // Optional populated user data
}

export interface AgentInteraction {
  id: string;
  user_id: string;
  interaction_type: 'text_generation' | 'image_generation' | 'chat' | 'other';
  input_data: Record<string, any>;
  output_data?: Record<string, any>;
  feedback_rating?: number;
  created_at: string;
}

export interface UserFollow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    has_more: boolean;
  };
}

// Form types
export interface CreatePostInput {
  user_id: string;
  content: string;
  is_public: boolean;
  image_url?: string;
  ai_generated?: boolean;
}

export interface CreateUserInput {
  username: string;
  display_name: string;
  email: string;
  bio?: string;
}
