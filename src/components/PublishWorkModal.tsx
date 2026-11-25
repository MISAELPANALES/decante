import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, ImagePlus, Plus, Upload, X } from 'lucide-react';
import { compressImageFileToDataUrl, PublishWorkInput } from '../store/useSocialStore';
import { ArtworkPost, DisciplineTag, PortfolioCollection, WorkFormat } from '../types/social';

interface PublishWorkModalProps {
  isOpen: boolean;
  userPortfolios: PortfolioCollection[];
  defaultPortfolioId?: string;
  onClose: () => void;
  onCreatePortfolio: (
    title: string,
    description: string,
    discipline: DisciplineTag
  ) => Promise<PortfolioCollection | null>;
  onPublishWork: (input: PublishWorkInput) => Promise<ArtworkPost | null>;
}

const DISCIPLINES: DisciplineTag[] = ['Escritor', 'Ilustrador', 'Lector'];

export const PublishWorkModal: React.FC<PublishWorkModalProps> = ({
  isOpen,
  userPortfolios,
  defaultPortfolioId,
  onClose,
  onCreatePortfolio,
  onPublishWork,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [discipline, setDiscipline] = useState<DisciplineTag>('Ilustrador');
  const [format, setFormat] = useState<WorkFormat>('image');
  const [portfolioId, setPortfolioId] = useState<string>(
    defaultPortfolioId || userPortfolios[0]?.id || ''
  );
  const [creatingPortfolio, setCreatingPortfolio] = useState(userPortfolios.length === 0);
  const [newPortfolioTitle, setNewPortfolioTitle] = useState('');
  const [newPortfolioDesc, setNewPortfolioDesc] = useState('');

  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [excerptText, setExcerptText] = useState('');
  const [excerptSource, setExcerptSource] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPortfolioId(defaultPortfolioId || userPortfolios[0]?.id || '');
      setCreatingPortfolio(userPortfolios.length === 0);
      setUploadError('');
    }
  }, [isOpen, defaultPortfolioId, userPortfolios]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileChange = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Selecciona un archivo de imagen válido (JPG, PNG o WebP).');
      return;
    }
    setUploadError('');
    setIsProcessingImage(true);
    try {
      const dataUrl = await compressImageFileToDataUrl(file);
      setImageUrl(dataUrl);
      setImageFileName(file.name);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error al procesar la imagen.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const needsImage = format === 'image' || format === 'mixed';
  const needsExcerpt = format === 'excerpt' || format === 'mixed';

  const canSubmit =
    !isPublishing &&
    title.trim().length > 0 &&
    (!needsImage || Boolean(imageUrl)) &&
    (!needsExcerpt || excerptText.trim().length > 0) &&
    (creatingPortfolio ? newPortfolioTitle.trim().length > 0 : Boolean(portfolioId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsPublishing(true);
    try {
      let targetPortfolioId = portfolioId;
      if (creatingPortfolio) {
        const created = await onCreatePortfolio(
          newPortfolioTitle,
          newPortfolioDesc || `Colección de ${discipline.toLowerCase()}`,
          discipline
        );
        if (!created) return;
        targetPortfolioId = created.id;
      }

      const published = await onPublishWork({
        portfolioId: targetPortfolioId,
        discipline,
        format,
        title,
        caption,
        imageUrl: needsImage ? imageUrl : undefined,
        imageAlt: needsImage ? `${title.trim()} (${imageFileName || 'Obra visual'})` : undefined,
        excerptText: needsExcerpt ? excerptText : undefined,
        excerptSource: needsExcerpt ? excerptSource : undefined,
      });

      if (published) {
        setTitle('');
        setCaption('');
        setImageUrl('');
        setImageFileName('');
        setExcerptText('');
        setExcerptSource('');
        setNewPortfolioTitle('');
        setNewPortfolioDesc('');
        onClose();
      }
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Publicar nueva obra"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-200 p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-[#141416]">
              Publicar obra en tu portafolio
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              Comparte una ilustración, fotografía de lectura o fragmento literario con tus seguidores.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-2 text-zinc-400 hover:text-[#141416] hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700">
                Etiqueta de disciplina
              </label>
              <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg">
                {DISCIPLINES.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setDiscipline(tag)}
                    className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      discipline === tag
                        ? 'bg-white text-[#141416] shadow-xs'
                        : 'text-zinc-600 hover:text-[#141416]'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700">
                Formato de publicación
              </label>
              <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg">
                {(
                  [
                    { id: 'image', label: 'Imagen' },
                    { id: 'excerpt', label: 'Fragmento' },
                    { id: 'mixed', label: 'Mixto' },
                  ] as { id: WorkFormat; label: string }[]
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormat(item.id)}
                    className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      format === item.id
                        ? 'bg-white text-[#141416] shadow-xs'
                        : 'text-zinc-600 hover:text-[#141416]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-zinc-700">
                Categorizar en Portafolio
              </label>
              {userPortfolios.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCreatingPortfolio((v) => !v)}
                  className="text-xs font-medium text-[#C83E2B] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{creatingPortfolio ? 'Elegir existente' : 'Crear nuevo portafolio'}</span>
                </button>
              )}
            </div>

            {creatingPortfolio ? (
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
                <input
                  type="text"
                  value={newPortfolioTitle}
                  onChange={(e) => setNewPortfolioTitle(e.target.value)}
                  placeholder="Nombre del portafolio (ej. Bocetos de Invierno)"
                  maxLength={80}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-sm text-[#141416] focus:outline-none focus:border-[#C83E2B]"
                />
                <input
                  type="text"
                  value={newPortfolioDesc}
                  onChange={(e) => setNewPortfolioDesc(e.target.value)}
                  placeholder="Descripción breve de esta serie o colección (opcional)"
                  maxLength={180}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-sm text-[#141416] focus:outline-none focus:border-[#C83E2B]"
                />
              </div>
            ) : (
              <select
                value={portfolioId}
                onChange={(e) => setPortfolioId(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-[#141416] focus:outline-none focus:border-[#C83E2B]"
              >
                {userPortfolios.map((pf) => (
                  <option key={pf.id} value={pf.id}>
                    {pf.title} ({pf.discipline})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Título de la obra
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Estudio de luz en carboncillo o Capítulo II: El faro"
                maxLength={120}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-[#141416] focus:outline-none focus:border-[#C83E2B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Nota de proceso o comentario del autor (opcional)
              </label>
              <textarea
                rows={2}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Comparte la técnica, el contexto de lectura o el proceso creativo..."
                maxLength={400}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-[#141416] focus:outline-none focus:border-[#C83E2B] resize-none"
              />
            </div>
          </div>

          {needsImage && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700">
                Cargar archivo de imagen
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e.target.files?.[0])}
                className="sr-only"
              />

              {imageUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50">
                  <img
                    src={imageUrl}
                    alt="Vista previa de la obra"
                    className="w-full max-h-64 object-contain mx-auto"
                  />
                  <div className="p-3 bg-white border-t border-zinc-200 flex items-center justify-between gap-2">
                    <span className="text-xs text-zinc-600 truncate">
                      {imageFileName || 'Imagen cargada'}
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-medium text-[#C83E2B] hover:underline cursor-pointer shrink-0"
                    >
                      Cambiar imagen
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFileChange(e.dataTransfer.files?.[0]);
                  }}
                  className="w-full border border-dashed border-zinc-300 hover:border-[#C83E2B] bg-zinc-50 hover:bg-zinc-100/60 rounded-xl p-8 flex flex-col items-center justify-center gap-2 text-center transition-colors cursor-pointer"
                >
                  {isProcessingImage ? (
                    <span className="text-sm font-medium text-zinc-600">
                      Optimizando imagen...
                    </span>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-600">
                        <Upload className="w-4 h-4" strokeWidth={1.75} />
                      </div>
                      <span className="text-sm font-medium text-[#141416] inline-flex items-center gap-1.5">
                        <ImagePlus className="w-4 h-4 text-[#C83E2B]" />
                        Selecciona o arrastra un archivo de imagen
                      </span>
                      <span className="text-xs text-zinc-500">
                        JPG, PNG o WebP desde tu equipo
                      </span>
                    </>
                  )}
                </button>
              )}
              {uploadError && <p className="text-xs text-[#C83E2B]">{uploadError}</p>}
            </div>
          )}

          {needsExcerpt && (
            <div className="space-y-3 p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700">
                <BookOpen className="w-4 h-4 text-[#C83E2B]" strokeWidth={1.75} />
                <span>Fragmento de texto destacado</span>
              </div>
              <textarea
                rows={4}
                required={needsExcerpt}
                value={excerptText}
                onChange={(e) => setExcerptText(e.target.value)}
                placeholder="Escribe o pega el pasaje literario, poema o cita subrayada que deseas destacar..."
                maxLength={1200}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 font-serif text-[15px] text-[#141416] focus:outline-none focus:border-[#C83E2B]"
              />
              <input
                type="text"
                value={excerptSource}
                onChange={(e) => setExcerptSource(e.target.value)}
                placeholder="Referencia, libro o capítulo (ej. Cuaderno de otoño, p. 42)"
                maxLength={120}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs text-[#141416] focus:outline-none focus:border-[#C83E2B]"
              />
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-5 py-2 text-sm font-medium text-white bg-[#C83E2B] hover:bg-[#AD3322] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
            >
              {isPublishing ? 'Publicando...' : 'Publicar obra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
