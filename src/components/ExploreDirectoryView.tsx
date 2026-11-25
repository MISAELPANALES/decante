import React, { useState } from 'react';
import { Search, UserCheck, UserPlus } from 'lucide-react';
import { ArtistProfile, ArtworkPost, DisciplineTag, PortfolioCollection } from '../types/social';
import { ArtistAvatar, ExcerptBlock, WorkImage } from './MediaPrimitives';

interface ExploreDirectoryViewProps {
  artists: ArtistProfile[];
  portfolios: PortfolioCollection[];
  posts: ArtworkPost[];
  currentUserId: string;
  followingIds: string[];
  onToggleFollow: (artistId: string) => void;
  onOpenArtist: (artistId: string, portfolioId?: string) => void;
  onOpenLightbox: (post: ArtworkPost) => void;
}

const DISCIPLINES: (DisciplineTag | 'Todos')[] = [
  'Todos',
  'Escritor',
  'Ilustrador',
  'Lector',
];

export const ExploreDirectoryView: React.FC<ExploreDirectoryViewProps> = ({
  artists,
  portfolios,
  posts,
  currentUserId,
  followingIds,
  onToggleFollow,
  onOpenArtist,
  onOpenLightbox,
}) => {
  const [discipline, setDiscipline] = useState<DisciplineTag | 'Todos'>('Todos');
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLowerCase();

  const filteredArtists = artists.filter((artist) => {
    const matchesDiscipline =
      discipline === 'Todos' || artist.disciplines.includes(discipline);
    const matchesQuery =
      !normalizedQuery ||
      artist.name.toLowerCase().includes(normalizedQuery) ||
      artist.bio.toLowerCase().includes(normalizedQuery) ||
      artist.location.toLowerCase().includes(normalizedQuery);
    return matchesDiscipline && matchesQuery;
  });

  const filteredWorks = posts.filter((post) => {
    const matchesDiscipline = discipline === 'Todos' || post.discipline === discipline;
    const matchesQuery =
      !normalizedQuery ||
      post.title.toLowerCase().includes(normalizedQuery) ||
      post.caption.toLowerCase().includes(normalizedQuery) ||
      (post.excerptText?.toLowerCase().includes(normalizedQuery) ?? false);
    return matchesDiscipline && matchesQuery;
  });

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-12">
      {/* Header & Search/Filter Bar */}
      <section className="pb-6 border-b border-zinc-200 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#141416]">
            Directorio de artistas y obras
          </h1>
          <p className="text-[15px] text-zinc-600 leading-relaxed">
            Descubre escritores, ilustradores y lectores por disciplina, explora sus portafolios y conecta directamente.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search
              className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              strokeWidth={1.75}
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar artista o tema..."
              className="w-full sm:w-56 bg-white border border-zinc-200 rounded-lg pl-9 pr-3 py-2 text-xs text-[#141416] placeholder:text-zinc-400 focus:outline-none focus:border-[#C83E2B]"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg">
            {DISCIPLINES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setDiscipline(item)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  discipline === item
                    ? 'bg-white text-[#141416] shadow-xs'
                    : 'text-zinc-600 hover:text-[#141416]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3-in-a-Row Artist Cards Grid */}
      <section className="space-y-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-2xl font-semibold text-[#141416]">Creadores</h2>
          <span className="text-xs font-mono tabular-nums text-zinc-500">
            {filteredArtists.length} artistas
          </span>
        </div>

        {filteredArtists.length === 0 ? (
          <p className="text-sm text-zinc-500 py-6">
            No se encontraron artistas con ese criterio de búsqueda.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtists.map((artist) => {
              const isSelf = artist.id === currentUserId;
              const following = followingIds.includes(artist.id);
              const artistPortfolios = portfolios.filter((p) => p.artistId === artist.id);
              const artistWorksCount = posts.filter((p) => p.authorId === artist.id).length;

              return (
                <article
                  key={artist.id}
                  className="bg-white border border-zinc-200/90 rounded-2xl p-6 flex flex-col justify-between gap-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => onOpenArtist(artist.id)}
                        className="cursor-pointer shrink-0"
                      >
                        <ArtistAvatar
                          name={artist.name}
                          avatarUrl={artist.avatarUrl}
                          size="xl"
                          className="rounded-2xl"
                        />
                      </button>

                      {!isSelf && (
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
                              <span>Conectar</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => onOpenArtist(artist.id)}
                        className="font-serif text-xl font-semibold text-[#141416] hover:text-[#C83E2B] transition-colors cursor-pointer text-left"
                      >
                        {artist.name}
                      </button>
                      <p className="text-xs text-zinc-500 mt-1">
                        {artist.disciplines.join(' · ')} · {artist.location}
                      </p>
                      <p className="text-sm text-zinc-600 mt-2.5 leading-relaxed line-clamp-3">
                        {artist.bio}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                    <span className="font-mono tabular-nums">
                      {artistPortfolios.length} portafolios · {artistWorksCount} obras
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenArtist(artist.id)}
                      className="font-medium text-[#C83E2B] hover:underline cursor-pointer"
                    >
                      Ver perfil
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Community Works Gallery */}
      <section className="space-y-5 pt-4 border-t border-zinc-200">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-2xl font-semibold text-[#141416]">Galería de obras</h2>
          <span className="text-xs font-mono tabular-nums text-zinc-500">
            {filteredWorks.length} piezas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorks.map((post) => {
            const author = artists.find((a) => a.id === post.authorId);
            return (
              <article
                key={post.id}
                onClick={() => onOpenLightbox(post)}
                className="bg-white border border-zinc-200/90 rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer hover:border-zinc-300 transition-colors"
              >
                <div>
                  {post.imageUrl && (
                    <div className="bg-zinc-100 border-b border-zinc-100 overflow-hidden">
                      <WorkImage
                        src={post.imageUrl}
                        alt={post.imageAlt || post.title}
                        title={post.title}
                        className="h-52"
                      />
                    </div>
                  )}
                  <div className="p-5 space-y-2.5">
                    <p className="text-xs text-zinc-500">
                      <span className="font-medium text-zinc-700">{post.discipline}</span>
                      {author ? ` · ${author.name}` : ''}
                    </p>
                    <h3 className="font-serif text-lg font-semibold text-[#141416]">
                      {post.title}
                    </h3>
                    {post.excerptText ? (
                      <ExcerptBlock text={post.excerptText} compact />
                    ) : (
                      <p className="text-sm text-zinc-600 line-clamp-3">{post.caption}</p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};
