import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';

type DisciplineTag = 'Escritor' | 'Ilustrador' | 'Lector';
type WorkFormat = 'image' | 'excerpt' | 'mixed';

interface PortfolioCollection {
  id: string;
  artistId: string;
  title: string;
  description: string;
  discipline: DisciplineTag;
  createdAt: string;
}

interface ArtistProfile {
  id: string;
  handle: string;
  name: string;
  avatarUrl: string;
  location: string;
  bio: string;
  disciplines: DisciplineTag[];
  joinedAt: string;
}

interface AuthAccountRecord {
  artistId: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

interface PostComment {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
}

interface NetworkShare {
  userId: string;
  note?: string;
  sharedAt: string;
}

interface ArtworkPost {
  id: string;
  authorId: string;
  portfolioId: string;
  discipline: DisciplineTag;
  format: WorkFormat;
  title: string;
  caption: string;
  imageUrl?: string;
  imageAlt?: string;
  excerptText?: string;
  excerptSource?: string;
  createdAt: string;
  likedByIds: string[];
  shares: NetworkShare[];
  comments: PostComment[];
}

interface DatabaseSchema {
  accounts: AuthAccountRecord[];
  artists: ArtistProfile[];
  portfolios: PortfolioCollection[];
  posts: ArtworkPost[];
  followingMap: Record<string, string[]>;
}

const VALID_DISCIPLINES: DisciplineTag[] = ['Escritor', 'Ilustrador', 'Lector'];
const VALID_FORMATS: WorkFormat[] = ['image', 'excerpt', 'mixed'];
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'social-db.json');

function createSeedDatabase(): DatabaseSchema {
  return {
    accounts: [],
    artists: [
      {
        id: 'artist-clara',
        handle: '@claramendoza',
        name: 'Clara Mendoza',
        avatarUrl: '/src/assets/images/avatar_clara_1795630585059.jpg',
        location: 'Buenos Aires',
        bio: 'Escribo relatos breves sobre memoria urbana e ilustro herbarios en tinta sumi y acuarela fría.',
        disciplines: ['Escritor', 'Ilustrador'],
        joinedAt: '2025-03-14T10:00:00Z',
      },
      {
        id: 'artist-mateo',
        handle: '@mateosilva',
        name: 'Mateo Silva',
        avatarUrl: '/src/assets/images/avatar_mateo_1795630584966.jpg',
        location: 'Madrid',
        bio: 'Ilustrador editorial y grabador. Exploro la geometría del silencio, el hormigón y la luz de tarde en gouache.',
        disciplines: ['Ilustrador', 'Lector'],
        joinedAt: '2025-01-22T12:30:00Z',
      },
      {
        id: 'artist-sofia',
        handle: '@sofianavarro',
        name: 'Sofía Navarro',
        avatarUrl: '/src/assets/images/avatar_sofia_1795630585855.jpg',
        location: 'Ciudad de México',
        bio: 'Lectora compulsiva de narrativa contemporánea y ensayo breve. Colecciono marginalia y subrayados de sobremesa.',
        disciplines: ['Lector', 'Escritor'],
        joinedAt: '2025-02-08T16:15:00Z',
      },
      {
        id: 'artist-julian',
        handle: '@julianvega',
        name: 'Julián Vega',
        avatarUrl: '',
        location: 'Bogotá',
        bio: 'Novelista en ciernes y lector nocturno. Trabajo entre cuadernos de campo, crónicas de viaje y fotografía analógica.',
        disciplines: ['Escritor', 'Lector'],
        joinedAt: '2025-04-02T09:00:00Z',
      },
    ],
    portfolios: [
      {
        id: 'pf-clara-herbario',
        artistId: 'artist-clara',
        title: 'Herbario Nocturno',
        description: 'Láminas botánicas en tinta china e índigo sobre papel de algodón de 300g.',
        discipline: 'Ilustrador',
        createdAt: '2026-06-10T09:00:00Z',
      },
      {
        id: 'pf-clara-cronicas',
        artistId: 'artist-clara',
        title: 'Crónicas de Papel',
        description: 'Fragmentos de ficción mínima, apuntes de taller y borradores de invierno.',
        discipline: 'Escritor',
        createdAt: '2026-07-18T14:20:00Z',
      },
      {
        id: 'pf-mateo-arquitectura',
        artistId: 'artist-mateo',
        title: 'Arquitectura en Silencio',
        description: 'Estudios de patios interiores, sombras diagonales y brutalismo mediterráneo en gouache.',
        discipline: 'Ilustrador',
        createdAt: '2026-05-04T11:00:00Z',
      },
      {
        id: 'pf-sofia-margenes',
        artistId: 'artist-sofia',
        title: 'Márgenes de Lectura',
        description: 'Pasajes subrayados, diálogos entre ediciones y reseñas íntimas de libros olvidados.',
        discipline: 'Lector',
        createdAt: '2026-08-01T08:45:00Z',
      },
      {
        id: 'pf-julian-cuadernos',
        artistId: 'artist-julian',
        title: 'Cuadernos de Altura',
        description: 'Prosa poética y notas de lectura escritas en trenes y cafeterías de montaña.',
        discipline: 'Escritor',
        createdAt: '2026-09-12T17:10:00Z',
      },
    ],
    followingMap: {
      'artist-clara': ['artist-mateo', 'artist-sofia'],
      'artist-mateo': ['artist-clara', 'artist-sofia'],
      'artist-sofia': ['artist-clara', 'artist-mateo', 'artist-julian'],
      'artist-julian': ['artist-clara', 'artist-sofia'],
    },
    posts: [
      {
        id: 'post-101',
        authorId: 'artist-mateo',
        portfolioId: 'pf-mateo-arquitectura',
        discipline: 'Ilustrador',
        format: 'image',
        title: 'Patio de sombra oblicua y olivo',
        caption: 'Estudio final en gouache y carboncillo prensado. Quería capturar el instante exacto en que el sol de las cinco corta el muro de hormigón sin perder la calma del árbol.',
        imageUrl: '/src/assets/images/art_brutalist_monolith_1795630583370.jpg',
        imageAlt: 'Ilustración arquitectónica en gouache de un patio de hormigón con un olivo y sombras geométricas',
        createdAt: '2026-11-25T08:30:00Z',
        likedByIds: ['artist-clara', 'artist-sofia'],
        shares: [
          {
            userId: 'artist-sofia',
            note: 'Me recuerda muchísimo a las escenas del capítulo IV de El desierto de los tártaros.',
            sharedAt: '2026-11-25T09:10:00Z',
          },
        ],
        comments: [
          {
            id: 'cmt-1',
            authorId: 'artist-clara',
            text: 'La textura del grafito sobre el hormigón quedó increíble, Mateo. Ese contraste cálido en la tierra equilibra todo el plano.',
            createdAt: '2026-11-25T08:52:00Z',
          },
        ],
      },
      {
        id: 'post-102',
        authorId: 'artist-sofia',
        portfolioId: 'pf-sofia-margenes',
        discipline: 'Lector',
        format: 'mixed',
        title: 'Notas al margen sobre el ritmo y la pausa',
        caption: 'Volviendo a leer con lápiz 2B en mano. A veces una anotación al costado de la página dice más de quien la lee que del propio libro.',
        imageUrl: '/src/assets/images/art_reading_sanctuary_1795630583807.jpg',
        imageAlt: 'Libro abierto con anotaciones a lápiz, pluma fuente de latón y taza de cerámica junto a una ventana',
        excerptText: '«No escribimos para fijar el tiempo, sino para abrir un claro en medio del ruido donde las palabras todavía pesen lo mismo que una piedra en el bolsillo.»',
        excerptSource: 'Cuaderno de notas — Edición anotada, p. 113',
        createdAt: '2026-11-24T19:40:00Z',
        likedByIds: ['artist-clara', 'artist-mateo', 'artist-julian'],
        shares: [],
        comments: [
          {
            id: 'cmt-2',
            authorId: 'artist-julian',
            text: 'Qué belleza esa frase sobre el peso de las palabras. Me la guardo para releerla antes de corregir mi próximo capítulo.',
            createdAt: '2026-11-24T20:15:00Z',
          },
        ],
      },
      {
        id: 'post-103',
        authorId: 'artist-clara',
        portfolioId: 'pf-clara-herbario',
        discipline: 'Ilustrador',
        format: 'image',
        title: 'Magnolia nocturna y helecho silvestre',
        caption: 'Lámina IV de la serie Herbario Nocturno. Tinta sumi diluida y veladuras de índigo sobre papel prensado en frío.',
        imageUrl: '/src/assets/images/art_nocturnal_botany_1795630583451.jpg',
        imageAlt: 'Ilustración botánica en tinta sumi y acuarela índigo de ramas de magnolia y helechos sobre papel blanco',
        createdAt: '2026-11-24T14:15:00Z',
        likedByIds: ['artist-mateo', 'artist-sofia'],
        shares: [
          {
            userId: 'artist-mateo',
            note: 'Delicadeza pura en el trazo de las hojas.',
            sharedAt: '2026-11-24T16:00:00Z',
          },
        ],
        comments: [
          {
            id: 'cmt-3',
            authorId: 'artist-sofia',
            text: 'Sería una portada inolvidable para una antología de poesía botánica.',
            createdAt: '2026-11-24T15:02:00Z',
          },
        ],
      },
      {
        id: 'post-104',
        authorId: 'artist-clara',
        portfolioId: 'pf-clara-cronicas',
        discipline: 'Escritor',
        format: 'excerpt',
        title: 'La casa de las persianas verdes',
        caption: 'Fragmento inicial de un relato breve sobre una archivista que hereda cartas sin remitente.',
        excerptText: 'Durante treinta años guardó las cartas en cajas de zapatos forradas con papel de estraza. Nunca abrió los sobres; le bastaba escuchar el crujido leve de la tinta seca cada vez que la lluvia golpeaba los postigos de cedro y recordar que alguien, al otro lado del océano, había elegido exactamente esas sílabas para no desaparecer.',
        excerptSource: 'Crónicas de Papel — Borrador III',
        createdAt: '2026-11-23T18:05:00Z',
        likedByIds: ['artist-sofia', 'artist-julian'],
        shares: [],
        comments: [],
      },
      {
        id: 'post-105',
        authorId: 'artist-julian',
        portfolioId: 'pf-julian-cuadernos',
        discipline: 'Escritor',
        format: 'excerpt',
        title: 'Inventario antes de la niebla',
        caption: 'Un apunte escrito esperando el primer tren hacia la cordillera. Abierto a comentarios de ritmo y cadencia.',
        excerptText: 'Antes de que baje la neblina sobre la estación, todo objeto conserva su nombre exacto: la maleta de lona, el termo abollado, el mapa doblado por la mitad como un acordeón cansado. Después solo queda la voz del viento repitiendo los números de los andenes vacíos.',
        excerptSource: 'Cuadernos de Altura — Entrada 09',
        createdAt: '2026-11-22T11:20:00Z',
        likedByIds: ['artist-sofia'],
        shares: [
          {
            userId: 'artist-sofia',
            note: 'Recomendado para quienes disfrutan la prosa breve de atmósfera.',
            sharedAt: '2026-11-25T07:45:00Z',
          },
        ],
        comments: [],
      },
    ],
  };
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as DatabaseSchema;
      if (parsed && Array.isArray(parsed.artists) && Array.isArray(parsed.posts)) {
        return parsed;
      }
    }
  } catch {
    // Fallback to seed
  }
  const seeded = createSeedDatabase();
  saveDatabase(seeded);
  return seeded;
}

function saveDatabase(db: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const resolvedTarget = path.resolve(DB_FILE);
    if (!resolvedTarget.startsWith(DATA_DIR + path.sep)) {
      return;
    }
    fs.writeFileSync(resolvedTarget, JSON.stringify(db, null, 2), 'utf-8');
  } catch {
    // Continue in memory if disk write fails
  }
}

let db: DatabaseSchema = loadDatabase();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(':');
  if (parts.length !== 2) return false;
  const [salt, originalHex] = parts;
  const derivedBuf = crypto.scryptSync(password, salt, 64);
  const originalBuf = Buffer.from(originalHex, 'hex');
  if (derivedBuf.length !== originalBuf.length) return false;
  return crypto.timingSafeEqual(derivedBuf, originalBuf);
}

function signToken(artistId: string, email: string): string {
  const payload = {
    sub: artistId,
    email,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyToken(token: string): { sub: string; email: string } | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8')) as {
      sub?: string;
      email?: string;
      exp?: number;
    };
    if (!parsed.sub || !parsed.email || !parsed.exp || Date.now() > parsed.exp) {
      return null;
    }
    return { sub: parsed.sub, email: parsed.email };
  } catch {
    return null;
  }
}

interface AuthedRequest extends Request {
  authArtistId?: string;
  authEmail?: string;
}

function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Debes iniciar sesión para realizar esta acción.' });
    return;
  }
  const token = authHeader.slice('Bearer '.length).trim();
  const verified = verifyToken(token);
  if (!verified) {
    res.status(401).json({ error: 'Tu sesión expiró o no es válida. Inicia sesión nuevamente.' });
    return;
  }
  const artistExists = db.artists.some((a) => a.id === verified.sub);
  if (!artistExists) {
    res.status(401).json({ error: 'Cuenta no encontrada.' });
    return;
  }
  req.authArtistId = verified.sub;
  req.authEmail = verified.email;
  next();
}

function normalizeEmail(raw: unknown): string {
  return typeof raw === 'string' ? raw.trim().toLowerCase() : '';
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 160;
}

function sanitizeImageUrl(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('/src/assets/')) return trimmed;
  if (/^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(trimmed)) {
    if (trimmed.length <= 2_600_000) return trimmed;
  }
  return undefined;
}

function sanitizeDisciplines(raw: unknown): DisciplineTag[] {
  if (!Array.isArray(raw)) return ['Lector'];
  const filtered = raw.filter(
    (item): item is DisciplineTag =>
      typeof item === 'string' && VALID_DISCIPLINES.includes(item as DisciplineTag)
  );
  return filtered.length > 0 ? Array.from(new Set(filtered)) : ['Lector'];
}

function getPublicSocialSnapshot() {
  return {
    artists: db.artists,
    portfolios: db.portfolios,
    posts: db.posts,
    followingMap: db.followingMap,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '4mb' }));

  // Public community snapshot (never returns accounts/emails/hashes)
  app.get('/api/social/state', (_req: Request, res: Response) => {
    res.json(getPublicSocialSnapshot());
  });

  // Register a new account with email & password
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const location = typeof req.body?.location === 'string' ? req.body.location.trim() : '';
    const bio = typeof req.body?.bio === 'string' ? req.body.bio.trim() : '';
    const disciplines = sanitizeDisciplines(req.body?.disciplines);

    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'Ingresa un correo electrónico válido.' });
      return;
    }
    if (password.length < 8 || password.length > 128) {
      res.status(400).json({ error: 'La contraseña debe tener entre 8 y 128 caracteres.' });
      return;
    }
    if (name.length < 2 || name.length > 60) {
      res.status(400).json({ error: 'Ingresa tu nombre artístico (entre 2 y 60 caracteres).' });
      return;
    }
    if (db.accounts.some((acc) => acc.email === email)) {
      res.status(409).json({ error: 'Ya existe una cuenta registrada con este correo.' });
      return;
    }

    const baseHandleSlug =
      name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 20) || 'artista';
    let handleCandidate = `@${baseHandleSlug}`;
    let suffix = 1;
    while (db.artists.some((a) => a.handle.toLowerCase() === handleCandidate.toLowerCase())) {
      handleCandidate = `@${baseHandleSlug}${suffix}`;
      suffix += 1;
    }

    const artistId = `artist-${crypto.randomUUID().slice(0, 8)}`;
    const nowIso = new Date().toISOString();

    const newArtist: ArtistProfile = {
      id: artistId,
      handle: handleCandidate,
      name,
      avatarUrl: '',
      location: location.slice(0, 60) || 'Estudio Independiente',
      bio:
        bio.slice(0, 300) ||
        `Creador en Folio & Trazo (${disciplines.join(' · ')}).`,
      disciplines,
      joinedAt: nowIso,
    };

    const starterPortfolio: PortfolioCollection = {
      id: `pf-${crypto.randomUUID().slice(0, 8)}`,
      artistId,
      title: 'Primer Portafolio',
      description: `Selección inicial de obras y lecturas de ${name}.`,
      discipline: disciplines[0],
      createdAt: nowIso,
    };

    const newAccount: AuthAccountRecord = {
      artistId,
      email,
      passwordHash: hashPassword(password),
      createdAt: nowIso,
    };

    db.accounts.push(newAccount);
    db.artists.unshift(newArtist);
    db.portfolios.unshift(starterPortfolio);
    db.followingMap[artistId] = ['artist-clara', 'artist-mateo', 'artist-sofia'];
    saveDatabase(db);

    const token = signToken(artistId, email);
    res.status(201).json({
      token,
      user: {
        artist: newArtist,
        email,
      },
      state: getPublicSocialSnapshot(),
    });
  });

  // Login with email & password
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!isValidEmail(email) || !password) {
      res.status(400).json({ error: 'Ingresa tu correo electrónico y contraseña.' });
      return;
    }

    const account = db.accounts.find((acc) => acc.email === email);
    if (!account || !verifyPassword(password, account.passwordHash)) {
      res.status(401).json({ error: 'Correo electrónico o contraseña incorrectos.' });
      return;
    }

    const artist = db.artists.find((a) => a.id === account.artistId);
    if (!artist) {
      res.status(404).json({ error: 'No se encontró el perfil asociado a esta cuenta.' });
      return;
    }

    const token = signToken(artist.id, account.email);
    res.json({
      token,
      user: {
        artist,
        email: account.email,
      },
      state: getPublicSocialSnapshot(),
    });
  });

  // Verify current session
  app.get('/api/auth/me', requireAuth, (req: AuthedRequest, res: Response) => {
    const artist = db.artists.find((a) => a.id === req.authArtistId);
    if (!artist || !req.authEmail) {
      res.status(401).json({ error: 'Sesión inválida.' });
      return;
    }
    res.json({
      user: {
        artist,
        email: req.authEmail,
      },
    });
  });

  // Update authenticated artist's own profile
  app.patch('/api/profile', requireAuth, (req: AuthedRequest, res: Response) => {
    const artist = db.artists.find((a) => a.id === req.authArtistId);
    if (!artist) {
      res.status(404).json({ error: 'Perfil no encontrado.' });
      return;
    }

    if (typeof req.body?.name === 'string' && req.body.name.trim().length >= 2) {
      artist.name = req.body.name.trim().slice(0, 60);
    }
    if (typeof req.body?.location === 'string' && req.body.location.trim().length > 0) {
      artist.location = req.body.location.trim().slice(0, 60);
    }
    if (typeof req.body?.bio === 'string') {
      artist.bio = req.body.bio.trim().slice(0, 300);
    }
    if (Array.isArray(req.body?.disciplines)) {
      artist.disciplines = sanitizeDisciplines(req.body.disciplines);
    }

    saveDatabase(db);
    res.json({ artist, state: getPublicSocialSnapshot() });
  });

  // Create a portfolio collection for the authenticated artist
  app.post('/api/portfolios', requireAuth, (req: AuthedRequest, res: Response) => {
    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    const description =
      typeof req.body?.description === 'string' ? req.body.description.trim() : '';
    const disciplineRaw = req.body?.discipline;
    const discipline: DisciplineTag = VALID_DISCIPLINES.includes(disciplineRaw)
      ? disciplineRaw
      : 'Ilustrador';

    if (title.length < 2 || title.length > 80) {
      res.status(400).json({ error: 'El nombre del portafolio debe tener entre 2 y 80 caracteres.' });
      return;
    }

    const created: PortfolioCollection = {
      id: `pf-${crypto.randomUUID().slice(0, 8)}`,
      artistId: req.authArtistId!,
      title,
      description: description.slice(0, 180),
      discipline,
      createdAt: new Date().toISOString(),
    };

    db.portfolios.unshift(created);
    saveDatabase(db);
    res.status(201).json({ portfolio: created, state: getPublicSocialSnapshot() });
  });

  // Publish an artwork / literary excerpt into an owned portfolio
  app.post('/api/posts', requireAuth, (req: AuthedRequest, res: Response) => {
    const portfolioId = typeof req.body?.portfolioId === 'string' ? req.body.portfolioId : '';
    const portfolio = db.portfolios.find(
      (p) => p.id === portfolioId && p.artistId === req.authArtistId
    );
    if (!portfolio) {
      res.status(403).json({ error: 'El portafolio seleccionado no pertenece a tu cuenta.' });
      return;
    }

    const disciplineRaw = req.body?.discipline;
    const discipline: DisciplineTag = VALID_DISCIPLINES.includes(disciplineRaw)
      ? disciplineRaw
      : portfolio.discipline;
    const formatRaw = req.body?.format;
    const format: WorkFormat = VALID_FORMATS.includes(formatRaw) ? formatRaw : 'image';

    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    const caption = typeof req.body?.caption === 'string' ? req.body.caption.trim() : '';
    const imageUrl = sanitizeImageUrl(req.body?.imageUrl);
    const imageAlt = typeof req.body?.imageAlt === 'string' ? req.body.imageAlt.trim() : '';
    const excerptText =
      typeof req.body?.excerptText === 'string' ? req.body.excerptText.trim() : '';
    const excerptSource =
      typeof req.body?.excerptSource === 'string' ? req.body.excerptSource.trim() : '';

    if (title.length < 2 || title.length > 120) {
      res.status(400).json({ error: 'El título de la obra debe tener entre 2 y 120 caracteres.' });
      return;
    }
    if ((format === 'image' || format === 'mixed') && !imageUrl) {
      res.status(400).json({ error: 'Adjunta una imagen válida (JPG, PNG o WebP).' });
      return;
    }
    if ((format === 'excerpt' || format === 'mixed') && !excerptText) {
      res.status(400).json({ error: 'Ingresa el fragmento de texto destacado.' });
      return;
    }

    const newPost: ArtworkPost = {
      id: `post-${crypto.randomUUID().slice(0, 8)}`,
      authorId: req.authArtistId!,
      portfolioId: portfolio.id,
      discipline,
      format,
      title,
      caption: caption.slice(0, 400),
      imageUrl: format === 'excerpt' ? undefined : imageUrl,
      imageAlt: imageAlt.slice(0, 140) || title,
      excerptText: format === 'image' ? undefined : excerptText.slice(0, 1200),
      excerptSource: format === 'image' ? undefined : excerptSource.slice(0, 120) || undefined,
      createdAt: new Date().toISOString(),
      likedByIds: [],
      shares: [],
      comments: [],
    };

    db.posts.unshift(newPost);
    saveDatabase(db);
    res.status(201).json({ post: newPost, state: getPublicSocialSnapshot() });
  });

  // Toggle follow artist
  app.post('/api/artists/:targetId/follow', requireAuth, (req: AuthedRequest, res: Response) => {
    const targetId = req.params.targetId;
    if (targetId === req.authArtistId) {
      res.status(400).json({ error: 'No puedes seguirte a ti mismo.' });
      return;
    }
    const targetExists = db.artists.some((a) => a.id === targetId);
    if (!targetExists) {
      res.status(404).json({ error: 'Artista no encontrado.' });
      return;
    }

    const currentList = db.followingMap[req.authArtistId!] ?? [];
    const exists = currentList.includes(targetId);
    db.followingMap[req.authArtistId!] = exists
      ? currentList.filter((id) => id !== targetId)
      : [...currentList, targetId];
    saveDatabase(db);
    res.json({ state: getPublicSocialSnapshot() });
  });

  // Toggle like on a post
  app.post('/api/posts/:postId/like', requireAuth, (req: AuthedRequest, res: Response) => {
    const post = db.posts.find((p) => p.id === req.params.postId);
    if (!post) {
      res.status(404).json({ error: 'Obra no encontrada.' });
      return;
    }
    const alreadyLiked = post.likedByIds.includes(req.authArtistId!);
    post.likedByIds = alreadyLiked
      ? post.likedByIds.filter((id) => id !== req.authArtistId!)
      : [...post.likedByIds, req.authArtistId!];
    saveDatabase(db);
    res.json({ state: getPublicSocialSnapshot() });
  });

  // Add comment to a post
  app.post('/api/posts/:postId/comments', requireAuth, (req: AuthedRequest, res: Response) => {
    const post = db.posts.find((p) => p.id === req.params.postId);
    if (!post) {
      res.status(404).json({ error: 'Obra no encontrada.' });
      return;
    }
    const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    if (text.length < 1 || text.length > 400) {
      res.status(400).json({ error: 'El comentario debe tener entre 1 y 400 caracteres.' });
      return;
    }
    post.comments.push({
      id: `cmt-${crypto.randomUUID().slice(0, 8)}`,
      authorId: req.authArtistId!,
      text,
      createdAt: new Date().toISOString(),
    });
    saveDatabase(db);
    res.status(201).json({ state: getPublicSocialSnapshot() });
  });

  // Share / repost a work inside the network
  app.post('/api/posts/:postId/share', requireAuth, (req: AuthedRequest, res: Response) => {
    const post = db.posts.find((p) => p.id === req.params.postId);
    if (!post) {
      res.status(404).json({ error: 'Obra no encontrada.' });
      return;
    }
    const note = typeof req.body?.note === 'string' ? req.body.note.trim().slice(0, 180) : '';
    const alreadyShared = post.shares.some((s) => s.userId === req.authArtistId!);
    if (alreadyShared && !note) {
      post.shares = post.shares.filter((s) => s.userId !== req.authArtistId!);
    } else {
      post.shares = [
        ...post.shares.filter((s) => s.userId !== req.authArtistId!),
        {
          userId: req.authArtistId!,
          note: note || undefined,
          sharedAt: new Date().toISOString(),
        },
      ];
    }
    saveDatabase(db);
    res.json({ state: getPublicSocialSnapshot() });
  });

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
