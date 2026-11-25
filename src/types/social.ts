export type DisciplineTag = 'Escritor' | 'Ilustrador' | 'Lector';

export type WorkFormat = 'image' | 'excerpt' | 'mixed';

export type AppView = 'feed' | 'explore' | 'portfolios' | 'profile' | 'auth';

export interface PortfolioCollection {
  id: string;
  artistId: string;
  title: string;
  description: string;
  discipline: DisciplineTag;
  createdAt: string;
}

export interface ArtistProfile {
  id: string;
  handle: string;
  name: string;
  avatarUrl: string;
  location: string;
  bio: string;
  disciplines: DisciplineTag[];
  joinedAt: string;
}

export interface PostComment {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface NetworkShare {
  userId: string;
  note?: string;
  sharedAt: string;
}

export interface ArtworkPost {
  id: string;
  authorId: string;
  portfolioId: string;
  discipline: DisciplineTag;
  format: WorkFormat;
  title: string;
  caption: string;
  imageUrl?: string;
  imageAlt?: string;
  excerptText?: string;
  excerptSource?: string;
  createdAt: string;
  likedByIds: string[];
  shares: NetworkShare[];
  comments: PostComment[];
}

export interface FeedEntry {
  key: string;
  post: ArtworkPost;
  activityTimestamp: string;
  sharedBy?: {
    artist: ArtistProfile;
    note?: string;
    sharedAt: string;
  };
}

export interface SocialState {
  artists: ArtistProfile[];
  portfolios: PortfolioCollection[];
  posts: ArtworkPost[];
  /** Map of followerId -> array of followed artistIds */
  followingMap: Record<string, string[]>;
}

export interface AuthSession {
  token: string;
  email: string;
  artistId: string;
}
