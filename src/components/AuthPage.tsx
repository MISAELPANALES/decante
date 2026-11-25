import React, { useState } from 'react';
import { AlertCircle, ArrowRight, Check, Eye, EyeOff } from 'lucide-react';
import { LoginInput, RegisterInput } from '../store/useSocialStore';
import { DisciplineTag } from '../types/social';
import { WorkImage } from './MediaPrimitives';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  contextNotice?: string;
  onLogin: (input: LoginInput) => Promise<void>;
  onRegister: (input: RegisterInput) => Promise<void>;
  onExplorePublic: () => void;
}

const DISCIPLINES: DisciplineTag[] = ['Escritor', 'Ilustrador', 'Lector'];

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  contextNotice,
  onLogin,
  onRegister,
  onExplorePublic,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration fields
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [disciplines, setDisciplines] = useState<DisciplineTag[]>(['Escritor']);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleDiscipline = (tag: DisciplineTag) => {
    setDisciplines((prev) => {
      if (prev.includes(tag)) {
        return prev.length > 1 ? prev.filter((item) => item !== tag) : prev;
      }
      return [...prev, tag];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await onLogin({ email, password });
      } else {
        await onRegister({
          email,
          password,
          name,
          location,
          bio,
          disciplines,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al autenticar.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
        {/* Left Column: Editorial Statement + Visual Showcase */}
        <section className="lg:col-span-6 flex flex-col justify-between bg-white border border-zinc-200/90 rounded-2xl overflow-hidden">
          <div className="p-6 sm:p-8 space-y-4">
            <p className="text-xs font-medium text-[#C83E2B]">
              Escritores · Ilustradores · Lectores
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#141416]">
              Un espacio sereno para mostrar tu portafolio y dialogar sobre obras
            </h1>
            <p className="text-[15px] text-zinc-600 leading-relaxed max-w-[54ch]">
              Organiza tus ilustraciones, relatos y lecturas anotadas en colecciones temáticas, sigue a creadores afines y comparte hallazgos dentro de la red.
            </p>
          </div>

          <div className="px-6 sm:px-8 pb-6 sm:pb-8 flex-1 flex flex-col justify-end">
            <div className="relative overflow-hidden rounded-xl border border-zinc-200/80 aspect-[4/3]">
              <WorkImage
                src="/src/assets/images/art_reading_sanctuary_1795630583807.jpg"
                alt="Mesa de lectura con libro anotado, pluma fuente y luz de mañana"
                title="Archivo editorial"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 text-white">
                <p className="font-serif text-base font-medium">
                  Archivo de lecturas, bocetos y fragmentos compartidos
                </p>
                <p className="text-xs text-zinc-200 mt-0.5">
                  Cada cuenta incluye su perfil personal y portafolios categorizados
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Login & Registration Form */}
        <section className="lg:col-span-6 bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Segmented Mode Switcher */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div
                role="tablist"
                aria-label="Acceso de usuario"
                className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'login'}
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className={`px-4 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    mode === 'login'
                      ? 'bg-white text-[#141416] shadow-xs'
                      : 'text-zinc-600 hover:text-[#141416]'
                  }`}
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'register'}
                  onClick={() => {
                    setMode('register');
                    setError('');
                  }}
                  className={`px-4 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    mode === 'register'
                      ? 'bg-white text-[#141416] shadow-xs'
                      : 'text-zinc-600 hover:text-[#141416]'
                  }`}
                >
                  Crear cuenta
                </button>
              </div>

              <button
                type="button"
                onClick={onExplorePublic}
                className="text-xs font-medium text-zinc-600 hover:text-[#C83E2B] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <span>Explorar galería</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#141416]">
                {mode === 'login'
                  ? 'Ingresa con tu correo electrónico'
                  : 'Crea tu perfil de artista o lector'}
              </h2>
              <p className="text-sm text-zinc-500 mt-1">
                {mode === 'login'
                  ? 'Accede a tus portafolios, publicaciones y artistas seguidos.'
                  : 'Registra tu correo para publicar obras, organizar portafolios y conectar.'}
              </p>
            </div>

            {contextNotice && (
              <div className="bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-xs text-zinc-700">
                {contextNotice}
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="bg-[#C83E2B]/8 border border-[#C83E2B]/25 rounded-lg px-3.5 py-2.5 text-xs text-[#9E2A1B] flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 text-[#C83E2B] shrink-0 mt-0.5" strokeWidth={1.75} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="auth-name"
                      className="block text-xs font-semibold text-zinc-700 mb-1.5"
                    >
                      Nombre artístico
                    </label>
                    <input
                      id="auth-name"
                      type="text"
                      required
                      minLength={2}
                      maxLength={60}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej. Elena Ríos"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-[#141416] focus:bg-white focus:outline-none focus:border-[#C83E2B]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="auth-location"
                      className="block text-xs font-semibold text-zinc-700 mb-1.5"
                    >
                      Ciudad o estudio (opcional)
                    </label>
                    <input
                      id="auth-location"
                      type="text"
                      maxLength={60}
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ej. Montevideo"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-[#141416] focus:bg-white focus:outline-none focus:border-[#C83E2B]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="auth-email"
                  className="block text-xs font-semibold text-zinc-700 mb-1.5"
                >
                  Correo electrónico
                </label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-[#141416] focus:bg-white focus:outline-none focus:border-[#C83E2B]"
                />
              </div>

              <div>
                <label
                  htmlFor="auth-password"
                  className="block text-xs font-semibold text-zinc-700 mb-1.5"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={mode === 'register' ? 8 : 1}
                    maxLength={128}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      mode === 'register' ? 'Mínimo 8 caracteres' : 'Ingresa tu contraseña'
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-3.5 pr-10 py-2.5 text-sm text-[#141416] focus:bg-white focus:outline-none focus:border-[#C83E2B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" strokeWidth={1.75} />
                    ) : (
                      <Eye className="w-4 h-4" strokeWidth={1.75} />
                    )}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      Etiquetas de perfil (elige al menos una)
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {DISCIPLINES.map((tag) => {
                        const active = disciplines.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleDiscipline(tag)}
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

                  <div>
                    <label
                      htmlFor="auth-bio"
                      className="block text-xs font-semibold text-zinc-700 mb-1.5"
                    >
                      Biografía breve (opcional)
                    </label>
                    <textarea
                      id="auth-bio"
                      rows={2}
                      maxLength={300}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Cuéntanos qué escribes, ilustras o lees..."
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-sm text-[#141416] focus:bg-white focus:outline-none focus:border-[#C83E2B] resize-none"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 text-sm font-medium text-white bg-[#C83E2B] hover:bg-[#AD3322] disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
              >
                {submitting
                  ? 'Procesando...'
                  : mode === 'login'
                  ? 'Iniciar sesión'
                  : 'Crear cuenta y entrar'}
              </button>
            </form>
          </div>

          <div className="pt-6 mt-6 border-t border-zinc-100 flex items-center justify-between gap-2 text-xs text-zinc-500">
            <span>
              {mode === 'login' ? '¿Aún no tienes cuenta?' : '¿Ya tienes una cuenta registrada?'}
            </span>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
              className="font-medium text-[#C83E2B] hover:underline cursor-pointer"
            >
              {mode === 'login' ? 'Regístrate con tu correo' : 'Inicia sesión aquí'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
