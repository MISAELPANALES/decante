import React from 'react';
import { AppView } from '../types/social';

interface HeaderProps {
  activeView: AppView;
  isAuthenticated: boolean;
  onNavigate: (view: AppView) => void;
  onOpenPublish: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  isAuthenticated,
  onNavigate,
  onOpenPublish,
}) => {
  const navItems: { id: AppView; label: string }[] = isAuthenticated
    ? [
        { id: 'feed', label: 'Feed' },
        { id: 'explore', label: 'Explorar' },
        { id: 'portfolios', label: 'Portafolios' },
        { id: 'profile', label: 'Mi Perfil' },
      ]
    : [
        { id: 'feed', label: 'Feed' },
        { id: 'explore', label: 'Explorar' },
        { id: 'portfolios', label: 'Portafolios' },
      ];

  return (
    <header className="sticky top-0 z-30 bg-[#FAFAFA]/95 backdrop-blur-sm border-b border-zinc-200">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => onNavigate(isAuthenticated ? 'feed' : 'auth')}
          className="font-serif text-xl font-semibold tracking-tight text-[#141416] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C83E2B] rounded-sm"
        >
          Folio &amp; Trazo
        </button>

        {/* Zone 2: Single-line text navigation links */}
        <nav
          aria-label="Navegación principal"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`py-1 whitespace-nowrap shrink-0 cursor-pointer border-b-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C83E2B] ${
                  isActive
                    ? 'border-[#C83E2B] text-[#141416]'
                    : 'border-transparent text-zinc-600 hover:text-[#141416] hover:border-zinc-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={onOpenPublish}
              className="px-4 py-2 text-sm font-medium text-white bg-[#C83E2B] hover:bg-[#AD3322] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C83E2B]"
            >
              Publicar obra
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('auth')}
              className="px-4 py-2 text-sm font-medium text-white bg-[#C83E2B] hover:bg-[#AD3322] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C83E2B]"
            >
              Iniciar sesión
            </button>
          )}
        </div>
      </div>

      {/* Mobile compact nav row */}
      <nav
        aria-label="Navegación móvil"
        className="flex md:hidden items-center justify-around border-t border-zinc-200/80 px-2 py-1.5 text-xs font-medium"
      >
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`px-2.5 py-1.5 whitespace-nowrap shrink-0 rounded-md transition-colors ${
                isActive ? 'text-[#C83E2B] font-semibold' : 'text-zinc-600'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
