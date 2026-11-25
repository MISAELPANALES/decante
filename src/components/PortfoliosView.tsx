import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ArtistProfile, ArtworkPost, DisciplineTag, PortfolioCollection } from '../types/social';
import { ArtistAvatar, ExcerptBlock, WorkImage } from './MediaPrimitives';

interface PortfoliosViewProps {
  portfolios: PortfolioCollection[];
  posts: ArtworkPost[];
  artistMap: Map<string, ArtistProfile>;
  onOpenArtistPortfolio: (artistId: string, portfolioId: string) => void;
}

const DISCIPLINES: (DisciplineTag | 'Todos')[] = [
  'Todos',
  'Escritor',
  'Ilustrador',
  'Lector',
];

export const PortfoliosView: React.FC<PortfoliosViewProps> = ({
  portfolios,
  posts,
  artistMap,
  onOpenArtistPortfolio,
}) => {
  const [discipline, setDiscipline] = useState<DisciplineTag | 'Todos'>('Todos');

  const filtered = portfolios.filter(
    (pf) => discipline === 'Todos' || pf.discipline === discipline
  );

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      <div className="pb-6 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#141416]">
            Portafolios curados
          </h1>
          <p className="text-[15px] text-zinc-600 leading-relaxed">
            Colecciones temáticas organizadas por cada artista: series visuales, cuadernos literarios y bitácoras de lectura.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg w-fit">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((pf) => {
          const author = artistMap.get(pf.artistId);
          const pfPosts = posts.filter((p) => p.portfolioId === pf.id);
          const leadImagePost = pfPosts.find((p) => Boolean(p.imageUrl));
          const leadExcerptPost = pfPosts.find((p) => Boolean(p.excerptText));

          return (
            <article
              key={pf.id}
              onClick={() => onOpenArtistPortfolio(pf.artistId, pf.id)}
              className="bg-white border border-zinc-200/90 rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer hover:border-zinc-300 transition-colors group"
            >
              <div>
                {leadImagePost?.imageUrl ? (
                  <div className="overflow-hidden bg-zinc-100 border-b border-zinc-100">
                    <WorkImage
                      src={leadImagePost.imageUrl}
                      alt={leadImagePost.imageAlt || pf.title}
                      title={pf.title}
                      className="h-60"
                    />
                  </div>
                ) : leadExcerptPost?.excerptText ? (
                  <div className="p-6 pb-0">
                    <ExcerptBlock
                      text={leadExcerptPost.excerptText}
                      source={leadExcerptPost.excerptSource}
                      compact
                    />
                  </div>
                ) : null}

                <div className="p-6 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs text-zinc-500">
                    <span>
                      <strong className="font-medium text-[#C83E2B]">{pf.discipline}</strong> ·{' '}
                      <span className="font-mono tabular-nums">{pfPosts.length} obras</span>
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-[#C83E2B] transition-colors" />
                  </div>

                  <h2 className="font-serif text-2xl font-semibold text-[#141416] group-hover:text-[#C83E2B] transition-colors">
                    {pf.title}
                  </h2>

                  <p className="text-sm text-zinc-600 leading-relaxed">{pf.description}</p>
                </div>
              </div>

              {author && (
                <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ArtistAvatar name={author.name} avatarUrl={author.avatarUrl} size="sm" />
                    <span className="text-xs font-semibold text-[#141416] truncate">
                      {author.name}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500 font-mono truncate">{author.handle}</span>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};
