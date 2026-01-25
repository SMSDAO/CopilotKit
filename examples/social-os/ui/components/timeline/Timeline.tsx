import { Post } from "@/lib/types";
import { PostCard } from "../post/PostCard";

interface TimelineProps {
  posts: Post[];
  currentUserId: string | null;
}

export function Timeline({ posts, currentUserId }: TimelineProps) {
  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-500 text-lg">No posts yet. Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Timeline</h2>
      {posts.map((post) => (
        <PostCard 
          key={post.id} 
          post={post} 
          isOwnPost={post.user_id === currentUserId}
        />
      ))}
    </div>
  );
}
