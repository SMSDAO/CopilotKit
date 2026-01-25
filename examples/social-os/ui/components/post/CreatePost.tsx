"use client";

import { useState } from "react";
import { Post } from "@/lib/types";
import { Sparkles, Lock, Globe } from "lucide-react";

interface CreatePostProps {
  userId: string;
  onPostCreated: (post: Post) => void;
}

export function CreatePost({ userId, onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          content: content.trim(),
          is_public: isPublic,
          ai_generated: false,
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.data) {
        onPostCreated(data.data);
        setContent("");
      } else {
        console.error('Failed to create post:', data.error);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-blue-500" />
        <h2 className="text-lg font-semibold text-gray-900">Create Post</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind? Ask your AI agent for help!"
          className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          disabled={isSubmitting}
        />
        
        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={() => setIsPublic(!isPublic)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              isPublic 
                ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' 
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {isPublic ? (
              <>
                <Globe className="w-4 h-4" />
                <span>Public</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Private</span>
              </>
            )}
          </button>
          
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
