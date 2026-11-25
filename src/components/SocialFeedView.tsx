import React, { useState } from 'react';
import { UserCheck, UserPlus } from 'lucide-react';
import { ArtistProfile, ArtworkPost, DisciplineTag, FeedEntry, PortfolioCollection } from '../types/social';
import { ArtistAvatar } from './MediaPrimitives';
import { WorkCard } from './WorkCard';

interface SocialFeedViewProps {
  currentUser: ArtistProfile | null;
  artists: ArtistProfile[];
  artistMap: Map<string, ArtistProfile>;
  portfolioMap: Map<string, PortfolioCollection>;
  followingIds: string[];
  getFeedEntries: (scope: 'following' | 'network', discipline: DisciplineTag | 'Todas') => FeedEntry[];
  getFollowerCount: (artistId: string) => number;
  getFollowingCount: (artistId: string) => number;
  onToggleFollow: (artistId: string) => void;
  onOpenArtist: (artistId: string, portfolioId?: string) => void;
  onOpenLightbox: (post: ArtworkPost) => void;
  onToggleLike: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onShareInNetwork: (postId: string, note?: string) => void;
  onOpenPublish: () => void;
  onRequireAuth: (message?: string) => void;
}

const DISCIPLINE_FILTERS: (DisciplineTag | 'Todas')[] = [
  'Todas',
  'Escritor',
  'Ilustrador',
  'Lector',
];

export const SocialFeedView: React.FC<SocialFeedViewProps> = ({
  currentUser,
  artists,
  artistMap,
  portfolioMap,
  followingIds,
  getFeedEntries,
  getFollowerCount,
  getFollowingCount,
  onToggleFollow,
  onOpenArtist,
  onOpenLightbox,
  onToggleLike,
  onAddComment,
  onShareInNetwork,
  onOpenPublish,
  onRequireAuth,
}) => {
  const [scope, setScope] = useState<'following' | 'network'>(
    currentUser ? 'following' : 'network'
  );
  const [disciplineFilter, setDisciplineFilter] = useState<DisciplineTag | 'Todas'>('Todas');

  const activeScope = currentUser ? scope : 'network';
  const entries = getFeedEntries(activeScope, disciplineFilter);
  const suggestedArtists = currentUser
    ? artists.filter((a) => a.id !== currentUser.id)
    : artists;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="pb-6 border-b border-zinc-200 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#141416]">
            Actividad de la red
          </h1>
          <p className="text-[15px] text-zinc-600 leading-relaxed">
            {currentUser
              ? 'Obras recientes, fragmentos destacados y lecturas compartidas por los artistas que sigues.'
              : 'Explora obras recientes, fragmentos literarios y portafolios de nuestra comunidad.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {currentUser && (
            <div
              role="group"
              aria-label="Alcance del feed"
              className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg"
            >
              <button
                type="button"
                onClick={() => setScope('following')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  scope === 'following'
                    ? 'bg-white text-[#141416] shadow-xs'
                    : 'text-zinc-600 hover:text-[#141416]'
                }`}
              >
                Seguidos
              </button>
              <button
                type="button"
                onClick={() => setScope('network')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  scope === 'network'
                    ? 'bg-white text-[#141416] shadow-xs'
                    : 'text-zinc-600 hover:text-[#141416]'
                }`}
              >
                Toda la red
              </button>
            </div>
          )}

          <div
            role="group"
            aria-label="Filtrar por disciplina"
            className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg"
          >
            {DISCIPLINE_FILTERS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setDisciplineFilter(tag)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  disciplineFilter === tag
                    ? 'bg-white text-[#141416] shadow-xs'
                    : 'text-zinc-600 hover:text-[#141416]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        <section aria-label="Publicaciones del feed" className="lg:col-span-8 space-y-6">
          {entries.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-10 text-center space-y-4">
              <h2 className="font-serif text-xl font-semibold text-[#141416]">
                No hay publicaciones en esta vista
              </h2>
              <p className="text-sm text-zinc-600 max-w-md mx-auto">
                {activeScope === 'following'
                  ? 'Sigue a más escritores, ilustradores o lectores en el panel lateral, o cambia a "Toda la red" para descubrir nuevas obras.'
                  : 'Todavía no hay obras publicadas bajo esta disciplina. Anímate a estrenar la sección.'}
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                {activeScope === 'following' && (
                  <button
                    type="button"
                    onClick={() => setScope('network')}
                    className="px-4 py-2 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-[#141416] rounded-lg transition-colors cursor-pointer"
                  >
                    Ver toda la red
                  </button>
                )}
                <button
                  type="button"
                  onClick={onOpenPublish}
                  className="px-4 py-2 text-xs font-medium bg-[#C83E2B] hover:bg-[#AD3322] text-white rounded-lg transition-colors cursor-pointer"
                >
                  Publicar obra
                </button>
              </div>
            </div>
          ) : (
            entries.map((entry) => {
              const author = artistMap.get(entry.post.authorId);
              if (!author) return null;
              const portfolio = portfolioMap.get(entry.post.portfolioId);
              return (
                <WorkCard
                  key={entry.key}
                  post={entry.post}
                  author={author}
                  portfolio={portfolio}
                  currentUserId={currentUser?.id ?? ''}
                  artistMap={artistMap}
                  sharedBy={entry.sharedBy}
                  onOpenArtist={onOpenArtist}
                  onOpenLightbox={onOpenLightbox}
                  onToggleLike={onToggleLike}
                  onAddComment={onAddComment}
                  onShareInNetwork={onShareInNetwork}
                />
              );
            })
          )}
        </section>

        <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
          {currentUser ? (
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => onOpenArtist(currentUser.id)}
                  className="cursor-pointer shrink-0"
                >
                  <ArtistAvatar
                    name={currentUser.name}
                    avatarUrl={currentUser.avatarUrl}
                    size="lg"
                  />
                </button>
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => onOpenArtist(currentUser.id)}
                    className="font-serif text-lg font-semibold text-[#141416] hover:text-[#C83E2B] transition-colors cursor-pointer block truncate"
                  >
                    {currentUser.name}
                  </button>
                  <p className="text-xs text-zinc-500 truncate">
                    {currentUser.disciplines.join(' · ')}
                  </p>
                </div>
              </div>

              <p className="text-sm text-zinc-600 leading-relaxed line-clamp-3">
                {currentUser.bio}
              </p>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-600">
                <div className="flex items-center gap-4">
                  <span>
                    <strong className="font-mono tabular-nums text-[#141416]">
                      {getFollowingCount(currentUser.id)}
                    </strong>{' '}
                    siguiendo
                  </span>
                  <span>
                    <strong className="font-mono tabular-nums text-[#141416]">
                      {getFollowerCount(currentUser.id)}
                    </strong>{' '}
                    seguidores
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenArtist(currentUser.id)}
                  className="font-medium text-[#C83E2B] hover:underline cursor-pointer whitespace-nowrap"
                >
                  Ver portafolio
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 space-y-3">
              <h2 className="font-serif text-lg font-semibold text-[#141416]">
                Crea tu portafolio en Folio &amp; Trazo
              </h2>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Regístrate con tu correo electrónico para publicar obras, comentar fragmentos y seguir a otros artistas.
              </p>
              <button
                type="button"
                onClick={() => onRequireAuth()}
                className="w-full py-2 px-4 text-xs font-medium text-white bg-[#C83E2B] hover:bg-[#AD3322] rounded-lg transition-colors cursor-pointer"
              >
                Iniciar sesión o registrarse
              </button>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="font-serif text-lg font-semibold text-[#141416]">
                Conectar con artistas
              </h2>
              <span className="text-xs font-mono tabular-nums text-zinc-500">
                {suggestedArtists.length} perfiles
              </span>
            </div>

            <div className="divide-y divide-zinc-200 border-y border-zinc-200 bg-white rounded-xl overflow-hidden">
              {suggestedArtists.map((artist) => {
                const following = followingIds.includes(artist.id);
                return (
                  <div key={artist.id} className="p-4 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => onOpenArtist(artist.id)}
                        className="cursor-pointer shrink-0"
                      >
                        <ArtistAvatar
                          name={artist.name}
                          avatarUrl={artist.avatarUrl}
                          size="md"
                        />
                      </button>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => onOpenArtist(artist.id)}
                          className="text-sm font-semibold text-[#141416] hover:text-[#C83E2B] transition-colors cursor-pointer block truncate"
                        >
                          {artist.name}
                        </button>
                        <p className="text-xs text-zinc-500 truncate mt-0.5">
                          {artist.disciplines.join(' · ')} · {artist.location}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleFollow(artist.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        following
                          ? 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
                          : 'bg-[#141416] text-white hover:bg-zinc-800'
                      }`}
                    >
                      {following ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
                          <span>Siguiendo</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" strokeWidth={1.75} />
                          <span>Seguir</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
