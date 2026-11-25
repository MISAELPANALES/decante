import React, { useEffect, useState } from 'react';
import { Heart, Repeat2, Send, X } from 'lucide-react';
import { ArtistProfile, ArtworkPost, PortfolioCollection } from '../types/social';
import { formatRelativeTime } from '../utils/formatters';
import { ArtistAvatar, ExcerptBlock, WorkImage } from './MediaPrimitives';

interface WorkLightboxModalProps {
  post: ArtworkPost | null;
  author?: ArtistProfile;
  portfolio?: PortfolioCollection;
  currentUserId: string;
  artistMap: Map<string, ArtistProfile>;
  onClose: () => void;
  onOpenArtist: (artistId: string, portfolioId?: string) => void;
  onToggleLike: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onShareInNetwork: (postId: string) => void;
}

export const WorkLightboxModal: React.FC<WorkLightboxModalProps> = ({
  post,
  author,
  portfolio,
  currentUserId,
  artistMap,
  onClose,
  onOpenArtist,
  onToggleLike,
  onAddComment,
  onShareInNetwork,
}) => {
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (!post) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [post, onClose]);

  if (!post || !author) return null;

  const isLiked = post.likedByIds.includes(currentUserId);
  const isShared = post.shares.some((s) => s.userId === currentUserId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText);
    setCommentText('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={post.title}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Primary Artwork / Reading Surface */}
        <div className="lg:col-span-7 bg-zinc-50 border-b lg:border-b-0 lg:border-r border-zinc-200 p-5 sm:p-8 flex flex-col justify-center overflow-y-auto max-h-[55vh] lg:max-h-[90vh]">
          {post.imageUrl && (
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
              <WorkImage
                src={post.imageUrl}
                alt={post.imageAlt || post.title}
                title={post.title}
                className="max-h-[65vh] object-contain mx-auto"
              />
            </div>
          )}
          {post.excerptText && (
            <div className={post.imageUrl ? 'mt-5' : ''}>
              <ExcerptBlock text={post.excerptText} source={post.excerptSource} />
            </div>
          )}
        </div>

        {/* Metadata, Actions & Comments Column */}
        <div className="lg:col-span-5 flex flex-col max-h-[45vh] lg:max-h-[90vh]">
          <div className="p-5 border-b border-zinc-100 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenArtist(author.id);
                }}
                className="cursor-pointer shrink-0"
              >
                <ArtistAvatar name={author.name} avatarUrl={author.avatarUrl} size="md" />
              </button>
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenArtist(author.id);
                  }}
                  className="text-sm font-semibold text-[#141416] hover:text-[#C83E2B] cursor-pointer truncate block"
                >
                  {author.name}
                </button>
                <p className="text-xs text-zinc-500 truncate">
                  {post.discipline}
                  {portfolio ? ` · ${portfolio.title}` : ''} · {formatRelativeTime(post.createdAt)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar vista ampliada"
              className="p-2 text-zinc-500 hover:text-[#141416] hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" strokeWidth={1.75} />
            </button>
          </div>

          <div className="p-5 overflow-y-auto flex-1 space-y-5">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#141416]">{post.title}</h2>
              {post.caption && (
                <p className="text-sm text-zinc-700 leading-relaxed mt-2">{post.caption}</p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onToggleLike(post.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isLiked
                    ? 'bg-[#C83E2B]/10 text-[#C83E2B]'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200/70'
                }`}
              >
                <Heart
                  className="w-4 h-4"
                  strokeWidth={1.75}
                  fill={isLiked ? 'currentColor' : 'none'}
                />
                <span>Me gusta</span>
                <span className="font-mono tabular-nums">{post.likedByIds.length}</span>
              </button>

              <button
                type="button"
                onClick={() => onShareInNetwork(post.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isShared
                    ? 'bg-[#141416] text-white'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200/70'
                }`}
              >
                <Repeat2 className="w-4 h-4" strokeWidth={1.75} />
                <span>{isShared ? 'Compartido' : 'Compartir'}</span>
                <span className="font-mono tabular-nums">{post.shares.length}</span>
              </button>
            </div>

            <div className="pt-4 border-t border-zinc-100 space-y-3">
              <h3 className="text-xs font-semibold text-zinc-500">
                Comentarios ({post.comments.length})
              </h3>
              {post.comments.length === 0 ? (
                <p className="text-xs text-zinc-500">
                  Sé el primero en dejar una impresión o comentario sobre esta pieza.
                </p>
              ) : (
                <ul className="space-y-3">
                  {post.comments.map((cmt) => {
                    const cAuthor = artistMap.get(cmt.authorId);
                    return (
                      <li key={cmt.id} className="flex items-start gap-2.5">
                        <ArtistAvatar
                          name={cAuthor?.name ?? 'Artista'}
                          avatarUrl={cAuthor?.avatarUrl}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#141416]">
                              {cAuthor?.name ?? 'Artista'}
                            </span>
                            <span className="text-[11px] text-zinc-400 font-mono tabular-nums">
                              {formatRelativeTime(cmt.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-700 mt-0.5">{cmt.text}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center gap-2"
          >
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Añadir un comentario..."
              maxLength={400}
              className="flex-1 min-w-0 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-[#141416] placeholder:text-zinc-400 focus:outline-none focus:border-[#C83E2B]"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="px-3.5 py-2 bg-[#C83E2B] text-white text-xs font-medium rounded-lg hover:bg-[#AD3322] disabled:opacity-40 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Enviar</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
