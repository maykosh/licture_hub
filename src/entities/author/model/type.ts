export interface IAuthorProfile {
   id: string;
   author_name: string;
   avatar_url: string;
   bio: string;
   achievements: string[];
   postsCount: number;
   booksCount: number;
   mediaCount: number;
   followersCount: number;
}
export interface IPosts {
   id: string;
   author_id: string;
   title: string;
   content: string;
   is_paid: boolean;
   poster_url: string;
   like_count: number;
   created_at: string;
}

export interface IFollower {
   id: string;
   author_id: string;
   user_id: string;
   created_at: string;
}

export interface IFollowButton {
   authorId: string;
   initialIsFollowing: boolean;
   onFollowChange?: (isFollowing: boolean) => void;
}
