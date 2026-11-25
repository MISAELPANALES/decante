import { useMemo, useState } from 'react';
import { ArtistProfileView } from './components/ArtistProfileView';
import { AuthPage } from './components/AuthPage';
import { ExploreDirectoryView } from './components/ExploreDirectoryView';
import { Header } from './components/Header';
import { PortfoliosView } from './components/PortfoliosView';
import { PublishWorkModal } from './components/PublishWorkModal';
import { SocialFeedView } from './components/SocialFeedView';
import { WorkLightboxModal } from './components/WorkLightboxModal';
import { useSocialStore } from './store/useSocialStore';
import { AppView, ArtworkPost } from './types/social';

export default function App() {
  const {
    state,
    session,
    currentUser,
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
  } = useSocialStore();

  const [activeView, setActiveView] = useState<AppView>('auth');
  const [authNotice, setAuthNotice] = useState<string>('');
  const [viewedArtistId, setViewedArtistId] = useState<string>(state.artists[0]?.id ?? '');
  const [viewedPortfolioId, setViewedPortfolioId] = useState<string | null>(null);
  const [lightboxPostId, setLightboxPostId] = useState<string | null>(null);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishDefaultPortfolioId, setPublishDefaultPortfolioId] = useState<string | undefined>(
    undefined
  );

  const requireAuth = (notice?: string): boolean => {
    if (session) return true;
    setAuthNotice(
      notice || 'Inicia sesión o regístrate con tu correo electrónico para realizar esta acción.'
    );
    setLightboxPostId(null);
    setActiveView('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return false;
  };

  const handleNavigate = (view: AppView) => {
    if (view === 'profile' && !requireAuth('Inicia sesión para ver y editar tu perfil personal.')) {
      return;
    }
    setAuthNotice('');
    setActiveView(view);
    if (view === 'profile' && currentUser) {
      setViewedArtistId(currentUser.id);
      setViewedPortfolioId(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenArtist = (artistId: string, portfolioId?: string) => {
    setViewedArtistId(artistId);
    setViewedPortfolioId(portfolioId ?? null);
    setActiveView('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPublish = (portfolioId?: string) => {
    if (!requireAuth('Inicia sesión o crea tu cuenta para publicar obras en tu portafolio.')) {
      return;
    }
    setPublishDefaultPortfolioId(portfolioId);
    setPublishModalOpen(true);
  };

  const handleOpenLightbox = (post: ArtworkPost) => {
    setLightboxPostId(post.id);
  };

  const handleToggleFollow = (targetId: string) => {
    if (!requireAuth('Inicia sesión para conectar y seguir a otros artistas.')) return;
    void toggleFollow(targetId);
  };

  const handleToggleLike = (postId: string) => {
    if (!requireAuth('Inicia sesión para dar me gusta a las obras.')) return;
    void toggleLike(postId);
  };

  const handleAddComment = (postId: string, text: string) => {
    if (!requireAuth('Inicia sesión para dejar comentarios en la red.')) return;
    void addComment(postId, text);
  };

  const handleShareInNetwork = (postId: string, note?: string) => {
    if (!requireAuth('Inicia sesión para compartir obras en tu red de seguidores.')) return;
    void toggleShareInNetwork(postId, note);
  };

  const handleLogout = () => {
    logout();
    setAuthNotice('');
    setActiveView('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentUserPortfolios = useMemo(
    () => (currentUser ? state.portfolios.filter((p) => p.artistId === currentUser.id) : []),
    [state.portfolios, currentUser]
  );

  const viewedArtist = artistMap.get(viewedArtistId) ?? state.artists[0];
  const viewedArtistPortfolios = useMemo(
    () =>
      viewedArtist ? state.portfolios.filter((p) => p.artistId === viewedArtist.id) : [],
    [state.portfolios, viewedArtist]
  );
  const viewedArtistPosts = useMemo(
    () =>
      viewedArtist
        ? state.posts
            .filter((p) => p.authorId === viewedArtist.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : [],
    [state.posts, viewedArtist]
  );

  const lightboxPost = useMemo(
    () => (lightboxPostId ? state.posts.find((p) => p.id === lightboxPostId) ?? null : null),
    [state.posts, lightboxPostId]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#141416]">
      <Header
        activeView={activeView}
        isAuthenticated={Boolean(session)}
        onNavigate={handleNavigate}
        onOpenPublish={() => handleOpenPublish()}
      />

      <main className="flex-1">
        {activeView === 'auth' && (
          <AuthPage
            contextNotice={authNotice}
            onLogin={async (input) => {
              await loginWithEmail(input);
              setAuthNotice('');
              setActiveView('feed');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onRegister={async (input) => {
              await registerWithEmail(input);
              setAuthNotice('');
              setActiveView('profile');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onExplorePublic={() => {
              setAuthNotice('');
              setActiveView('feed');
            }}
          />
        )}

        {activeView === 'feed' && (
          <SocialFeedView
            currentUser={currentUser}
            artists={state.artists}
            artistMap={artistMap}
            portfolioMap={portfolioMap}
            followingIds={followingIds}
            getFeedEntries={getFeedEntries}
            getFollowerCount={getFollowerCount}
            getFollowingCount={getFollowingCount}
            onToggleFollow={handleToggleFollow}
            onOpenArtist={handleOpenArtist}
            onOpenLightbox={handleOpenLightbox}
            onToggleLike={handleToggleLike}
            onAddComment={handleAddComment}
            onShareInNetwork={handleShareInNetwork}
            onOpenPublish={() => handleOpenPublish()}
            onRequireAuth={(msg) => requireAuth(msg)}
          />
        )}

        {activeView === 'explore' && (
          <ExploreDirectoryView
            artists={state.artists}
            portfolios={state.portfolios}
            posts={state.posts}
            currentUserId={currentUser?.id ?? ''}
            followingIds={followingIds}
            onToggleFollow={handleToggleFollow}
            onOpenArtist={handleOpenArtist}
            onOpenLightbox={handleOpenLightbox}
          />
        )}

        {activeView === 'portfolios' && (
          <PortfoliosView
            portfolios={state.portfolios}
            posts={state.posts}
            artistMap={artistMap}
            onOpenArtistPortfolio={handleOpenArtist}
          />
        )}

        {activeView === 'profile' && viewedArtist && (
          <ArtistProfileView
            artist={viewedArtist}
            userEmail={session?.email}
            isOwnProfile={Boolean(currentUser && viewedArtist.id === currentUser.id)}
            isFollowing={isFollowing(viewedArtist.id)}
            portfolios={viewedArtistPortfolios}
            posts={viewedArtistPosts}
            initialPortfolioId={viewedPortfolioId}
            followers={getFollowersOf(viewedArtist.id)}
            following={getFollowingOf(viewedArtist.id)}
            onToggleFollow={handleToggleFollow}
            onOpenArtist={handleOpenArtist}
            onOpenLightbox={handleOpenLightbox}
            onToggleLike={handleToggleLike}
            onCreatePortfolio={createPortfolio}
            onUpdateProfile={updateCurrentProfile}
            onOpenPublish={handleOpenPublish}
            onLogout={handleLogout}
          />
        )}
      </main>

      <footer className="border-t border-zinc-200 bg-white mt-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="font-serif font-semibold text-[#141416] text-sm">
              Folio &amp; Trazo
            </span>
            <span aria-hidden="true">·</span>
            <span>Comunidad de escritores, ilustradores y lectores</span>
          </div>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => handleNavigate('feed')}
              className="hover:text-[#141416] cursor-pointer"
            >
              Feed
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('explore')}
              className="hover:text-[#141416] cursor-pointer"
            >
              Explorar
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('portfolios')}
              className="hover:text-[#141416] cursor-pointer"
            >
              Portafolios
            </button>
            {session ? (
              <button
                type="button"
                onClick={() => handleNavigate('profile')}
                className="hover:text-[#141416] cursor-pointer"
              >
                Mi Perfil
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleNavigate('auth')}
                className="hover:text-[#141416] cursor-pointer"
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </footer>

      <WorkLightboxModal
        post={lightboxPost}
        author={lightboxPost ? artistMap.get(lightboxPost.authorId) : undefined}
        portfolio={lightboxPost ? portfolioMap.get(lightboxPost.portfolioId) : undefined}
        currentUserId={currentUser?.id ?? ''}
        artistMap={artistMap}
        onClose={() => setLightboxPostId(null)}
        onOpenArtist={handleOpenArtist}
        onToggleLike={handleToggleLike}
        onAddComment={handleAddComment}
        onShareInNetwork={handleShareInNetwork}
      />

      {currentUser && (
        <PublishWorkModal
          isOpen={publishModalOpen}
          userPortfolios={currentUserPortfolios}
          defaultPortfolioId={publishDefaultPortfolioId}
          onClose={() => setPublishModalOpen(false)}
          onCreatePortfolio={createPortfolio}
          onPublishWork={async (input) => {
            const created = await publishWork(input);
            if (created && activeView !== 'feed' && activeView !== 'profile') {
              setActiveView('feed');
            }
            return created;
          }}
        />
      )}
    </div>
  );
}
