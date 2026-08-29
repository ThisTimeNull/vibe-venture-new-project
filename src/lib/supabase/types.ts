// Supabase 테이블 타입 정의 (supabase/schema.sql 기준 수동 작성)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          content: string;
          thumbnail_url: string | null;
          view_count: number;
          like_count: number;
          comment_count: number;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          content: string;
          thumbnail_url?: string | null;
          view_count?: number;
          like_count?: number;
          comment_count?: number;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          title?: string;
          content?: string;
          thumbnail_url?: string | null;
          view_count?: number;
          like_count?: number;
          comment_count?: number;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      post_views: {
        Row: {
          id: string;
          post_id: string;
          viewer_id: string | null;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          viewer_id?: string | null;
          viewed_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          viewer_id?: string | null;
          viewed_at?: string;
        };
        Relationships: [];
      };
      likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          author_id?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      trending_posts: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          content: string;
          thumbnail_url: string | null;
          view_count: number;
          like_count: number;
          comment_count: number;
          published: boolean;
          created_at: string;
          updated_at: string;
          recent_view_count: number;
        };
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Functions: {
      increment_view_count: {
        Args: { p_post_id: string };
        Returns: void;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"];

export type PostWithAuthor = Post & {
  profiles: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
  liked_by_me?: boolean;
};
