import { Post } from "@/lib/types";
import { UserCircle, Lock, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  isOwnPost: boolean;
}

export function PostCard({ post, isOwnPost }: PostCardProps) {
  const user = post.user || {
    username: 'unknown',
    display_name: 'Unknown User',
    avatar_url: null,
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
      {/* Post Header */}
      <div className="flex items-start gap-3 mb-4">
        {user.avatar_url ? (
          <img 
            src={user.avatar_url} 
            alt={user.display_name}
            className="w-12 h-12 rounded-full flex-shrink-0"
          />
        ) : (
          <UserCircle className="w-12 h-12 text-gray-400 flex-shrink-0" />
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900">{user.display_name}</p>
            {post.ai_generated && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                <Sparkles className="w-3 h-3" />
                AI
              </span>
            )}
            {!post.is_public && (
              <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                <Lock className="w-3 h-3" />
                Private
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">@{user.username} · {formatDate(post.created_at)}</p>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-800 whitespace-pre-wrap break-words">{post.content}</p>
      </div>

      {/* Post Image */}
      {post.image_url && (
        <div className="mb-4">
          <img 
            src={post.image_url} 
            alt="Post image"
            className="rounded-lg max-w-full h-auto"
          />
        </div>
      )}

      {/* Post Footer - Placeholder for future interactions */}
      <div className="flex items-center gap-6 text-sm text-gray-500 pt-4 border-t border-gray-100">
        <span className="hover:text-blue-500 cursor-pointer transition-colors">Like</span>
        <span className="hover:text-blue-500 cursor-pointer transition-colors">Comment</span>
        <span className="hover:text-blue-500 cursor-pointer transition-colors">Share</span>
      </div>
    </div>
  );
}
