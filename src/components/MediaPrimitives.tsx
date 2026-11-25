import React, { useState } from 'react';
import { BookOpen, Image as ImageIcon } from 'lucide-react';
import { getInitials } from '../utils/formatters';

interface ArtistAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<ArtistAvatarProps['size']>, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-xs',
  lg: 'w-16 h-16 text-base',
  xl: 'w-24 h-24 text-xl',
};

export const ArtistAvatar: React.FC<ArtistAvatarProps> = ({
  name,
  avatarUrl,
  size = 'md',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  if (!avatarUrl || hasError) {
    return (
      <div
        aria-label={name}
        className={`${SIZE_CLASSES[size]} rounded-full bg-zinc-200 text-zinc-700 font-semibold flex items-center justify-center shrink-0 select-none border border-zinc-300/70 ${className}`}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={`Retrato de ${name}`}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`${SIZE_CLASSES[size]} rounded-full object-cover shrink-0 border border-zinc-200 bg-zinc-100 ${className}`}
    />
  );
};

interface WorkImageProps {
  src: string;
  alt: string;
  title: string;
  className?: string;
  onClick?: () => void;
}

export const WorkImage: React.FC<WorkImageProps> = ({
  src,
  alt,
  title,
  className = '',
  onClick,
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        onClick={onClick}
        className={`w-full min-h-[220px] bg-gradient-to-br from-zinc-100 to-zinc-200/80 border border-zinc-200 flex flex-col items-center justify-center gap-2 p-6 text-center ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <ImageIcon className="w-6 h-6 text-zinc-400" strokeWidth={1.5} />
        <p className="text-sm font-medium text-zinc-700 max-w-xs">{title}</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      onClick={onClick}
      className={`w-full object-cover bg-zinc-100 ${onClick ? 'cursor-pointer transition-transform duration-200 ease-out hover:scale-[1.01]' : ''} ${className}`}
    />
  );
};

interface ExcerptBlockProps {
  text: string;
  source?: string;
  compact?: boolean;
  onClick?: () => void;
}

export const ExcerptBlock: React.FC<ExcerptBlockProps> = ({
  text,
  source,
  compact = false,
  onClick,
}) => {
  return (
    <figure
      onClick={onClick}
      className={`bg-zinc-50 border border-zinc-200/90 rounded-xl ${compact ? 'p-4' : 'p-6 sm:p-7'} ${onClick ? 'cursor-pointer hover:border-zinc-300 transition-colors' : ''}`}
    >
      <div className="flex items-start gap-3">
        <BookOpen className="w-4 h-4 text-[#C83E2B] shrink-0 mt-1.5" strokeWidth={1.75} />
        <div className="space-y-3 min-w-0">
          <blockquote
            className={`font-serif text-[#141416] leading-relaxed ${
              compact ? 'text-[15px] line-clamp-4' : 'text-[17px] sm:text-[18px]'
            }`}
          >
            {text}
          </blockquote>
          {source && (
            <figcaption className="text-xs text-zinc-500 font-medium tracking-normal">
              {source}
            </figcaption>
          )}
        </div>
      </div>
    </figure>
  );
};
