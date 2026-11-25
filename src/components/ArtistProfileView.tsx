import React, { useEffect, useState } from 'react';
import {
  Check,
  Edit3,
  FolderPlus,
  Heart,
  LogOut,
  MapPin,
  MessageSquare,
  Plus,
  Repeat2,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import {
  ArtistProfile,
  ArtworkPost,
  DisciplineTag,
  PortfolioCollection,
} from '../types/social';
import { formatRelativeTime } from '../utils/formatters';
import { ArtistAvatar, ExcerptBlock, WorkImage } from './MediaPrimitives';

interface ArtistProfileViewProps {
  artist: ArtistProfile;
  userEmail?: string;
  isOwnProfile: boolean;
  isFollowing: boolean;
  portfolios: PortfolioCollection[];
  posts: ArtworkPost[];
  initialPortfolioId?: string | null;
  followers: ArtistProfile[];
  following: ArtistProfile[];
  onToggleFollow: (artistId: string) => void;
  onOpenArtist: (artistId: string, portfolioId?: string) => void;
  onOpenLightbox: (post: ArtworkPost) => void;
  onToggleLike: (postId: string) => void;
  onCreatePortfolio: (
    title: string,
    description: string,
    discipline: DisciplineTag
  ) => Promise<PortfolioCollection | null>;
  onUpdateProfile: (
    updates: Partial<Pick<ArtistProfile, 'name' | 'bio' | 'location' | 'disciplines'>>
  ) => Promise<void>;
  onOpenPublish: (portfolioId?: string) => void;
  onLogout: () => void;
}

const ALL_DISCIPLINES: DisciplineTag[] = ['Escritor', 'Ilustrador', 'Lector'];

export const ArtistProfileView: React.FC<ArtistProfileViewProps> = ({
  artist,
  userEmail,
  isOwnProfile,
  isFollowing,
  portfolios,
  posts,
  initialPortfolioId,
  followers,
  following,
  onToggleFollow,
  onOpenArtist,
  onOpenLightbox,
  onToggleLike,
  onCreatePortfolio,
  onUpdateProfile,
  onOpenPublish,
  onLogout,
}) => {
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('all');
  const [profileSection, setProfileSection] = useState<'portfolios' | 'connections'>('portfolios');

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(artist.name);
  const [editLocation, setEditLocation] = useState(artist.location);
  const [editBio, setEditBio] = useState(artist.bio);
  const [editDisciplines, setEditDisciplines] = useState<DisciplineTag[]>(artist.disciplines);

  const [isCreatingPortfolio, setIsCreatingPortfolio] = useState(false);
  const [pfTitle, setPfTitle] = useState('');
  const [pfDesc, setPfDesc] = useState('');
  const [pfDiscipline, setPfDiscipline] = useState<DisciplineTag>(
    artist.disciplines[0] ?? 'Ilustrador'
  );

  useEffect(() => {
    setSelectedPortfolioId(initialPortfolioId || 'all');
    setProfileSection('portfolios');
    setIsEditingProfile(false);
    setEditName(artist.name);
    setEditLocation(artist.location);
    setEditBio(artist.bio);
    setEditDisciplines(artist.disciplines);
  }, [artist, initialPortfolioId]);

  const activePortfolio =
    selectedPortfolioId === 'all'
      ? null
      : portfolios.find((p) => p.id === selectedPortfolioId) ?? null;

  const filteredPosts =
    selectedPortfolioId === 'all'
      ? posts
      : posts.filter((p) => p.portfolioId === selectedPortfolioId);

  const toggleDisciplineSelection = (tag: DisciplineTag) => {
    setEditDisciplines((prev) => {
      if (prev.includes(tag)) {
        return prev.length > 1 ? prev.filter((t) => t !== tag) : prev;
      }
      return [...prev, tag];
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateProfile({
      name: editName.trim() || artist.name,
      location: editLocation.trim() || artist.location,
      bio: editBio.trim(),
      disciplines: editDisciplines,
    });
    setIsEditingProfile(false);
  };

  const handleCreatePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pfTitle.trim()) return;
    const created = await onCreatePortfolio(pfTitle, pfDesc, pfDiscipline);
    if (created) {
      setPfTitle('');
      setPfDesc('');
      setIsCreatingPortfolio(false);
      setSelectedPortfolioId(created.id);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-10">
      <section className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start gap-6 min-w-0">
            <ArtistAvatar name={artist.name} avatarUrl={artist.avatarUrl} size="xl" />

            <div className="space-y-3 min-w-0">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#141416]">
                    {artist.name}
                  </h1>
                  <span className="text-sm font-mono text-zinc-500">{artist.handle}</span>
                </div>

                <div className="mt-1.5 flex items-center gap-2 text-sm text-zinc-600 flex-wrap">
                  <span className="font-medium text-[#C83E2B]">
                    {artist.disciplines.join(' · ')}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.75} />
                    {artist.location}
                  </span>
                  {isOwnProfile && userEmail && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-xs text-zinc-500">{userEmail}</span>
                    </>
                  )}
                </div>
              </div>

              <p className="text-[15px] text-zinc-700 leading-relaxed max-w-[64ch]">
                {artist.bio}
              </p>

              <div className="pt-1 flex items-center gap-6 text-sm text-zinc-600 flex-wrap">
                <button
                  type="button"
                  onClick={() => setProfileSection('portfolios')}
                  className="hover:text-[#141416] cursor-pointer"
                >
                  <strong className="font-mono tabular-nums text-[#141416]">{posts.length}</strong>{' '}
                  obras
                </button>
                <button
                  type="button"
                  onClick={() => setProfileSection('portfolios')}
                  className="hover:text-[#141416] cursor-pointer"
                >
                  <strong className="font-mono tabular-nums text-[#141416]">
                    {portfolios.length}
                  </strong>{' '}
                  portafolios
                </button>
                <button
                  type="button"
                  onClick={() => setProfileSection('connections')}
                  className="hover:text-[#141416] cursor-pointer"
                >
                  <strong className="font-mono tabular-nums text-[#141416]">
                    {followers.length}
                  </strong>{' '}
                  seguidores
                </button>
                <button
                  type="button"
                  onClick={() => setProfileSection('connections')}
                  className="hover:text-[#141416] cursor-pointer"
                >
                  <strong className="font-mono tabular-nums text-[#141416]">
                    {following.length}
                  </strong>{' '}
                  siguiendo
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {isOwnProfile ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile((v) => !v)}
                  className="px-4 py-2 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-[#141416] rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>{isEditingProfile ? 'Cerrar edición' : 'Editar perfil'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingPortfolio((v) => !v)}
                  className="px-4 py-2 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-[#141416] rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>Nuevo portafolio</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onOpenPublish(activePortfolio ? activePortfolio.id : portfolios[0]?.id)
                  }
                  className="px-4 py-2 text-xs font-medium bg-[#C83E2B] hover:bg-[#AD3322] text-white rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>Añadir obra</span>
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-3.5 py-2 text-xs font-medium border border-zinc-200 hover:bg-zinc-100 text-zinc-700 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>Cerrar sesión</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => onToggleFollow(artist.id)}
                className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isFollowing
                    ? 'bg-zinc-100 text-[#141416] hover:bg-zinc-200'
                    : 'bg-[#C83E2B] text-white hover:bg-[#AD3322]'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4" strokeWidth={1.75} />
                    <span>Siguiendo</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" strokeWidth={1.75} />
                    <span>Conectar</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {isOwnProfile && isEditingProfile && (
          <form
            onSubmit={handleSaveProfile}
            className="mt-6 pt-6 border-t border-zinc-200 grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Nombre público
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={60}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-sm text-[#141416] focus:bg-white focus:outline-none focus:border-[#C83E2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Ciudad o estudio
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  maxLength={60}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-sm text-[#141416] focus:bg-white focus:outline-none focus:border-[#C83E2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Etiquetas de disciplina (elige una o varias)
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {ALL_DISCIPLINES.map((tag) => {
                    const active = editDisciplines.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleDisciplineSelection(tag)}
                        className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                          active
                            ? 'bg-[#141416] border-[#141416] text-white'
                            : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400'
                        }`}
                      >
                        {active && <Check className="w-3.5 h-3.5" strokeWidth={2} />}
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Biografía artística y literaria
                </label>
                <textarea
                  rows={4}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  maxLength={300}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-[#141416] focus:bg-white focus:outline-none focus:border-[#C83E2B] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-3.5 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-[#C83E2B] hover:bg-[#AD3322] text-white rounded-lg cursor-pointer"
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          </form>
        )}

        {isOwnProfile && isCreatingPortfolio && (
          <form
            onSubmit={handleCreatePortfolio}
            className="mt-6 pt-6 border-t border-zinc-200 space-y-4"
          >
            <h2 className="font-serif text-lg font-semibold text-[#141416]">
              Crear nueva categoría de Portafolio
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                required
                value={pfTitle}
                onChange={(e) => setPfTitle(e.target.value)}
                placeholder="Título del portafolio (ej. Cuaderno de Viaje)"
                maxLength={80}
                className="sm:col-span-2 bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-sm text-[#141416] focus:bg-white focus:outline-none focus:border-[#C83E2B]"
              />
              <select
                value={pfDiscipline}
                onChange={(e) => setPfDiscipline(e.target.value as DisciplineTag)}
                className="bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-sm text-[#141416] focus:bg-white focus:outline-none focus:border-[#C83E2B]"
              >
                {ALL_DISCIPLINES.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                value={pfDesc}
                onChange={(e) => setPfDesc(e.target.value)}
                placeholder="Descripción curatorial de este portafolio..."
                maxLength={180}
                className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-sm text-[#141416] focus:bg-white focus:outline-none focus:border-[#C83E2B]"
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreatingPortfolio(false)}
                  className="px-3.5 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-[#141416] hover:bg-zinc-800 text-white rounded-lg cursor-pointer whitespace-nowrap"
                >
                  Crear portafolio
                </button>
              </div>
            </div>
          </form>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
          <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => setProfileSection('portfolios')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                profileSection === 'portfolios'
                  ? 'bg-white text-[#141416] shadow-xs'
                  : 'text-zinc-600 hover:text-[#141416]'
              }`}
            >
              Portafolios y Obras
            </button>
            <button
              type="button"
              onClick={() => setProfileSection('connections')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                profileSection === 'connections'
                  ? 'bg-white text-[#141416] shadow-xs'
                  : 'text-zinc-600 hover:text-[#141416]'
              }`}
            >
              Conexiones ({followers.length + following.length})
            </button>
          </div>

          {profileSection === 'portfolios' && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedPortfolioId('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                  selectedPortfolioId === 'all'
                    ? 'bg-[#141416] border-[#141416] text-white'
                    : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400'
                }`}
              >
                Todas las obras{' '}
                <span className="font-mono tabular-nums opacity-75">{posts.length}</span>
              </button>
              {portfolios.map((pf) => {
                const count = posts.filter((p) => p.portfolioId === pf.id).length;
                const active = selectedPortfolioId === pf.id;
                return (
                  <button
                    key={pf.id}
                    type="button"
                    onClick={() => setSelectedPortfolioId(pf.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#C83E2B] border-[#C83E2B] text-white'
                        : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400'
                    }`}
                  >
                    {pf.title}{' '}
                    <span className="font-mono tabular-nums opacity-80">{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {profileSection === 'portfolios' ? (
          <div className="space-y-6">
            {activePortfolio && (
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
                <div>
                  <p className="text-xs font-medium text-[#C83E2B]">
                    Portafolio · {activePortfolio.discipline}
                  </p>
                  <h2 className="font-serif text-2xl font-semibold text-[#141416] mt-0.5">
                    {activePortfolio.title}
                  </h2>
                  {activePortfolio.description && (
                    <p className="text-sm text-zinc-600 mt-1 max-w-2xl">
                      {activePortfolio.description}
                    </p>
                  )}
                </div>
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => onOpenPublish(activePortfolio.id)}
                    className="text-xs font-medium text-[#C83E2B] hover:underline whitespace-nowrap cursor-pointer"
                  >
                    + Publicar en este portafolio
                  </button>
                )}
              </div>
            )}

            {filteredPosts.length === 0 ? (
              <div className="bg-white border border-zinc-200 rounded-2xl p-10 text-center space-y-3">
                <h3 className="font-serif text-xl font-semibold text-[#141416]">
                  Este portafolio aún no tiene piezas
                </h3>
                <p className="text-sm text-zinc-500">
                  {isOwnProfile
                    ? 'Sube una ilustración o publica un fragmento literario para inaugurar esta colección.'
                    : 'Este artista todavía no ha publicado obras en esta categoría.'}
                </p>
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => onOpenPublish(activePortfolio?.id)}
                    className="px-4 py-2 text-xs font-medium bg-[#C83E2B] text-white rounded-lg hover:bg-[#AD3322] transition-colors cursor-pointer"
                  >
                    Publicar primera obra
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post, idx) => {
                  const pf = portfolios.find((p) => p.id === post.portfolioId);
                  const isFeatured = idx === 0 && filteredPosts.length >= 3 && post.imageUrl;
                  return (
                    <article
                      key={post.id}
                      onClick={() => onOpenLightbox(post)}
                      className={`bg-white border border-zinc-200/90 rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer hover:border-zinc-300 transition-colors ${
                        isFeatured ? 'md:col-span-2' : ''
                      }`}
                    >
                      <div>
                        {post.imageUrl && (
                          <div className="overflow-hidden bg-zinc-100 border-b border-zinc-100">
                            <WorkImage
                              src={post.imageUrl}
                              alt={post.imageAlt || post.title}
                              title={post.title}
                              className={isFeatured ? 'h-80' : 'h-56'}
                            />
                          </div>
                        )}

                        <div className="p-5 space-y-3">
                          <div className="text-xs text-zinc-500 flex items-center gap-1.5 flex-wrap">
                            <span className="font-medium text-zinc-700">{post.discipline}</span>
                            {pf && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{pf.title}</span>
                              </>
                            )}
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              {formatRelativeTime(post.createdAt)}
                            </span>
                          </div>

                          <h3 className="font-serif text-lg font-semibold text-[#141416] leading-snug">
                            {post.title}
                          </h3>

                          {post.excerptText ? (
                            <ExcerptBlock
                              text={post.excerptText}
                              source={post.excerptSource}
                              compact
                            />
                          ) : (
                            post.caption && (
                              <p className="text-sm text-zinc-600 line-clamp-3 leading-relaxed">
                                {post.caption}
                              </p>
                            )
                          )}
                        </div>
                      </div>

                      <div className="px-5 py-3.5 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleLike(post.id);
                            }}
                            className="inline-flex items-center gap-1 hover:text-[#C83E2B] cursor-pointer"
                          >
                            <Heart className="w-3.5 h-3.5" strokeWidth={1.75} />
                            <span className="font-mono tabular-nums">
                              {post.likedByIds.length}
                            </span>
                          </button>
                          <span className="inline-flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.75} />
                            <span className="font-mono tabular-nums">
                              {post.comments.length}
                            </span>
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Repeat2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                            <span className="font-mono tabular-nums">{post.shares.length}</span>
                          </span>
                        </div>
                        <span className="font-medium text-zinc-700">Abrir pieza</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="font-serif text-lg font-semibold text-[#141416]">
                Seguidores ({followers.length})
              </h3>
              {followers.length === 0 ? (
                <p className="text-sm text-zinc-500">Aún no tiene seguidores registrados.</p>
              ) : (
                <div className="bg-white border border-zinc-200 rounded-xl divide-y divide-zinc-100">
                  {followers.map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => onOpenArtist(person.id)}
                      className="w-full p-4 flex items-center gap-3 text-left hover:bg-zinc-50 transition-colors cursor-pointer"
                    >
                      <ArtistAvatar name={person.name} avatarUrl={person.avatarUrl} size="md" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#141416] truncate">
                          {person.name}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                          {person.disciplines.join(' · ')} · {person.location}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="font-serif text-lg font-semibold text-[#141416]">
                Siguiendo ({following.length})
              </h3>
              {following.length === 0 ? (
                <p className="text-sm text-zinc-500">Todavía no sigue a otros artistas.</p>
              ) : (
                <div className="bg-white border border-zinc-200 rounded-xl divide-y divide-zinc-100">
                  {following.map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => onOpenArtist(person.id)}
                      className="w-full p-4 flex items-center gap-3 text-left hover:bg-zinc-50 transition-colors cursor-pointer"
                    >
                      <ArtistAvatar name={person.name} avatarUrl={person.avatarUrl} size="md" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#141416] truncate">
                          {person.name}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                          {person.disciplines.join(' · ')} · {person.location}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
