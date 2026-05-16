
/* ═══════════════════════════════════════════
   STATIC DATA — BLOG POSTS
   ═══════════════════════════════════════════ */
const BLOGS = [];

const DEFAULT_FILTERS = [
  { label: 'All', tag: 'all' },
  { label: 'Europe', tag: 'europe' },
  { label: 'Asia', tag: 'asia' },
  { label: 'Food', tag: 'food' },
  { label: 'Budget', tag: 'budget' },
  { label: 'Culture', tag: 'culture' }
];
let FILTERS = [...DEFAULT_FILTERS];
const HOME_FILTER_ALIASES = {
  food: ['food', 'foodie', 'culinary', 'street-food', 'food-and-drink', 'gastronomy'],
  budget: ['budget', 'affordable', 'cheap', 'backpacking', 'backpacker'],
  culture: ['culture', 'cultural', 'heritage', 'historic', 'history', 'museum', 'art'],
  europe: ['europe'],
  asia: ['asia']
};
const CONTINENT_TAGS = ['africa', 'antarctica', 'asia', 'europe', 'north-america', 'south-america', 'oceania'];
const COUNTRY_TO_CONTINENT = {
  india: 'asia',
  japan: 'asia',
  thailand: 'asia',
  indonesia: 'asia',
  vietnam: 'asia',
  singapore: 'asia',
  malaysia: 'asia',
  china: 'asia',
  nepal: 'asia',
  'sri-lanka': 'asia',
  uae: 'asia',
  netherlands: 'europe',
  'czech-republic': 'europe',
  czechia: 'europe',
  france: 'europe',
  italy: 'europe',
  spain: 'europe',
  portugal: 'europe',
  germany: 'europe',
  austria: 'europe',
  greece: 'europe',
  switzerland: 'europe',
  belgium: 'europe',
  croatia: 'europe',
  'united-kingdom': 'europe',
  uk: 'europe',
  ireland: 'europe',
  norway: 'europe',
  sweden: 'europe',
  finland: 'europe',
  denmark: 'europe',
  usa: 'north-america',
  'united-states': 'north-america',
  canada: 'north-america',
  mexico: 'north-america',
  brazil: 'south-america',
  peru: 'south-america',
  argentina: 'south-america',
  chile: 'south-america',
  colombia: 'south-america',
  morocco: 'africa',
  egypt: 'africa',
  'south-africa': 'africa',
  kenya: 'africa',
  tanzania: 'africa',
  australia: 'oceania',
  'new-zealand': 'oceania'
};

let activeFilter = 'all';
let advancedFilters = {
  continent: 'all',
  country: 'all',
  budgetRange: 'all',
  itineraryLength: 'all',
  travelStyle: 'all',
  smartScore: 'all',
  smartScoreMin: 'all',
  finalScore: 'all'
};
const SMART_SCORE_OPTIONS = [
  { key: 'walkability', label: 'Walkability' },
  { key: 'affordability', label: 'Affordability' },
  { key: 'safety', label: 'Safety' },
  { key: 'food', label: 'Food' },
  { key: 'culture', label: 'Culture' },
  { key: 'nightlife', label: 'Nightlife' },
  { key: 'nature', label: 'Nature' },
  { key: 'connectivity', label: 'Connectivity' },
  { key: 'familyFriendly', label: 'Family Friendly' }
];
const SMART_SCORE_MIN_OPTIONS = ['7', '8', '9'];
const FINAL_SCORE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: '7.5', label: 'Strong Match 7.5+' },
  { value: '8', label: 'Great Match 8+' },
  { value: '8.5', label: 'Best Match 8.5+' }
];
const CURRENCY_SYMBOLS = {
  AED: 'د.إ',
  AUD: 'A$',
  BRL: 'R$',
  CAD: 'C$',
  CHF: 'CHF',
  CNY: '¥',
  CZK: 'Kc',
  DKK: 'kr',
  EGP: 'E£',
  EUR: '€',
  GBP: '£',
  HKD: 'HK$',
  IDR: 'Rp',
  INR: '₹',
  JPY: '¥',
  KES: 'KSh',
  MAD: 'MAD',
  MXN: 'MX$',
  MYR: 'RM',
  NOK: 'kr',
  NZD: 'NZ$',
  PLN: 'zl',
  SAR: 'SAR',
  SEK: 'kr',
  SGD: 'S$',
  THB: '฿',
  TRY: '₺',
  USD: '$',
  VND: '₫',
  ZAR: 'R'
};
const GENERATED_BLOGS_KEY = 'smilesandpostcards.generatedBlogs.v1';
const CACHE_VERSION = 'v2';
const CACHE_TTL_MS = 60 * 60 * 1000;
const CITIES_DATASET_CACHE_KEY = `smilesandpostcards.cache.${CACHE_VERSION}.citiesDataset`;
const FILTER_RESULTS_CACHE_KEY = `smilesandpostcards.cache.${CACHE_VERSION}.filterResults`;
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyA0kSb-V1yZuq_j4gUCUC43GD-UK1Wzfh0",
  authDomain: "travelwebsite-d2716.firebaseapp.com",
  projectId: "travelwebsite-d2716",
  storageBucket: "travelwebsite-d2716.firebasestorage.app",
  messagingSenderId: "1096145054146",
  appId: "1:1096145054146:web:bf2039f6d149ff31af4e5b",
  measurementId: "G-HPH5NHBT8M"
};
let GENERATED_BLOGS = [];
let FIRESTORE_DB = null;
let DATA_UNSUBSCRIBES = [];
const IMAGE_FALLBACKS = {
  card: [
    'https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=90&w=2200',
    'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=90&w=2200',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=90&w=2200'
  ],
  hero: [
    'https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=90&w=3000',
    'https://images.unsplash.com/photo-1491557345352-5929e343eb89?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=90&w=3000',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=90&w=3000'
  ],
  food: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=1200&q=80'
};

function isFirebaseConfigured() {
  return FIREBASE_CONFIG.apiKey && !FIREBASE_CONFIG.apiKey.includes('PASTE_') && window.firebase;
}

function getFirestore() {
  if (!isFirebaseConfigured()) return null;
  if (!FIRESTORE_DB) {
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    FIRESTORE_DB = firebase.firestore();
  }
  return FIRESTORE_DB;
}

function getGeneratedBlogs() {
  if (GENERATED_BLOGS.length) return GENERATED_BLOGS;
  const cachedDataset = readCitiesDatasetCache();
  if (cachedDataset?.length) return cachedDataset;
  try {
    const stored = JSON.parse(localStorage.getItem(GENERATED_BLOGS_KEY) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch (error) {
    console.warn('Unable to load generated Smiles and Postcards posts.', error);
    return [];
  }
}

function getAllBlogs() {
  return [...BLOGS, ...getGeneratedBlogs()];
}

function getCityId(blog) {
  return blog?.cityId || blog?.id || '';
}

function slugify(value) {
  return String(value || 'destination')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'destination';
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function readJsonStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn(`Unable to read local cache for ${key}.`, error);
    return fallback;
  }
}

function writeJsonStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Unable to write local cache for ${key}.`, error);
  }
}

function removeStorageKey(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Unable to clear local cache for ${key}.`, error);
  }
}

function readCitiesDatasetCache() {
  const entry = readJsonStorage(CITIES_DATASET_CACHE_KEY);
  if (!entry || entry.version !== CACHE_VERSION || !Array.isArray(entry.value)) return null;
  if (Number(entry.expiresAt || 0) <= Date.now()) {
    removeStorageKey(CITIES_DATASET_CACHE_KEY);
    return null;
  }
  return entry.value;
}

function writeCitiesDatasetCache(value) {
  writeJsonStorage(CITIES_DATASET_CACHE_KEY, {
    version: CACHE_VERSION,
    cachedAt: Date.now(),
    expiresAt: Date.now() + CACHE_TTL_MS,
    value
  });
}

function readFilterResultsCache() {
  const entry = readJsonStorage(FILTER_RESULTS_CACHE_KEY, {});
  if (!entry || entry.version !== CACHE_VERSION || typeof entry.items !== 'object' || !entry.items) {
    return {};
  }

  const next = {};
  Object.entries(entry.items).forEach(([key, item]) => {
    if (!item || !Array.isArray(item.value)) return;
    if (Number(item.expiresAt || 0) <= Date.now()) return;
    next[key] = item;
  });

  if (Object.keys(next).length !== Object.keys(entry.items).length) {
    writeJsonStorage(FILTER_RESULTS_CACHE_KEY, {
      version: CACHE_VERSION,
      items: next
    });
  }

  return next;
}

function writeFilterResultsCache(items) {
  writeJsonStorage(FILTER_RESULTS_CACHE_KEY, {
    version: CACHE_VERSION,
    items
  });
}

function clearFilterResultsCache() {
  removeStorageKey(FILTER_RESULTS_CACHE_KEY);
}

function buildFilterCacheKey() {
  return `${CACHE_VERSION}:${JSON.stringify({
    activeFilter,
    advancedFilters
  })}`;
}

function getCachedFilterResult(cacheKey) {
  return readFilterResultsCache()[cacheKey]?.value || null;
}

function setCachedFilterResult(cacheKey, value) {
  const items = readFilterResultsCache();
  items[cacheKey] = {
    cachedAt: Date.now(),
    expiresAt: Date.now() + CACHE_TTL_MS,
    value
  };
  writeFilterResultsCache(items);
}

function inferContinentTag(country, tags, city) {
  const existing = (tags || []).find(tag => CONTINENT_TAGS.includes(tag));
  if (existing) return existing;
  const countryKey = slugify(country);
  if (COUNTRY_TO_CONTINENT[countryKey]) return COUNTRY_TO_CONTINENT[countryKey];
  const cityKey = slugify(city);
  if (COUNTRY_TO_CONTINENT[cityKey]) return COUNTRY_TO_CONTINENT[cityKey];
  return null;
}

function normalizeTags(country, rawTags, city) {
  const tags = ensureArray(rawTags).map(slugify).filter(Boolean);
  const unique = [...new Set(tags)];
  const continent = inferContinentTag(country, unique, city);
  if (continent && !unique.includes(continent)) unique.unshift(continent);
  return unique;
}

function formatWalkScore(value) {
  const raw = String(value || '').trim();
  const match = raw.match(/\d+/);
  if (!match) return '80/100';
  const numeric = Math.max(0, Math.min(100, Number(match[0])));
  return `${numeric}/100`;
}

function clampScore(value, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(1, Math.min(10, numeric));
}

function getCurrencySymbol(currency) {
  return CURRENCY_SYMBOLS[String(currency || '').toUpperCase()] || '';
}

function deriveBudgetSymbol(blog) {
  const budget = String(blog?.budget || '');
  const currencySymbol = getCurrencySymbol(blog?.meta?.currency);
  if (currencySymbol) return currencySymbol;
  if (budget.includes('₹')) return '₹';
  if (budget.includes('฿')) return '฿';
  if (budget.includes('₫')) return '₫';
  if (budget.includes('Rp')) return 'Rp';
  if (budget.includes('د.إ')) return 'د.إ';
  if (budget.includes('€')) return '€';
  if (budget.includes('£')) return '£';
  if (budget.includes('¥')) return '¥';
  if (budget.includes('CHF')) return 'CHF';
  return '$';
}

function formatBudgetPreview(blog) {
  const budget = String(blog?.budget || '').trim();
  const symbol = blog?.budgetSymbol || deriveBudgetSymbol(blog);
  if (!budget) return symbol || '$';
  if (/[$€£¥₹฿₫]/.test(budget) || budget.includes('Rp') || budget.includes('د.إ') || budget.includes('CHF')) return budget;
  return symbol ? `${symbol}${budget.replace(/^[A-Z]{3}\s*/i, '').trim()}` : budget;
}

function getScoreLabel(score) {
  if (score >= 9) return 'Excellent';
  if (score >= 8) return 'High';
  if (score >= 6.5) return 'Moderate';
  if (score >= 5) return 'Mixed';
  return 'Low';
}

function getVibeIndicator(blog) {
  const finalScore = Number(blog?.finalScore) || 0;
  const scores = blog?.scores || {};
  if (finalScore >= 8.6 && clampScore(scores.affordability, 7) <= 6) return 'Luxury Escape';
  if (clampScore(scores.nightlife, 6) >= 8 && blog?.experience?.pace === 'fast') return 'Fast-Paced City Break';
  if (clampScore(scores.culture, 8) >= 8 && clampScore(scores.walkability, 7) >= 7) return 'Chill and Cultural';
  if (clampScore(scores.nature, 6) >= 8) return 'Scenic Slow Reset';
  if (clampScore(scores.affordability, 7) >= 8 && clampScore(scores.food, 8) >= 8) return 'Budget Foodie Adventure';
  if (clampScore(scores.safety, 7) >= 8 && clampScore(scores.familyFriendly, 7) >= 8) return 'Easygoing Family Escape';
  return finalScore >= 8 ? 'Well-Rounded City Escape' : 'Curious Urban Detour';
}

function getSnapshotSummary(blog) {
  const scores = blog?.scores || {};
  return [
    { label: 'Walkability', value: getScoreLabel(clampScore(scores.walkability, 7)) },
    { label: 'Food', value: getScoreLabel(clampScore(scores.food, 8)) },
    { label: 'Safety', value: getScoreLabel(clampScore(scores.safety, 7)) },
    { label: 'Affordability', value: getScoreLabel(clampScore(scores.affordability, 7)) }
  ];
}

function getBreakdownScores(blog) {
  const scores = blog?.scores || {};
  return [
    ['Walkability', clampScore(scores.walkability, 7)],
    ['Food', clampScore(scores.food, 8)],
    ['Safety', clampScore(scores.safety, 7)],
    ['Affordability', clampScore(scores.affordability, 7)],
    ['Culture', clampScore(scores.culture, 8)],
    ['Nightlife', clampScore(scores.nightlife, 6)]
  ];
}

function computeMatchToTravelStyle(travelStyles) {
  const count = ensureArray(travelStyles).length;
  return Math.max(6, Math.min(10, 5 + count));
}

function computeFinalScore(scores, travelStyles) {
  const safeScores = scores || {};
  const finalScore =
    (clampScore(safeScores.walkability, 7) * 0.15) +
    (clampScore(safeScores.food, 8) * 0.20) +
    (clampScore(safeScores.safety, 7) * 0.15) +
    (clampScore(safeScores.culture, 8) * 0.15) +
    (clampScore(safeScores.affordability, 7) * 0.15) +
    (computeMatchToTravelStyle(travelStyles) * 0.20);
  return Number(finalScore.toFixed(2));
}

function parseBudgetValue(budget) {
  const raw = String(budget || '').replace(/,/g, '');
  const match = raw.match(/(\d+(\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

function getBudgetRange(value) {
  if (value == null) return 'unknown';
  if (value < 50) return 'budget';
  if (value <= 120) return 'mid';
  return 'luxury';
}

function getItineraryBucket(days) {
  if (days <= 3) return 'short';
  if (days <= 6) return 'medium';
  return 'long';
}

function getBudgetTier(blog) {
  const range = getBudgetRange(parseBudgetValue(blog?.budget));
  if (range === 'budget') return '$';
  if (range === 'mid') return '$$';
  if (range === 'luxury') return '$$$';
  const affordability = clampScore(blog?.scores?.affordability, 7);
  if (affordability >= 8) return '$';
  if (affordability >= 6) return '$$';
  return '$$$';
}

function normalizeLoadedBlog(blog) {
  const normalizedScores = {
    walkability: clampScore(blog?.scores?.walkability, 7),
    affordability: clampScore(blog?.scores?.affordability, 7),
    safety: clampScore(blog?.scores?.safety, 7),
    nightlife: clampScore(blog?.scores?.nightlife, 6),
    food: clampScore(blog?.scores?.food, 8),
    culture: clampScore(blog?.scores?.culture, 8),
    nature: clampScore(blog?.scores?.nature, 6),
    connectivity: clampScore(blog?.scores?.connectivity, 7),
    familyFriendly: clampScore(blog?.scores?.familyFriendly, 7)
  };
  return {
    ...blog,
    cityId: blog.cityId || blog.id,
    showOnHome: blog.showOnHome !== false && blog.pinned !== false,
    pinned: blog.showOnHome !== false && blog.pinned !== false,
    tags: normalizeTags(blog.country, blog.tags, blog.city),
    stats: blog.stats ? { ...blog.stats, walkScore: formatWalkScore(blog.stats.walkScore) } : blog.stats,
    meta: {
      ...(blog.meta || {}),
      continent: blog?.meta?.continent || inferContinentTag(blog.country, blog.tags, blog.city) || ''
    },
    scores: normalizedScores,
    travelStyles: ensureArray(blog.travelStyles).map(slugify),
    experience: {
      pace: blog?.experience?.pace || 'moderate',
      crowdLevel: blog?.experience?.crowdLevel || 'medium',
      seasonality: blog?.experience?.seasonality || 'stable',
      difficulty: blog?.experience?.difficulty || 'easy'
    },
    finalScore: Number.isFinite(Number(blog.finalScore)) ? Number(blog.finalScore) : computeFinalScore(normalizedScores, blog.travelStyles),
    budgetSymbol: blog.budgetSymbol || deriveBudgetSymbol(blog)
  };
}

function normalizePlaceEntity(place, fallbackKind = 'place') {
  if (!place) return null;
  if (typeof place === 'string') {
    return {
      id: '',
      cityId: '',
      kind: fallbackKind,
      name: place,
      desc: '',
      tip: '',
      cuisine: '',
      price: '',
      image: ''
    };
  }
  return {
    id: place.id || '',
    cityId: place.cityId || '',
    kind: place.kind || fallbackKind,
    name: place.name || place.title || '',
    desc: place.desc || '',
    tip: place.tip || '',
    cuisine: place.cuisine || '',
    price: place.price || '',
    image: place.image || ''
  };
}

function buildPlacesById(placesSnapshot) {
  const map = new Map();
  (placesSnapshot?.docs || []).forEach(doc => {
    map.set(doc.id, normalizePlaceEntity({ id: doc.id, ...(doc.data() || {}) }, doc.data()?.kind || 'place'));
  });
  return map;
}

function resolvePlaceRefs(refs, placesById, fallbackKind) {
  return ensureArray(refs)
    .map(ref => {
      if (typeof ref === 'string' && placesById.has(ref)) return placesById.get(ref);
      return normalizePlaceEntity(ref, fallbackKind);
    })
    .filter(place => place && place.name);
}

function resolveItineraryDays(itinerary, placesById) {
  return ensureArray(itinerary).map(day => {
    const resolvedSpots = resolvePlaceRefs(day?.spots, placesById, 'itinerary');
    return {
      ...day,
      spots: resolvedSpots.map(place => place.name),
      spotIds: resolvedSpots.map(place => place.id).filter(Boolean),
      spotDetails: resolvedSpots
    };
  });
}

function combineCityAndItinerary(cityDoc, itineraryDoc, placesById = new Map()) {
  const cityData = cityDoc?.data ? cityDoc.data() : cityDoc || {};
  const itineraryData = itineraryDoc?.data ? itineraryDoc.data() : itineraryDoc || {};
  const resolvedFood = resolvePlaceRefs(
    ensureArray(itineraryData.food).length ? itineraryData.food : cityData.food,
    placesById,
    'food'
  );
  const resolvedGems = resolvePlaceRefs(
    ensureArray(itineraryData.gems).length ? itineraryData.gems : cityData.gems,
    placesById,
    'gem'
  );
  return normalizeLoadedBlog({
    id: cityDoc?.id || cityData.id || itineraryData.cityId,
    cityId: cityDoc?.id || cityData.id || itineraryData.cityId,
    ...cityData,
    days: itineraryData.days ?? cityData.days ?? 3,
    travelStyles: itineraryData.travelStyles || cityData.travelStyles || [],
    itinerary: resolveItineraryDays(itineraryData.itinerary || cityData.itinerary || [], placesById),
    food: resolvedFood,
    gems: resolvedGems,
    placeIds: [...new Set([
      ...resolvedFood.map(place => place.id).filter(Boolean),
      ...resolvedGems.map(place => place.id).filter(Boolean),
      ...ensureArray(itineraryData.itinerary).flatMap(day => ensureArray(day?.spots)).filter(ref => typeof ref === 'string' && placesById.has(ref))
    ])]
  });
}

function buildStructuredBlogs(citiesSnapshot, itinerariesSnapshot, placesSnapshot) {
  const itineraryByCityId = new Map();
  const placesById = buildPlacesById(placesSnapshot);
  (itinerariesSnapshot?.docs || []).forEach(doc => {
    const data = doc.data() || {};
    if (!data.cityId) return;
    const previous = itineraryByCityId.get(data.cityId);
    if (!previous || getPostSortTime(data) >= getPostSortTime(previous.data())) {
      itineraryByCityId.set(data.cityId, doc);
    }
  });
  return (citiesSnapshot?.docs || []).map(cityDoc => combineCityAndItinerary(cityDoc, itineraryByCityId.get(cityDoc.id), placesById));
}

function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function hashString(value) {
  return String(value || '').split('').reduce((acc, ch) => ((acc * 31) + ch.charCodeAt(0)) >>> 0, 0);
}

function getFallbackImage(type, city) {
  const pool = IMAGE_FALLBACKS[type] || IMAGE_FALLBACKS.card;
  if (Array.isArray(pool)) {
    return pool[hashString(city || type) % pool.length];
  }
  return pool;
}

function attachFallbackImage(img, fallbackType) {
  if (!img) return;
  const fallback = getFallbackImage(fallbackType, img.alt || '');
  if (img.dataset.fallbackApplied === 'true') return;
  img.dataset.fallbackApplied = 'true';
  img.src = fallback;
}

function getPostSortTime(post) {
  const value = post && post.createdAt;
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value.seconds === 'number') return value.seconds * 1000;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function sortPostsByCreatedAt(posts) {
  return [...posts].sort((a, b) => getPostSortTime(b) - getPostSortTime(a));
}

async function loadGeneratedBlogs() {
  const cachedBlogs = readCitiesDatasetCache();
  if (cachedBlogs?.length) {
    GENERATED_BLOGS = sortPostsByCreatedAt(cachedBlogs.map(normalizeLoadedBlog));
    return;
  }

  try {
    const db = getFirestore();
    if (!db) throw new Error('Firebase is not configured yet.');
    const [citiesSnapshot, itinerariesSnapshot, placesSnapshot] = await Promise.all([
      db.collection('cities').get(),
      db.collection('itineraries').get(),
      db.collection('places').get()
    ]);
    if (citiesSnapshot.docs.length) {
      GENERATED_BLOGS = sortPostsByCreatedAt(buildStructuredBlogs(citiesSnapshot, itinerariesSnapshot, placesSnapshot));
    } else {
      const postsSnapshot = await db.collection('posts').get();
      GENERATED_BLOGS = sortPostsByCreatedAt(postsSnapshot.docs.map(doc => normalizeLoadedBlog({ id: doc.id, ...doc.data() })));
    }
    clearFilterResultsCache();
    writeCitiesDatasetCache(GENERATED_BLOGS);
    localStorage.setItem(GENERATED_BLOGS_KEY, JSON.stringify(GENERATED_BLOGS));
  } catch (error) {
    console.info('Using local generated Smiles and Postcards posts fallback until Firebase is configured.', error);
    GENERATED_BLOGS = getGeneratedBlogs();
  }
}

async function loadHomepageFilters() {
  try {
    const db = getFirestore();
    if (!db) throw new Error('Firebase is not configured yet.');
    const doc = await db.collection('siteConfig').doc('homepage').get();
    const filterTags = doc.exists && Array.isArray(doc.data()?.filterTags) && doc.data().filterTags.length
      ? doc.data().filterTags
      : DEFAULT_FILTERS.filter(filter => filter.tag !== 'all').map(filter => filter.tag);
    FILTERS = [
      { label: 'All', tag: 'all' },
      ...filterTags.map(tag => ({ label: tag.replace(/-/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase()), tag }))
    ];
  } catch (error) {
    console.info('Using default homepage filters.', error);
    FILTERS = [...DEFAULT_FILTERS];
  }
}

function subscribeToGeneratedBlogs() {
  DATA_UNSUBSCRIBES.forEach(unsub => unsub && unsub());
  DATA_UNSUBSCRIBES = [];
}

/* ═══════════════════════════════════════════
   RENDER FUNCTIONS
   ═══════════════════════════════════════════ */
function renderFilters() {
  const bar = document.getElementById('filter-bar');
  if (!bar) return;

  bar.innerHTML = FILTERS.map(filter => `
    <button class="filter-chip ${activeFilter === filter.tag ? 'active' : ''}" type="button" onclick="setFilter('${filter.tag}')">
      ${filter.label}
    </button>
  `).join('');
}

function renderAdvancedFilters() {
  const visibleBlogs = getAllBlogs().filter(blog => blog.showOnHome !== false && blog.pinned !== false);
  const continents = [...new Set(visibleBlogs.map(blog => blog?.meta?.continent).filter(Boolean))].sort();
  const countries = [...new Set(visibleBlogs.map(blog => blog.country).filter(Boolean))].sort();
  const travelStyles = [...new Set(visibleBlogs.flatMap(blog => ensureArray(blog.travelStyles)).filter(Boolean))].sort();

  const renderOptions = (id, values, current, formatter = value => value) => {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = [`<option value="all">All</option>`, ...values.map(value => `<option value="${value}" ${current === value ? 'selected' : ''}>${formatter(value)}</option>`)].join('');
  };

  renderOptions('filter-continent', continents, advancedFilters.continent, value => value.replace(/-/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase()));
  renderOptions('filter-country', countries, advancedFilters.country);
  renderOptions('filter-budget-range', ['budget', 'mid', 'luxury'], advancedFilters.budgetRange, value => ({ budget: 'Under 50/day', mid: '50-120/day', luxury: '120+/day' }[value]));
  renderOptions('filter-itinerary', ['short', 'medium', 'long'], advancedFilters.itineraryLength, value => ({ short: '1-3 days', medium: '4-6 days', long: '7+ days' }[value]));
  renderOptions('filter-travel-style', travelStyles, advancedFilters.travelStyle, value => value.replace(/_/g, ' '));
  renderOptions('filter-smart-score', SMART_SCORE_OPTIONS.map(option => option.key), advancedFilters.smartScore, value => SMART_SCORE_OPTIONS.find(option => option.key === value)?.label || value);
  renderOptions('filter-smart-score-min', SMART_SCORE_MIN_OPTIONS, advancedFilters.smartScoreMin, value => `${value}+ on selected score`);
  renderOptions('filter-final-score', FINAL_SCORE_OPTIONS.slice(1).map(option => option.value), advancedFilters.finalScore, value => FINAL_SCORE_OPTIONS.find(option => option.value === value)?.label || value);
}

function setFilter(tag) {
  activeFilter = tag;
  renderFilters();
  renderBlogGrid();
}

function setAdvancedFilter(key, value) {
  advancedFilters[key] = value;
  renderBlogGrid();
}

function resetAdvancedFilters() {
  advancedFilters = {
    continent: 'all',
    country: 'all',
    budgetRange: 'all',
    itineraryLength: 'all',
    travelStyle: 'all',
    smartScore: 'all',
    smartScoreMin: 'all',
    finalScore: 'all'
  };
  renderAdvancedFilters();
  renderBlogGrid();
}

function matchesAdvancedFilters(blog) {
  const budgetRange = getBudgetRange(parseBudgetValue(blog.budget));
  const itineraryLength = getItineraryBucket(Number(blog.days) || 0);
  const travelStyles = ensureArray(blog.travelStyles);
  const smartScoreValue = advancedFilters.smartScore === 'all'
    ? null
    : clampScore(blog?.scores?.[advancedFilters.smartScore], 7);
  const smartScoreMin = advancedFilters.smartScoreMin === 'all' ? null : Number(advancedFilters.smartScoreMin);
  const finalScoreMin = advancedFilters.finalScore === 'all' ? null : Number(advancedFilters.finalScore);
  return (
    (advancedFilters.continent === 'all' || blog?.meta?.continent === advancedFilters.continent) &&
    (advancedFilters.country === 'all' || blog.country === advancedFilters.country) &&
    (advancedFilters.budgetRange === 'all' || budgetRange === advancedFilters.budgetRange) &&
    (advancedFilters.itineraryLength === 'all' || itineraryLength === advancedFilters.itineraryLength) &&
    (advancedFilters.travelStyle === 'all' || travelStyles.includes(advancedFilters.travelStyle)) &&
    (advancedFilters.smartScore === 'all' || smartScoreValue != null) &&
    (smartScoreMin == null || advancedFilters.smartScore === 'all' || smartScoreValue >= smartScoreMin) &&
    (finalScoreMin == null || Number(blog.finalScore || 0) >= finalScoreMin)
  );
}

function getCardMood(blog) {
  const season = blog.bestSeason ? blog.bestSeason.split(',')[0] : 'Year-round';
  return `${blog.days} days • Best in ${season}`;
}

function getSearchScore(blog, query) {
  const city = String(blog.city || '').toLowerCase();
  const country = String(blog.country || '').toLowerCase();
  const title = String(blog.title || '').toLowerCase();
  const excerpt = String(blog.excerpt || '').toLowerCase();
  const tags = Array.isArray(blog.tags) ? blog.tags.join(' ').toLowerCase() : '';

  if (city.startsWith(query)) return 0;
  if (city.includes(query)) return 1;
  if (country.startsWith(query)) return 2;
  if (country.includes(query)) return 3;
  if (title.includes(query)) return 4;
  if (tags.includes(query)) return 5;
  if (excerpt.includes(query)) return 6;
  return 7;
}

function matchesHomeFilter(blog, filterTag) {
  if (filterTag === 'all') return true;

  const normalizedFilter = slugify(filterTag);
  const aliases = HOME_FILTER_ALIASES[normalizedFilter] || [normalizedFilter];
  const tokens = new Set([
    ...ensureArray(blog?.tags).map(slugify),
    ...ensureArray(blog?.travelStyles).map(slugify),
    slugify(blog?.meta?.continent),
    slugify(blog?.country),
    slugify(blog?.city)
  ].filter(Boolean));

  if (aliases.some(alias => tokens.has(alias))) return true;
  if (normalizedFilter === 'food' && clampScore(blog?.scores?.food, 0) >= 8) return true;
  if (normalizedFilter === 'budget' && getBudgetRange(parseBudgetValue(blog?.budget)) === 'budget') return true;
  if (normalizedFilter === 'culture' && clampScore(blog?.scores?.culture, 0) >= 8) return true;
  return false;
}

function selectBalancedPinnedBlogs(blogs) {
  const featured = blogs.filter(blog => blog.featured).slice(0, 2);
  const standard = blogs.filter(blog => !blog.featured).slice(0, 6);
  return {
    featured,
    standard
  };
}

function renderCardMarkup(blog, kind = 'standard', animationDelay = 0) {
  const isFeatured = kind !== 'standard';
  const layoutClass = isFeatured ? ` blog-card--featured ${kind === 'featured-left' ? 'blog-card--featured-left' : 'blog-card--featured-right'}` : ' blog-card--std';
  const vibe = getVibeIndicator(blog);
  return `
    <article class="blog-card${layoutClass}" onclick="navigateTo('blog', '${blog.id}')" ${isFeatured ? '' : `style="animation-delay: ${animationDelay}s"`}>
      <div class="blog-card__img-wrap">
        <img class="blog-card__img" src="${blog.image}" alt="${blog.city}" loading="lazy" onerror="attachFallbackImage(this, 'card')">
      </div>
      ${isFeatured ? '<div class="blog-card__overlay"></div><span class="blog-card__badge">★ Featured</span>' : ''}
      <div class="blog-card__body">
        <span class="blog-card__country">${blog.country}</span>
        <h3 class="blog-card__title">${blog.title}</h3>
        <p class="blog-card__excerpt">${blog.excerpt}</p>
        <div class="blog-card__signals">
          <span class="blog-card__vibe">${vibe}</span>
          <span class="blog-card__mood">${getCardMood(blog)}</span>
        </div>
        <div class="blog-card__meta">
          <span class="blog-card__score">Walk ${blog?.scores?.walkability ?? 7}</span>
          <span class="blog-card__score">Food ${blog?.scores?.food ?? 8}</span>
          <span class="blog-card__score">Safe ${blog?.scores?.safety ?? 7}</span>
        </div>
      </div>
    </article>`;
}

function renderBlogGrid() {
  const grid = document.getElementById('blog-grid');
  const visibleBlogs = getAllBlogs().filter(blog => blog.showOnHome !== false && blog.pinned !== false);
  const blogsById = new Map(visibleBlogs.map(blog => [blog.id, blog]));
  const cacheKey = buildFilterCacheKey();
  const cachedIds = getCachedFilterResult(cacheKey);
  const filteredBlogs = cachedIds
    ? cachedIds.map(id => blogsById.get(id)).filter(Boolean)
    : visibleBlogs
      .filter(blog => matchesHomeFilter(blog, activeFilter) && matchesAdvancedFilters(blog))
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));

  if (!cachedIds) {
    setCachedFilterResult(cacheKey, filteredBlogs.map(blog => blog.id));
  }

  const layout = selectBalancedPinnedBlogs(filteredBlogs);
  const cards = [
    ...layout.featured.map((blog, index) => ({ blog, kind: index === 0 ? 'featured-left' : 'featured-right' })),
    ...layout.standard.map(blog => ({ blog, kind: 'standard' }))
  ];

  if (cards.length === 0) {
    grid.innerHTML = `<div class="search-results__empty"><span>✦</span>No published stories match this mood yet.</div>`;
    return;
  }
  grid.innerHTML = cards.map(({ blog, kind }, i) => renderCardMarkup(blog, kind, i * 0.1)).join('');
}

function renderBlogDetail(blogId) {
  const blog = getAllBlogs().find(b => b.id === blogId);
  if (!blog) return;

  const container = document.getElementById('page-blog');
  container.innerHTML = `
    <!-- Blog Hero -->
    <section class="blog-hero">
      <img class="blog-hero__img" src="${blog.heroImage || blog.image}" alt="${blog.city}" onerror="attachFallbackImage(this, 'hero')">
      <div class="blog-hero__overlay"></div>
      <div class="blog-hero__content">
        <a class="blog-hero__back" onclick="navigateTo('home')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to Stories
        </a>
        <p class="blog-hero__country">${blog.country}</p>
        <h1 class="blog-hero__title">${blog.title}</h1>
        <div class="blog-hero__meta">
          <span class="blog-hero__meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            ${blog.days}-day itinerary
          </span>
          <span class="blog-hero__meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            ${blog.bestSeason}
          </span>
        </div>
      </div>
    </section>

    ${blog.stats ? `
    <!-- Stats Bar -->
    <div class="stats-bar">
      <div class="stats-bar__inner">
        <div class="stat">
          <div class="stat__value">${blog.stats.days}</div>
          <div class="stat__label">Days</div>
        </div>
        <div class="stat">
          <div class="stat__value">${getBudgetTier(blog)}</div>
          <div class="stat__label">Cost Level</div>
        </div>
        <div class="stat">
          <div class="stat__value">${blog.stats.bestMonth}</div>
          <div class="stat__label">Best Month</div>
        </div>
        <div class="stat">
          <div class="stat__value">${blog.stats.walkScore}</div>
          <div class="stat__label">Walkability</div>
        </div>
      </div>
    </div>
    ` : ''}

    <!-- Blog Content -->
    <div class="blog-content">
      <div class="blog-main">

        ${blog.itinerary && blog.itinerary.length ? `
        <!-- Itinerary -->
        <section class="content-section reveal" id="section-itinerary">
          <div class="content-section__header">
            <div class="content-section__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div>
              <h2 class="content-section__title">Itinerary</h2>
              <p class="content-section__subtitle">${blog.days} days of carefully planned wandering</p>
            </div>
          </div>
          <div class="timeline">
            ${blog.itinerary.map(day => `
              <div class="timeline-day">
                <div class="timeline-day__dot"></div>
                <span class="timeline-day__label">${day.day}</span>
                <h3 class="timeline-day__title">${day.title}</h3>
                <p class="timeline-day__text">${day.text}</p>
                <div class="timeline-day__spots">
                  ${day.spots.map(s => `<span class="spot-tag">${s}</span>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </section>
        ` : ''}

        ${blog.food && blog.food.length ? `
        <!-- Food Spots -->
        <section class="content-section reveal" id="section-food">
          <div class="content-section__header">
            <div class="content-section__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
            </div>
            <div>
              <h2 class="content-section__title">Best Food Spots</h2>
              <p class="content-section__subtitle">Where we actually ate (and went back twice)</p>
            </div>
          </div>
          <div class="food-grid">
            ${blog.food.map((f, i) => `
              <div class="food-card">
                <span class="food-card__index">${String(i + 1).padStart(2, '0')}</span>
                <div class="food-card__body">
                  <h3 class="food-card__name">${f.name}</h3>
                  <span class="food-card__cuisine">${f.cuisine}</span>
                  <p class="food-card__desc">${f.desc}</p>
                  <span class="food-card__price">${f.price}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
        ` : ''}

        ${blog.gems && blog.gems.length ? `
        <!-- Hidden Gems -->
        <section class="content-section reveal" id="section-gems">
          <div class="content-section__header">
            <div class="content-section__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <div>
              <h2 class="content-section__title">Hidden Gems</h2>
              <p class="content-section__subtitle">The stuff guidebooks don't tell you</p>
            </div>
          </div>
          <div class="gems-list">
            ${blog.gems.map((g, i) => `
              <div class="gem-card">
                <span class="gem-card__number">0${i + 1}</span>
                <div class="gem-card__content">
                  <h3 class="gem-card__name">${g.name}</h3>
                  <p class="gem-card__desc">${g.desc}</p>
                  <div class="gem-card__tip">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;margin-top:2px"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    ${g.tip}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
        ` : ''}

        ${blog.budgetBreakdown && blog.budgetBreakdown.length ? `
        <!-- Budget -->
        <section class="content-section reveal" id="section-budget">
          <div class="content-section__header">
            <div class="content-section__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
            </div>
            <div>
              <h2 class="content-section__title">Budget Breakdown</h2>
              <p class="content-section__subtitle">Prices per day in euros — tested March 2026</p>
            </div>
          </div>
          <table class="budget-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Budget</th>
                <th>Mid-Range</th>
                <th>Luxury</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${blog.budgetBreakdown.map((row, i) => `
                <tr class="${i === blog.budgetBreakdown.length - 1 ? 'budget-total' : ''}">
                  <td class="budget-cat">${row.category}</td>
                  <td class="budget-val">${row.budget}</td>
                  <td class="budget-val">${row.mid}</td>
                  <td class="budget-val">${row.luxury}</td>
                  <td>${row.notes}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p class="budget-note">* Budget assumes hostel dorms, local food, walking, and free attractions. Mid-range uses private rooms, sit-down restaurants, and paid sights. Luxury includes boutique hotels and fine dining.</p>
        </section>
        ` : ''}

      </div>

      <!-- Sidebar -->
      <aside class="blog-sidebar">
        ${blog.itinerary && blog.itinerary.length ? `
        <div class="sidebar-card">
          <h4 class="sidebar-card__title">In This Guide</h4>
          <ul class="toc-list">
            <li><a href="#section-itinerary" onclick="smoothScroll(event, 'section-itinerary')">Itinerary</a></li>
            <li><a href="#section-food" onclick="smoothScroll(event, 'section-food')">Best Food Spots</a></li>
            <li><a href="#section-gems" onclick="smoothScroll(event, 'section-gems')">Hidden Gems</a></li>
            <li><a href="#section-budget" onclick="smoothScroll(event, 'section-budget')">Budget Breakdown</a></li>
          </ul>
        </div>
        ` : ''}

        <div class="sidebar-card">
          <h4 class="sidebar-card__title">Tags</h4>
          <div class="sidebar-tags">
            ${(blog.tags || []).map(t => `<span class="sidebar-tag">${t}</span>`).join('')}
          </div>
        </div>

        <!--
        <div class="sidebar-card">
          <h4 class="sidebar-card__title">Written By</h4>
          <div class="sidebar-author">
            <img class="sidebar-author__avatar" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80" alt="Author">
            <div>
              <div class="sidebar-author__name">Alex Wanderfeld</div>
              <div class="sidebar-author__bio">Slow traveler. Fast eater. Has strong opinions about coffee.</div>
            </div>
          </div>
        </div>
        -->
      </aside>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer__left">Roam<span>keeper</span> © 2026</div>
      <div class="footer__links">
        <a href="#">Instagram</a>
        <a href="#">Newsletter</a>
        <a href="#">Contact</a>
      </div>
    </footer>
  `;

  initRevealObserver();
  setItineraryTab(0);
}

function setItineraryTab(index) {
  const tabRoot = document.querySelector('[data-itinerary-tabs]');
  if (!tabRoot) return;
  const tabs = [...tabRoot.querySelectorAll('.itinerary-tabs__tab')];
  const panels = [...tabRoot.querySelectorAll('[data-itinerary-panel]')];
  tabs.forEach((tab, tabIndex) => {
    const isActive = tabIndex === index;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });
  panels.forEach((panel, panelIndex) => {
    panel.classList.toggle('active', panelIndex === index);
  });
}

/* ═══════════════════════════════════════════
   SEARCH
   ═══════════════════════════════════════════ */
function getSearchMatches(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return getAllBlogs().filter(b =>
    b.city.toLowerCase().includes(normalized) ||
    b.country.toLowerCase().includes(normalized) ||
    b.title.toLowerCase().includes(normalized) ||
    b.excerpt.toLowerCase().includes(normalized) ||
    (b.tags && b.tags.some(t => t.includes(normalized)))
  ).sort((a, b) => {
    const scoreDiff = getSearchScore(a, normalized) - getSearchScore(b, normalized);
    if (scoreDiff !== 0) return scoreDiff;
    return a.city.localeCompare(b.city);
  });
}

function handleSearchInput() {
  const query = document.getElementById('search-input').value.trim();
  renderSearchSuggestions(getSearchMatches(query), query);
}

function renderSearchSuggestions(matches, query) {
  const box = document.getElementById('search-suggestions');
  if (!box) return;
  if (!query || !matches.length) {
    box.classList.remove('active');
    box.innerHTML = '';
    return;
  }
  const uniqueByCity = [];
  const seen = new Set();
  matches.forEach(match => {
    const key = `${match.city}|${match.country}`;
    if (seen.has(key)) return;
    seen.add(key);
    uniqueByCity.push(match);
  });
  box.innerHTML = uniqueByCity.slice(0, 6).map(match => `
    <button class="search-suggestions__item" type="button" onclick="selectSearchSuggestion('${match.id}')">
      <span class="search-suggestions__city">${match.city}</span>
      <span class="search-suggestions__meta">${match.country} • ${getVibeIndicator(match)}</span>
    </button>
  `).join('');
  box.classList.add('active');
}

function performSearch() {
  const input = document.getElementById('search-input');
  const query = input.value.trim();
  const matches = getSearchMatches(query);
  renderSearchSuggestions(matches, query);

  if (!query) return;
  const exact = matches.find(match => match.city.toLowerCase() === query.toLowerCase());
  if (exact) {
    selectSearchSuggestion(exact.id);
  } else if (matches.length === 1) {
    selectSearchSuggestion(matches[0].id);
  }
}

function selectSearchSuggestion(blogId) {
  const match = getAllBlogs().find(blog => blog.id === blogId);
  if (!match) return;
  const input = document.getElementById('search-input');
  if (input) input.value = match.city;
  const box = document.getElementById('search-suggestions');
  if (box) {
    box.classList.remove('active');
    box.innerHTML = '';
  }
  navigateTo('blog', blogId);
}

function clearSearch() {
  document.getElementById('search-input').value = '';
  const box = document.getElementById('search-suggestions');
  if (box) {
    box.classList.remove('active');
    box.innerHTML = '';
  }
}

function toggleMobileNav() {
  const links = document.getElementById('nav-links');
  const toggle = document.querySelector('.nav__toggle');
  const isOpen = links.classList.toggle('open');
  if (toggle) toggle.setAttribute('aria-expanded', String(isOpen));
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ═══════════════════════════════════════════
   ROUTING
   ═══════════════════════════════════════════ */
function navigateTo(page, param) {
  const navLinks = document.getElementById('nav-links');
  const navToggle = document.querySelector('.nav__toggle');
  if (navLinks) navLinks.classList.remove('open');
  if (navToggle) navToggle.setAttribute('aria-expanded', 'false');

  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active', 'visible');
  });

  if (page === 'home') {
    window.location.hash = '';
    const homePage = document.getElementById('page-home');
    homePage.classList.add('active');
    requestAnimationFrame(() => homePage.classList.add('visible'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (page === 'blog') {
    window.location.hash = `blog/${param}`;
    renderBlogDetail(param);
    const blogPage = document.getElementById('page-blog');
    blogPage.classList.add('active');
    requestAnimationFrame(() => {
      blogPage.classList.add('visible');
      window.scrollTo({ top: 0 });
    });
  }
}

function handleRoute() {
  const hash = window.location.hash.slice(1);
  if (hash.startsWith('blog/')) {
    const id = hash.split('/')[1];
    navigateTo('blog', id);
  } else {
    navigateTo('home');
  }
}

function smoothScroll(e, id) {
  e.preventDefault();
  const target = document.getElementById(id);
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ═══════════════════════════════════════════
   SCROLL EFFECTS
   ═══════════════════════════════════════════ */
function initRevealObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// Nav scroll effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (window.scrollY > 60) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
  lastScroll = window.scrollY;
}, { passive: true });

/* ═══════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  await loadGeneratedBlogs();
  await loadHomepageFilters();
  subscribeToGeneratedBlogs();
  renderFilters();
  renderAdvancedFilters();
  renderBlogGrid();
  handleRoute();
  initRevealObserver();
  document.getElementById('search-input').addEventListener('input', handleSearchInput);
  document.getElementById('search-input').addEventListener('focus', handleSearchInput);
  document.getElementById('search-input').addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      performSearch();
    }
  });
  document.getElementById('filter-continent').addEventListener('change', event => setAdvancedFilter('continent', event.target.value));
  document.getElementById('filter-country').addEventListener('change', event => setAdvancedFilter('country', event.target.value));
  document.getElementById('filter-budget-range').addEventListener('change', event => setAdvancedFilter('budgetRange', event.target.value));
  document.getElementById('filter-itinerary').addEventListener('change', event => setAdvancedFilter('itineraryLength', event.target.value));
  document.getElementById('filter-travel-style').addEventListener('change', event => setAdvancedFilter('travelStyle', event.target.value));
  document.getElementById('filter-smart-score').addEventListener('change', event => setAdvancedFilter('smartScore', event.target.value));
  document.getElementById('filter-smart-score-min').addEventListener('change', event => setAdvancedFilter('smartScoreMin', event.target.value));
  document.getElementById('filter-final-score').addEventListener('change', event => setAdvancedFilter('finalScore', event.target.value));

  // Hero zoom effect
  setTimeout(() => {
    const hero = document.getElementById('hero');
    if (hero) hero.classList.add('loaded');
  }, 100);

  document.addEventListener('click', event => {
    const wrap = document.querySelector('.search-wrap');
    const box = document.getElementById('search-suggestions');
    if (!wrap || !box) return;
    if (!wrap.contains(event.target)) {
      box.classList.remove('active');
    }
  });
});

window.addEventListener('hashchange', handleRoute);
