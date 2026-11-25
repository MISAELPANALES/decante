import React, { useState } from 'react';
import { Heart, MessageSquare, Repeat2, Maximize2, Send } from 'lucide-react';
import { ArtistProfile, ArtworkPost, PortfolioCollection } from '../types/social';
import { formatRelativeTime } from '../utils/formatters';
import { ArtistAvatar, ExcerptBlock, WorkImage } from './MediaPrimitives';

interface WorkCardProps {
  post: ArtworkPost;
  author: ArtistProfile;
  portfolio?: PortfolioCollection;
  currentUserId: string;
  artistMap: Map<string, ArtistProfile>;
  sharedBy?: {
    artist: ArtistProfile;
    note?: string;
    sharedAt: string;
  };
  onOpenArtist: (artistId: string, portfolioId?: string) => void;
  onOpenLightbox: (post: ArtworkPost) => void;
  onToggleLike: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onShareInNetwork: (postId: string, note?: string) => void;
}

export const WorkCard: React.FC<WorkCardProps> = ({
  post,
  author,
  portfolio,
  currentUserId,
  artistMap,
  sharedBy,
  onOpenArtist,
  onOpenLightbox,
  onToggleLike,
  onAddComment,
  onShareInNetwork,
}) => {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [shareNoteOpen, setShareNoteOpen] = useState(false);
  const [shareNote, setShareNote] = useState('');

  const isLiked = post.likedByIds.includes(currentUserId);
  const isSharedByMe = post.shares.some((s) => s.userId === currentUserId);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText);
    setCommentText('');
  };

  const handleConfirmShare = (e: React.FormEvent) => {
    e.preventDefault();
    onShareInNetwork(post.id, shareNote);
    setShareNote('');
    setShareNoteOpen(false);
  };

  return (
    <article className="bg-white border border-zinc-200/90 rounded-2xl p-6 transition-colors duration-150">
      {/* Network share attribution line */}
      {sharedBy && (
        <div className="mb-4 pb-3 border-b border-zinc-100 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Repeat2 className="w-3.5 h-3.5 text-[#C83E2B]" strokeWidth={1.75} />
            <span>
              Compartido en la red por{' '}
              <button
                type="button"
                onClick={() => onOpenArtist(sharedBy.artist.id)}
                className="font-medium text-zinc-800 hover:text-[#C83E2B] underline-offset-2 hover:underline cursor-pointer"
              >
                {sharedBy.artist.name}
              </button>
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{formatRelativeTime(sharedBy.sharedAt)}</span>
          </div>
          {sharedBy.note && (
            <p className="text-xs text-zinc-600 pl-5 italic">«{sharedBy.note}»</p>
          )}
        </div>
      )}

      {/* Author & clean unboxed metadata header */}
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => onOpenArtist(author.id)}
            className="shrink-0 cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C83E2B]"
          >
            <ArtistAvatar name={author.name} avatarUrl={author.avatarUrl} size="md" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => onOpenArtist(author.id)}
                className="text-sm font-semibold text-[#141416] hover:text-[#C83E2B] transition-colors cursor-pointer truncate"
              >
                {author.name}
              </button>
              <span className="text-xs text-zinc-400 font-mono truncate">{author.handle}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 flex-wrap mt-0.5">
              <span className="font-medium text-zinc-700">{post.discipline}</span>
              {portfolio && (
                <>
                  <span aria-hidden="true">·</span>
                  <button
                    type="button"
                    onClick={() => onOpenArtist(author.id, portfolio.id)}
                    className="hover:text-[#C83E2B] hover:underline underline-offset-2 cursor-pointer transition-colors"
                  >
                    {portfolio.title}
                  </button>
                </>
              )}
              <span aria-hidden="true">·</span>
              <time dateTime={post.createdAt} className="font-mono tabular-nums">
                {formatRelativeTime(post.createdAt)}
              </time>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenLightbox(post)}
          aria-label={`Ampliar ${post.title}`}
          className="p-2 text-zinc-400 hover:text-[#141416] hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <Maximize2 className="w-4 h-4" strokeWidth={1.75} />
        </button>
      </header>

      {/* Work Title & Caption */}
      <div className="mt-4 space-y-2">
        <h3
          onClick={() => onOpenLightbox(post)}
          className="font-serif text-xl font-semibold text-[#141416] tracking-tight cursor-pointer hover:text-[#C83E2B] transition-colors"
        >
          {post.title}
        </h3>
        {post.caption && (
          <p className="text-[15px] leading-relaxed text-zinc-700 max-w-[68ch]">
            {post.caption}
          </p>
        )}
      </div>

      {/* Media & Literary Excerpt Content */}
      <div className="mt-4 space-y-4">
        {post.imageUrl && (
          <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-50">
            <WorkImage
              src={post.imageUrl}
              alt={post.imageAlt || post.title}
              title={post.title}
              className="max-h-[460px]"
              onClick={() => onOpenLightbox(post)}
            />
          </div>
        )}

        {post.excerptText && (
          <ExcerptBlock
            text={post.excerptText}
            source={post.excerptSource}
            onClick={() => onOpenLightbox(post)}
          />
        )}
      </div>

      {/* Action Bar: Like, Comment, Share in Network */}
      <footer className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => onToggleLike(post.id)}
            aria-pressed={isLiked}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
              isLiked
                ? 'bg-[#C83E2B]/10 text-[#C83E2B]'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-[#141416]'
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
            onClick={() => setCommentsOpen((v) => !v)}
            aria-expanded={commentsOpen}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
              commentsOpen
                ? 'bg-zinc-100 text-[#141416]'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-[#141416]'
            }`}
          >
            <MessageSquare className="w-4 h-4" strokeWidth={1.75} />
            <span>Comentar</span>
            <span className="font-mono tabular-nums">{post.comments.length}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (isSharedByMe) {
                onShareInNetwork(post.id);
              } else {
                setShareNoteOpen((v) => !v);
              }
            }}
            aria-pressed={isSharedByMe}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
              isSharedByMe
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-[#141416]'
            }`}
          >
            <Repeat2 className="w-4 h-4" strokeWidth={1.75} />
            <span>{isSharedByMe ? 'Compartido' : 'Compartir en la red'}</span>
            <span className="font-mono tabular-nums">{post.shares.length}</span>
          </button>
        </div>
      </footer>

      {/* Inline Network Share Note Composer */}
      {shareNoteOpen && !isSharedByMe && (
        <form
          onSubmit={handleConfirmShare}
          className="mt-3 p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2.5"
        >
          <label className="block text-xs font-medium text-zinc-700">
            Añade una nota para tus seguidores (opcional)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={shareNote}
              onChange={(e) => setShareNote(e.target.value)}
              placeholder="Ej. Recomiendo leer este fragmento..."
              maxLength={180}
              className="flex-1 min-w-0 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-[#141416] placeholder:text-zinc-400 focus:outline-none focus:border-[#C83E2B]"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-[#141416] hover:bg-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Compartir ahora
            </button>
          </div>
        </form>
      )}

      {/* Expandable Comments Thread */}
      {commentsOpen && (
        <div className="mt-4 pt-4 border-t border-zinc-100 space-y-4">
          {post.comments.length === 0 ? (
            <p className="text-xs text-zinc-500">
              Aún no hay comentarios. Inicia la conversación sobre esta obra.
            </p>
          ) : (
            <ul className="space-y-3">
              {post.comments.map((comment) => {
                const cAuthor = artistMap.get(comment.authorId);
                return (
                  <li key={comment.id} className="flex items-start gap-2.5">
                    <button
                      type="button"
                      onClick={() => cAuthor && onOpenArtist(cAuthor.id)}
                      className="shrink-0 mt-0.5 cursor-pointer"
                    >
                      <ArtistAvatar
                        name={cAuthor?.name ?? 'Artista'}
                        avatarUrl={cAuthor?.avatarUrl}
                        size="sm"
                      />
                    </button>
                    <div className="flex-1 min-w-0 bg-zinc-50 rounded-xl px-3.5 py-2.5 border border-zinc-200/70">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => cAuthor && onOpenArtist(cAuthor.id)}
                          className="text-xs font-semibold text-[#141416] hover:text-[#C83E2B] cursor-pointer"
                        >
                          {cAuthor?.name ?? 'Artista'}
                        </button>
                        <span className="text-[11px] text-zinc-400 font-mono tabular-nums">
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-700 mt-1 leading-snug">{comment.text}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <form onSubmit={handleSubmitComment} className="flex items-center gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Escribe un comentario sobre esta obra..."
              maxLength={400}
              className="flex-1 min-w-0 bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-sm text-[#141416] placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-[#C83E2B]"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              aria-label="Enviar comentario"
              className="px-3.5 py-2 bg-[#141416] text-white text-xs font-medium rounded-lg hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Enviar</span>
            </button>
          </form>
        </div>
      )}
    </article>
  );
};
