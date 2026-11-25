import { useCallback, useEffect, useMemo, useState } from 'react';
import { INITIAL_SOCIAL_STATE } from '../data/seed';
import {
  ArtistProfile,
  ArtworkPost,
  AuthSession,
  DisciplineTag,
  FeedEntry,
  PortfolioCollection,
  SocialState,
} from '../types/social';

export async function compressImageFileToDataUrl(file: File, maxDimension = 1280): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo de imagen.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Formato de imagen no compatible.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export interface PublishWorkInput {
  portfolioId: string;
  discipline: DisciplineTag;
  format: 'image' | 'excerpt' | 'mixed';
  title: string;
  caption: string;
  imageUrl?: string;
  imageAlt?: string;
  excerptText?: string;
  excerptSource?: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  location: string;
  bio: string;
  disciplines: DisciplineTag[];
}

export interface LoginInput {
  email: string;
  password: string;
}

export function useSocialStore() {
  const [state, setState] = useState<SocialState>({
    artists: INITIAL_SOCIAL_STATE.artists,
    portfolios: INITIAL_SOCIAL_STATE.portfolios,
    posts: INITIAL_SOCIAL_STATE.posts,
    followingMap: INITIAL_SOCIAL_STATE.followingMap,
  });

  // In-memory session token (never persisted in localStorage/sessionStorage)
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoadingState, setIsLoadingState] = useState(true);

  useEffect(() => {
    let active = true;
    fetch('/api/social/state')
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as SocialState;
        if (active && data && Array.isArray(data.artists)) {
          setState(data);
        }
      })
      .catch(() => {
        // Retain initial seed on network error
      })
      .finally(() => {
        if (active) setIsLoadingState(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const authHeaders = useMemo(() => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session?.token) {
      headers.Authorization = `Bearer ${session.token}`;
    }
    return headers;
  }, [session?.token]);

  const currentUser = useMemo(
    () => (session ? state.artists.find((a) => a.id === session.artistId) ?? null : null),
    [state.artists, session]
  );

  const artistMap = useMemo(() => {
    const map = new Map<string, ArtistProfile>();
    state.artists.forEach((a) => map.set(a.id, a));
    return map;
  }, [state.artists]);

  const portfolioMap = useMemo(() => {
    const map = new Map<string, PortfolioCollection>();
    state.portfolios.forEach((p) => map.set(p.id, p));
    return map;
  }, [state.portfolios]);

  const followingIds = useMemo(
    () => (session ? state.followingMap[session.artistId] ?? [] : []),
    [state.followingMap, session]
  );

  const isFollowing = useCallback(
    (targetArtistId: string) => followingIds.includes(targetArtistId),
    [followingIds]
  );

  const getFollowerCount = useCallback(
    (artistId: string) =>
      Object.values(state.followingMap).filter((list) => list.includes(artistId)).length,
    [state.followingMap]
  );

  const getFollowingCount = useCallback(
    (artistId: string) => (state.followingMap[artistId] ?? []).length,
    [state.followingMap]
  );

  const getFollowersOf = useCallback(
    (artistId: string): ArtistProfile[] =>
      state.artists.filter((artist) => (state.followingMap[artist.id] ?? []).includes(artistId)),
    [state.artists, state.followingMap]
  );

  const getFollowingOf = useCallback(
    (artistId: string): ArtistProfile[] => {
      const ids = state.followingMap[artistId] ?? [];
      return ids.map((id) => artistMap.get(id)).filter((a): a is ArtistProfile => Boolean(a));
    },
    [state.followingMap, artistMap]
  );

  const registerWithEmail = useCallback(async (input: RegisterInput): Promise<void> => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || 'No se pudo completar el registro.');
    }
    setState(data.state);
    setSession({
      token: data.token,
      email: data.user.email,
      artistId: data.user.artist.id,
    });
  }, []);

  const loginWithEmail = useCallback(async (input: LoginInput): Promise<void> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || 'No se pudo iniciar sesión.');
    }
    setState(data.state);
    setSession({
      token: data.token,
      email: data.user.email,
      artistId: data.user.artist.id,
    });
  }, []);

  const logout = useCallback(() => {
    setSession(null);
  }, []);

  const toggleFollow = useCallback(
    async (targetArtistId: string) => {
      if (!session) return;
      const res = await fetch(`/api/artists/${encodeURIComponent(targetArtistId)}/follow`, {
        method: 'POST',
        headers: authHeaders,
      });
      if (res.ok) {
        const data = await res.json();
        setState(data.state);
      }
    },
    [session, authHeaders]
  );

  const toggleLike = useCallback(
    async (postId: string) => {
      if (!session) return;
      const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/like`, {
        method: 'POST',
        headers: authHeaders,
      });
      if (res.ok) {
        const data = await res.json();
        setState(data.state);
      }
    },
    [session, authHeaders]
  );

  const addComment = useCallback(
    async (postId: string, text: string) => {
      if (!session || !text.trim()) return;
      const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/comments`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ text: text.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setState(data.state);
      }
    },
    [session, authHeaders]
  );

  const toggleShareInNetwork = useCallback(
    async (postId: string, note?: string) => {
      if (!session) return;
      const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/share`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ note }),
      });
      if (res.ok) {
        const data = await res.json();
        setState(data.state);
      }
    },
    [session, authHeaders]
  );

  const createPortfolio = useCallback(
    async (
      title: string,
      description: string,
      discipline: DisciplineTag
    ): Promise<PortfolioCollection | null> => {
      if (!session) return null;
      const res = await fetch('/api/portfolios', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ title, description, discipline }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      setState(data.state);
      return data.portfolio as PortfolioCollection;
    },
    [session, authHeaders]
  );

  const publishWork = useCallback(
    async (input: PublishWorkInput): Promise<ArtworkPost | null> => {
      if (!session) return null;
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(input),
      });
      if (!res.ok) return null;
      const data = await res.json();
      setState(data.state);
      return data.post as ArtworkPost;
    },
    [session, authHeaders]
  );

  const updateCurrentProfile = useCallback(
    async (updates: Partial<Pick<ArtistProfile, 'name' | 'bio' | 'location' | 'disciplines'>>) => {
      if (!session) return;
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setState(data.state);
      }
    },
    [session, authHeaders]
  );

  const getFeedEntries = useCallback(
    (scope: 'following' | 'network', disciplineFilter: DisciplineTag | 'Todas'): FeedEntry[] => {
      const effectiveScope = session ? scope : 'network';
      const visibleAuthors = session
        ? new Set([session.artistId, ...followingIds])
        : new Set<string>();
      const entries: FeedEntry[] = [];

      for (const post of state.posts) {
        if (disciplineFilter !== 'Todas' && post.discipline !== disciplineFilter) {
          continue;
        }

        if (effectiveScope === 'network') {
          entries.push({
            key: `orig-${post.id}`,
            post,
            activityTimestamp: post.createdAt,
          });
          continue;
        }

        if (visibleAuthors.has(post.authorId)) {
          entries.push({
            key: `orig-${post.id}`,
            post,
            activityTimestamp: post.createdAt,
          });
        } else {
          const followedShare = post.shares.find((share) => visibleAuthors.has(share.userId));
          if (followedShare) {
            const sharer = artistMap.get(followedShare.userId);
            if (sharer) {
              entries.push({
                key: `share-${post.id}-${followedShare.userId}`,
                post,
                activityTimestamp: followedShare.sharedAt,
                sharedBy: {
                  artist: sharer,
                  note: followedShare.note,
                  sharedAt: followedShare.sharedAt,
                },
              });
            }
          }
        }
      }

      return entries.sort(
        (a, b) => new Date(b.activityTimestamp).getTime() - new Date(a.activityTimestamp).getTime()
      );
    },
    [state.posts, session, followingIds, artistMap]
  );

  return {
    state,
    session,
    currentUser,
    isLoadingState,
    artistMap,
    portfolioMap,
    followingIds,
    isFollowing,
    getFollowerCount,
    getFollowingCount,
    getFollowersOf,
    getFollowingOf,
    registerWithEmail,
    loginWithEmail,
    logout,
    toggleFollow,
    toggleLike,
    addComment,
    toggleShareInNetwork,
    createPortfolio,
    publishWork,
    updateCurrentProfile,
    getFeedEntries,
  };
}
