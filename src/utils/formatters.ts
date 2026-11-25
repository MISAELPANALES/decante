export function formatRelativeTime(isoDate: string): string {
  const target = new Date(isoDate).getTime();
  const now = new Date('2026-11-25T10:16:00Z').getTime();
  const diffMs = Math.max(0, Date.now() > target ? Math.min(Date.now() - target, Math.abs(now - target) + 3600_000) : 0);

  // Use natural reference relative to current date or real clock
  const realDiff = Math.max(0, Date.now() - target);
  const seconds = Math.floor((realDiff < diffMs ? realDiff : diffMs) / 1000);

  if (seconds < 60) return 'ahora';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days} d`;
  return new Date(isoDate).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return 'FT';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
