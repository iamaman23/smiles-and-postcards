
const GENERATED_BLOGS_KEY = 'smilesandpostcards.generatedBlogs.v1';
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyA0kSb-V1yZuq_j4gUCUC43GD-UK1Wzfh0",
  authDomain: "travelwebsite-d2716.firebaseapp.com",
  projectId: "travelwebsite-d2716",
  storageBucket: "travelwebsite-d2716.firebasestorage.app",
  messagingSenderId: "1096145054146",
  appId: "1:1096145054146:web:bf2039f6d149ff31af4e5b",
  measurementId: "G-HPH5NHBT8M"
};
let generatedDraft = null;
let FIRESTORE_DB = null;
let FIREBASE_AUTH = null;
let currentAdmin = null;
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
const DEFAULT_HOME_FILTER_TAGS = ['europe', 'asia', 'food', 'budget', 'culture'];
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
let HOME_FILTER_TAGS = [...DEFAULT_HOME_FILTER_TAGS];
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

function getFeaturedCount(posts, excludeId) {
  return posts.filter(post => post.featured && post.id !== excludeId).length;
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

function getManualImageOverrides() {
  return {
    image: document.getElementById('cardImageUrl').value.trim(),
    heroImage: document.getElementById('heroImageUrl').value.trim()
  };
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

function inferCurrencyFromBudget(budget) {
  const raw = String(budget || '');
  if (raw.includes('€')) return 'EUR';
  if (raw.includes('$')) return 'USD';
  if (raw.includes('£')) return 'GBP';
  if (raw.includes('¥')) return 'JPY';
  return 'USD';
}

function deriveCountryCode(country) {
  const slug = slugify(country).toUpperCase();
  if (slug === 'UNITED-STATES') return 'US';
  if (slug === 'UNITED-KINGDOM') return 'GB';
  if (slug === 'CZECH-REPUBLIC' || slug === 'CZECHIA') return 'CZ';
  return slug.split('-').map(part => part[0] || '').join('').slice(0, 2) || 'XX';
}

function deriveBudgetSymbol(blog) {
  const currencySymbol = CURRENCY_SYMBOLS[String(blog?.meta?.currency || '').toUpperCase()];
  if (currencySymbol) return currencySymbol;
  const budget = String(blog?.budget || '');
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

function computeMatchToTravelStyle(travelStyles) {
  const count = ensureArray(travelStyles).length;
  return Math.max(6, Math.min(10, 5 + count));
}

function computeFinalScore(scores, travelStyles) {
  const safeScores = scores || {};
  const matchToTravelStyle = computeMatchToTravelStyle(travelStyles);
  const finalScore =
    (clampScore(safeScores.walkability, 7) * 0.15) +
    (clampScore(safeScores.food, 8) * 0.20) +
    (clampScore(safeScores.safety, 7) * 0.15) +
    (clampScore(safeScores.culture, 8) * 0.15) +
    (clampScore(safeScores.affordability, 7) * 0.15) +
    (matchToTravelStyle * 0.20);
  return Number(finalScore.toFixed(2));
}

function inferContinentTag(country, tags, city) {
  const existing = (tags || []).find(tag => CONTINENT_TAGS.includes(tag));
  if (existing) return existing;
  const countryKey = slugify(country);
  if (COUNTRY_TO_CONTINENT[countryKey]) return COUNTRY_TO_CONTINENT[countryKey];
  const cityKey = slugify(city);
  if (COUNTRY_TO_CONTINENT[cityKey]) return COUNTRY_TO_CONTINENT[cityKey];
  return 'asia';
}

function normalizeTags(country, rawTags, city) {
  const tags = ensureArray(rawTags).map(slugify).filter(Boolean);
  const unique = [...new Set(tags)];
  const continent = inferContinentTag(country, unique, city);
  if (!unique.includes(continent)) unique.unshift(continent);
  return unique;
}

function renderHomeTagSettings() {
  const container = document.getElementById('homeTagSettings');
  if (!container) return;
  const selected = new Set(HOME_FILTER_TAGS);
  const options = [...new Set([...DEFAULT_HOME_FILTER_TAGS, ...CONTINENT_TAGS, 'architecture', 'coastal', 'citybreak'])];
  container.innerHTML = options.map(tag => `
    <label class="switch">
      <input type="checkbox" ${selected.has(tag) ? 'checked' : ''} onchange="toggleHomeFilterTag('${tag}', this.checked)">
      Show "${tag}" on home page
    </label>
  `).join('');
}

function setManualImageOverrides(blog) {
  document.getElementById('cardImageUrl').value = (blog && blog.image) || '';
  document.getElementById('heroImageUrl').value = (blog && (blog.heroImage || blog.image)) || '';
}

async function canUseImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return new Promise(resolve => {
    const img = new Image();
    let done = false;
    const finish = value => {
      if (done) return;
      done = true;
      resolve(value);
    };
    const timer = setTimeout(() => finish(false), 5000);
    img.onload = () => {
      clearTimeout(timer);
      finish(true);
    };
    img.onerror = () => {
      clearTimeout(timer);
      finish(false);
    };
    img.referrerPolicy = 'no-referrer';
    img.src = url;
  });
}

async function ensureRenderableImage(url, type, city) {
  const cleanUrl = typeof url === 'string' ? url.trim() : '';
  const isUnsplash = cleanUrl.includes('images.unsplash.com/');
  return (isUnsplash && await canUseImageUrl(cleanUrl)) ? cleanUrl : getFallbackImage(type, city);
}

async function ensureRenderableBlogImages(blog) {
  const manual = getManualImageOverrides();
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
  const normalizedMeta = {
    continent: inferContinentTag(blog.country, blog.tags, blog.city),
    countryCode: blog?.meta?.countryCode || deriveCountryCode(blog.country),
    currency: blog?.meta?.currency || inferCurrencyFromBudget(blog.budget),
    language: blog?.meta?.language || 'Local language',
    timeZone: blog?.meta?.timeZone || '',
    airportCode: blog?.meta?.airportCode || ''
  };
  const safeBlog = {
    ...blog,
    version: 2,
    tags: normalizeTags(blog.country, blog.tags, blog.city),
    showOnHome: blog.showOnHome !== false,
    pinned: blog.showOnHome !== false,
    meta: normalizedMeta,
    geo: {
      lat: Number(blog?.geo?.lat) || 0,
      lng: Number(blog?.geo?.lng) || 0
    },
    scores: normalizedScores,
    travelStyles: ensureArray(blog.travelStyles).map(slugify),
    experience: {
      pace: blog?.experience?.pace || 'moderate',
      crowdLevel: blog?.experience?.crowdLevel || 'medium',
      seasonality: blog?.experience?.seasonality || 'stable',
      difficulty: blog?.experience?.difficulty || 'easy'
    },
    highlights: ensureArray(blog.highlights),
    warnings: ensureArray(blog.warnings),
    skipIf: ensureArray(blog.skipIf),
    stats: {
      ...(blog.stats || {}),
      walkScore: formatWalkScore(blog?.stats?.walkScore)
    },
    image: await ensureRenderableImage(manual.image || blog.image, 'card', blog.city),
    heroImage: await ensureRenderableImage(manual.heroImage || blog.heroImage || manual.image || blog.image, 'hero', blog.city),
    food: await Promise.all((blog.food || []).map(async item => ({
      ...item,
      image: ''
    }))),
    budgetSymbol: deriveBudgetSymbol({ ...blog, meta: normalizedMeta })
  };
  safeBlog.finalScore = computeFinalScore(safeBlog.scores, safeBlog.travelStyles);
  return safeBlog;
}

async function syncDraftImageOverrides() {
  if (!generatedDraft) return;
  generatedDraft = await ensureRenderableBlogImages(generatedDraft);
  renderPreview(generatedDraft);
  document.getElementById('jsonBox').textContent = JSON.stringify(generatedDraft, null, 2);
}

function isFirebaseConfigured() {
  return FIREBASE_CONFIG.apiKey && !FIREBASE_CONFIG.apiKey.includes('PASTE_') && window.firebase;
}

function isStorageAvailable() {
  try {
    const key = '__smilesandpostcards_admin_storage_probe__';
    localStorage.setItem(key, key);
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    return false;
  }
}

function isFirebaseAuthEnvironmentSupported() {
  const protocol = window.location?.protocol || '';
  return ['http:', 'https:', 'chrome-extension:'].includes(protocol) && isStorageAvailable();
}

function getFirebaseAuthEnvironmentMessage() {
  if (isFirebaseAuthEnvironmentSupported()) return '';
  const protocol = window.location?.protocol || 'unknown';
  if (!['http:', 'https:', 'chrome-extension:'].includes(protocol)) {
    return `Firebase admin sign-in only works over http or https. This page is currently running from ${protocol}. Open it via localhost or a deployed URL.`;
  }
  return 'Firebase admin sign-in requires browser storage to be enabled. Please enable local storage/cookies for this site and try again.';
}

function initFirebase({ requireAuth = false } = {}) {
  if (!isFirebaseConfigured()) {
    setStatus('Paste your Firebase config into this file before using deployed admin publishing.', 'err');
    return false;
  }
  if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
  FIRESTORE_DB = firebase.firestore();
  if (requireAuth && !isFirebaseAuthEnvironmentSupported()) {
    setStatus(getFirebaseAuthEnvironmentMessage(), 'err');
    FIREBASE_AUTH = null;
    return false;
  }
  FIREBASE_AUTH = isFirebaseAuthEnvironmentSupported() ? firebase.auth() : null;
  return true;
}

function requireAdmin() {
  if (!currentAdmin || !FIRESTORE_DB) {
    setStatus('Sign in with your Firebase admin account first.', 'err');
    return false;
  }
  return true;
}

const BLOG_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['version', 'city', 'country', 'title', 'excerpt', 'image', 'heroImage', 'days', 'budget', 'bestSeason', 'date', 'tags', 'stats', 'meta', 'geo', 'scores', 'travelStyles', 'experience', 'highlights', 'warnings', 'skipIf', 'itinerary', 'food', 'gems', 'budgetBreakdown'],
  properties: {
    version: { type: 'number' },
    city: { type: 'string' },
    country: { type: 'string' },
    title: { type: 'string' },
    excerpt: { type: 'string' },
    image: { type: 'string' },
    heroImage: { type: 'string' },
    days: { type: 'number' },
    budget: { type: 'string' },
    bestSeason: { type: 'string' },
    date: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    stats: {
      type: 'object',
      additionalProperties: false,
      required: ['days', 'budget', 'bestMonth', 'walkScore'],
      properties: {
        days: { type: 'string' },
        budget: { type: 'string' },
        bestMonth: { type: 'string' },
        walkScore: { type: 'string' }
      }
    },
    meta: {
      type: 'object',
      additionalProperties: false,
      required: ['continent', 'countryCode', 'currency', 'language', 'timeZone', 'airportCode'],
      properties: {
        continent: { type: 'string' },
        countryCode: { type: 'string' },
        currency: { type: 'string' },
        language: { type: 'string' },
        timeZone: { type: 'string' },
        airportCode: { type: 'string' }
      }
    },
    geo: {
      type: 'object',
      additionalProperties: false,
      required: ['lat', 'lng'],
      properties: {
        lat: { type: 'number' },
        lng: { type: 'number' }
      }
    },
    scores: {
      type: 'object',
      additionalProperties: false,
      required: ['walkability', 'affordability', 'safety', 'nightlife', 'food', 'culture', 'nature', 'connectivity', 'familyFriendly'],
      properties: {
        walkability: { type: 'number' },
        affordability: { type: 'number' },
        safety: { type: 'number' },
        nightlife: { type: 'number' },
        food: { type: 'number' },
        culture: { type: 'number' },
        nature: { type: 'number' },
        connectivity: { type: 'number' },
        familyFriendly: { type: 'number' }
      }
    },
    travelStyles: { type: 'array', items: { type: 'string' } },
    experience: {
      type: 'object',
      additionalProperties: false,
      required: ['pace', 'crowdLevel', 'seasonality', 'difficulty'],
      properties: {
        pace: { type: 'string' },
        crowdLevel: { type: 'string' },
        seasonality: { type: 'string' },
        difficulty: { type: 'string' }
      }
    },
    highlights: { type: 'array', items: { type: 'string' } },
    warnings: { type: 'array', items: { type: 'string' } },
    skipIf: { type: 'array', items: { type: 'string' } },
    itinerary: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['day', 'title', 'text', 'spots'],
        properties: {
          day: { type: 'string' },
          title: { type: 'string' },
          text: { type: 'string' },
          spots: { type: 'array', items: { type: 'string' } }
        }
      }
    },
    food: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'cuisine', 'desc', 'price', 'image'],
        properties: {
          name: { type: 'string' },
          cuisine: { type: 'string' },
          desc: { type: 'string' },
          price: { type: 'string' },
          image: { type: 'string' }
        }
      }
    },
    gems: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'desc', 'tip'],
        properties: {
          name: { type: 'string' },
          desc: { type: 'string' },
          tip: { type: 'string' }
        }
      }
    },
    budgetBreakdown: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['category', 'budget', 'mid', 'luxury', 'notes'],
        properties: {
          category: { type: 'string' },
          budget: { type: 'string' },
          mid: { type: 'string' },
          luxury: { type: 'string' },
          notes: { type: 'string' }
        }
      }
    }
  }
};

function defaultSystemPrompt() {
  return `You are Smiles and Postcards' travel editor. Generate accurate, warm, magazine-style travel content. Return JSON only. Do not include markdown.

Use real-sounding travel advice, practical budgets, best months, tags, food spots, hidden gems, and a day-by-day itinerary. The tone should match a subtle editorial travel blog.

For image intent, think in terms of the city itself, skyline, landmark, monument, old town, bridge, cathedral, or street scene.

Use only real direct Unsplash image URLs from images.unsplash.com. If you are not sure the URL is real, return an empty string instead of inventing one.`;
}

function defaultUserPrompt() {
  return `Create a complete Smiles and Postcards destination post for {{city}}.

Return only JSON matching this schema:
${JSON.stringify(BLOG_SCHEMA, null, 2)}

RULES:
- title format should resemble "City - evocative travel phrase"
- excerpt should be under 155 characters
- days should be a realistic itinerary length
- budget should be a per-day value in the city's original local currency (e.g. "₹4500/day" for India, "¥12000/day" for Japan)
- bestSeason should be concise, e.g. "Apr-Jun, Sep-Oct"
- date should be the current month/year or a natural editorial date
- itinerary length must match the days value

TAGS (VERY IMPORTANT):
- tags must be high-quality and useful for filtering
- include region tags such as europe or asia
- include travel style tags such as budget, luxury, backpacking, romantic, solo, foodie, digital_nomad
- include experience tags such as culture, nightlife, nature, architecture, beach, history
- include use-case tags such as weekend, long_trip, first_time, offbeat
- do not use vague tags like travel or fun
- do not repeat similar tags
- keep total tags between 10 and 15
- tags must align with travelStyles

SCORES:
- all scores must be between 1 and 10
- scores must be realistic and varied
- scores must reflect real-world perception of the destination

TRAVEL STYLES:
- use only relevant styles such as budget, luxury, backpacking, romantic, solo, family, foodie, party, cultural, digital_nomad

EXPERIENCE:
- pace: relaxed / moderate / fast
- crowdLevel: low / medium / high
- seasonality: stable / seasonal / peak-driven
- difficulty: easy / moderate / tiring

CONTENT QUALITY:
- avoid fluff
- focus on real decisions
- add practical tips inside descriptions
- each itinerary day's text should feel substantial, usually 2 to 4 sentences and roughly 40 to 90 words
- make each day description specific enough that a traveler can understand the rhythm of the day
- include 4 or 6 food spots, never 3 or 5
- include 4 or 6 hidden gems, never 3 or 5

HIGHLIGHTS / WARNINGS:
- at least 3 highlights
- at least 3 warnings
- at least 3 skipIf conditions

IMAGES:
- budgetBreakdown should include Accommodation, Food & Drink, Transport, Activities, Total / Day
- budgetBreakdown values should also use the destination's original local currency rather than defaulting to USD
- image and heroImage should reflect the city itself, preferably skyline, landmark, monument, bridge, cathedral, or old town scene
- image and heroImage must be real direct images.unsplash.com URLs when provided
- if you are not fully sure a real direct Unsplash URL exists, return an empty string instead of inventing one
- food images must always be empty strings

FINAL RULE:
- return only valid JSON
- no explanation
- no markdown
- no extra text`;
}

function resetPrompts() {
  document.getElementById('systemPrompt').value = defaultSystemPrompt();
  document.getElementById('userPrompt').value = defaultUserPrompt();
}

function setStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type || ''}`;
}

function slugify(value) {
  return String(value || 'destination')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'destination';
}

function stripUnsafeText(value) {
  if (typeof value === 'string') return value.replace(/[<>]/g, '').trim();
  if (Array.isArray(value)) return value.map(stripUnsafeText);
  if (value && typeof value === 'object') {
    return Object.keys(value).reduce((result, key) => {
      result[key] = stripUnsafeText(value[key]);
      return result;
    }, {});
  }
  return value;
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
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

function getCityDocId(blog) {
  return blog?.cityId || blog?.id;
}

function combineCityAndItinerary(cityDoc, itineraryDoc, placesById = new Map()) {
  const cityData = cityDoc?.data ? cityDoc.data() : cityDoc || {};
  const itineraryData = itineraryDoc?.data ? itineraryDoc.data() : itineraryDoc || {};
  return {
    id: cityDoc?.id || cityData.id || itineraryData.cityId,
    cityId: cityDoc?.id || cityData.id || itineraryData.cityId,
    ...cityData,
    days: itineraryData.days ?? cityData.days ?? 3,
    travelStyles: itineraryData.travelStyles || cityData.travelStyles || [],
    itinerary: resolveItineraryDays(itineraryData.itinerary || cityData.itinerary || [], placesById),
    food: resolvePlaceRefs(ensureArray(itineraryData.food).length ? itineraryData.food : cityData.food, placesById, 'food'),
    gems: resolvePlaceRefs(ensureArray(itineraryData.gems).length ? itineraryData.gems : cityData.gems, placesById, 'gem')
  };
}

function buildStructuredSavedItems(citiesSnapshot, itinerariesSnapshot, placesSnapshot) {
  const itineraryByCityId = new Map();
  const placesById = buildPlacesById(placesSnapshot);
  itinerariesSnapshot.docs.forEach(doc => {
    const data = doc.data() || {};
    if (!data.cityId) return;
    const previous = itineraryByCityId.get(data.cityId);
    if (!previous || getPostSortTime(data) >= getPostSortTime(previous.data())) {
      itineraryByCityId.set(data.cityId, doc);
    }
  });
  return citiesSnapshot.docs.map(cityDoc => combineCityAndItinerary(cityDoc, itineraryByCityId.get(cityDoc.id), placesById));
}

function buildPlaceId(cityId, name) {
  return `${cityId}-place-${slugify(name)}`;
}

function buildPlaceDocuments(blog, cityId) {
  const placesById = new Map();
  const registerPlace = (rawPlace, kind) => {
    const normalized = normalizePlaceEntity(rawPlace, kind);
    if (!normalized?.name) return '';
    const placeId = buildPlaceId(cityId, normalized.name);
    const existing = placesById.get(placeId) || {};
    placesById.set(placeId, {
      id: placeId,
      cityId,
      city: blog.city,
      country: blog.country,
      slug: slugify(normalized.name),
      name: normalized.name,
      kind: existing.kind === kind ? existing.kind : (existing.kind || kind),
      kinds: [...new Set([...(existing.kinds || []), kind])],
      desc: normalized.desc || existing.desc || '',
      tip: normalized.tip || existing.tip || '',
      cuisine: normalized.cuisine || existing.cuisine || '',
      price: normalized.price || existing.price || '',
      image: normalized.image || existing.image || ''
    });
    return placeId;
  };

  const itinerary = ensureArray(blog.itinerary).map(day => ({
    ...day,
    spots: ensureArray(day?.spots).map(spot => registerPlace(spot, 'itinerary')).filter(Boolean)
  }));
  const food = ensureArray(blog.food).map(item => registerPlace(item, 'food')).filter(Boolean);
  const gems = ensureArray(blog.gems).map(item => registerPlace(item, 'gem')).filter(Boolean);

  return {
    placeDocs: [...placesById.values()],
    itinerary,
    food,
    gems
  };
}

function buildFirestoreDocuments(blog) {
  const cityId = getCityDocId(blog);
  const itineraryId = `${cityId}-${Number(blog.days || 3)}d`;
  const { placeDocs, itinerary, food, gems } = buildPlaceDocuments(blog, cityId);
  const cityDoc = {
    cityId,
    city: blog.city,
    country: blog.country,
    title: blog.title,
    excerpt: blog.excerpt,
    image: blog.image,
    heroImage: blog.heroImage || blog.image,
    featured: Boolean(blog.featured),
    pinned: blog.showOnHome !== false && blog.pinned !== false,
    showOnHome: blog.showOnHome !== false,
    bestSeason: blog.bestSeason,
    date: blog.date,
    stats: blog.stats || {},
    meta: blog.meta || {},
    geo: blog.geo || {},
    scores: blog.scores || {},
    tags: ensureArray(blog.tags),
    highlights: ensureArray(blog.highlights),
    warnings: ensureArray(blog.warnings),
    skipIf: ensureArray(blog.skipIf),
    budget: blog.budget,
    budgetBreakdown: ensureArray(blog.budgetBreakdown),
    finalScore: Number(blog.finalScore || 0),
    budgetSymbol: blog.budgetSymbol || deriveBudgetSymbol(blog)
  };
  const itineraryDoc = {
    id: itineraryId,
    cityId,
    days: Number(blog.days || 3),
    travelStyles: ensureArray(blog.travelStyles),
    itinerary,
    food,
    gems
  };
  return { cityId, itineraryId, cityDoc, itineraryDoc, placeDocs };
}

function normalizeBlog(raw) {
  const clean = stripUnsafeText(raw || {});
  const city = clean.city || document.getElementById('city').value.trim() || 'Destination';
  const days = Number(clean.days || 3);
  const fallbackImage = getFallbackImage('card', city);
  const manual = getManualImageOverrides();

  return {
    id: `admin-${slugify(city)}-${Date.now()}`,
    version: 2,
    city,
    country: clean.country || 'Travel Guide',
    title: clean.title || `${city} - A Carefully Curated Escape`,
    excerpt: clean.excerpt || `A practical, beautiful guide to ${city}, generated from your admin prompt.`,
    image: manual.image || clean.image || fallbackImage,
    heroImage: manual.heroImage || clean.heroImage || manual.image || clean.image || getFallbackImage('hero', city),
    featured: document.getElementById('featured').checked,
    pinned: document.getElementById('showOnHome').checked,
    showOnHome: document.getElementById('showOnHome').checked,
    days,
    budget: clean.budget || '$60/day',
    bestSeason: clean.bestSeason || 'Apr-Jun, Sep-Oct',
    date: clean.date || new Date().toLocaleString('en', { month: 'long', year: 'numeric' }),
    tags: normalizeTags(clean.country || 'Travel Guide', ensureArray(clean.tags).length ? ensureArray(clean.tags) : ['culture', 'food'], city),
    stats: clean.stats || {
      days: String(days),
      budget: clean.budget || '$60/day',
      bestMonth: 'May',
      walkScore: '80/100'
    },
    meta: clean.meta || {
      continent: inferContinentTag(clean.country || 'Travel Guide', clean.tags, city),
      countryCode: deriveCountryCode(clean.country || ''),
      currency: inferCurrencyFromBudget(clean.budget || '$60/day'),
      language: 'Local language',
      timeZone: '',
      airportCode: ''
    },
    geo: clean.geo || { lat: 0, lng: 0 },
    scores: clean.scores || {
      walkability: 7,
      affordability: 7,
      safety: 7,
      nightlife: 6,
      food: 8,
      culture: 8,
      nature: 6,
      connectivity: 7,
      familyFriendly: 7
    },
    travelStyles: ensureArray(clean.travelStyles).length ? ensureArray(clean.travelStyles).map(slugify) : ['cultural', 'foodie'],
    experience: clean.experience || {
      pace: 'moderate',
      crowdLevel: 'medium',
      seasonality: 'stable',
      difficulty: 'easy'
    },
    highlights: ensureArray(clean.highlights),
    warnings: ensureArray(clean.warnings),
    skipIf: ensureArray(clean.skipIf),
    itinerary: ensureArray(clean.itinerary),
    food: ensureArray(clean.food),
    gems: ensureArray(clean.gems),
    budgetBreakdown: ensureArray(clean.budgetBreakdown)
  };
}

function extractJsonFromApiResponse(data) {
  if (data && data.blog) return data.blog;
  if (data && data.city && data.title) return data;

  const text =
    (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.map(part => part.text || '').join('')) ||
    data.output_text ||
    (data.output && data.output[0] && data.output[0].content && data.output[0].content[0] && data.output[0].content[0].text) ||
    (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) ||
    data.text;

  if (!text || typeof text !== 'string') {
    throw new Error('The API response did not contain JSON blog content.');
  }

  const trimmed = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '');
  return JSON.parse(trimmed);
}

function buildRequestBody(endpoint, city, systemPrompt, userPrompt, model) {
  const renderedPrompt = userPrompt.split('{{city}}').join(city);
  if (endpoint.includes('generativelanguage.googleapis.com')) {
    return {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: renderedPrompt }]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    };
  }

  if (endpoint.includes('/v1/responses')) {
    return {
      model,
      input: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: renderedPrompt }
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'smilesandpostcards_blog',
          strict: true,
          schema: BLOG_SCHEMA
        }
      }
    };
  }

  if (endpoint.includes('/v1/chat/completions')) {
    return {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: renderedPrompt }
      ],
      response_format: { type: 'json_object' }
    };
  }

  return {
    city,
    model,
    featured: document.getElementById('featured').checked,
    systemPrompt,
    prompt: renderedPrompt,
    schema: BLOG_SCHEMA
  };
}

function buildRequestUrl(endpoint, model, apiKey) {
  if (endpoint.includes('generativelanguage.googleapis.com')) {
    const normalizedBase = endpoint.replace(/\/+$/, '');
    if (normalizedBase.includes(':generateContent')) {
      const separator = normalizedBase.includes('?') ? '&' : '?';
      return `${normalizedBase}${apiKey ? `${separator}key=${encodeURIComponent(apiKey)}` : ''}`;
    }
    const separator = normalizedBase.includes('?') ? '&' : '?';
    return `${normalizedBase}/${encodeURIComponent(model)}:generateContent${apiKey ? `${separator}key=${encodeURIComponent(apiKey)}` : ''}`;
  }
  return endpoint;
}

function formatFirebaseAuthError(error) {
  const code = error && error.code;
  const messages = {
    'auth/invalid-credential': 'Firebase rejected the email or password. Double-check the account in Firebase Authentication.',
    'auth/wrong-password': 'The password is incorrect for that Firebase user.',
    'auth/user-not-found': 'That email does not exist in Firebase Authentication yet.',
    'auth/invalid-email': 'The email address format is invalid.',
    'auth/operation-not-allowed': 'Email/password sign-in is not enabled in Firebase Authentication. Enable the Email/Password provider first.',
    'auth/configuration-not-found': 'Email/password sign-in is not configured in Firebase Authentication yet. Enable the Email/Password provider first.',
    'auth/operation-not-supported-in-this-environment': getFirebaseAuthEnvironmentMessage() || 'Firebase admin sign-in is not supported in this environment.',
    'auth/too-many-requests': 'Firebase temporarily rate-limited sign-in attempts. Wait a moment and try again.',
    'auth/network-request-failed': 'The browser could not reach Firebase. Check your internet connection or hosting domain.',
    'auth/unauthorized-domain': 'This site domain is not authorized in Firebase Authentication. Add it under Authentication -> Settings -> Authorized domains.'
  };
  return messages[code] || error.message || 'Firebase sign in failed.';
}

async function generateStory() {
  const city = document.getElementById('city').value.trim();
  const endpoint = document.getElementById('endpoint').value.trim();
  const apiKey = document.getElementById('apiKey').value.trim();
  const model = document.getElementById('model').value.trim() || 'gemini-1.5-flash';
  const systemPrompt = document.getElementById('systemPrompt').value.trim();
  const userPrompt = document.getElementById('userPrompt').value.trim();

  if (!city || !endpoint || !systemPrompt || !userPrompt) {
    setStatus('City, endpoint, system prompt, and user prompt are required.', 'err');
    return;
  }

  const generateBtn = document.getElementById('generateBtn');
  generateBtn.disabled = true;
  document.getElementById('saveBtn').disabled = true;
  setStatus(`Generating ${city} from API...`, '');

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (!endpoint.includes('generativelanguage.googleapis.com') && apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const requestUrl = buildRequestUrl(endpoint, model, apiKey);

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(buildRequestBody(endpoint, city, systemPrompt, userPrompt, model))
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${await response.text()}`);
    }

    const apiData = await response.json();
    generatedDraft = await ensureRenderableBlogImages(normalizeBlog(extractJsonFromApiResponse(apiData)));
    renderPreview(generatedDraft);
    document.getElementById('jsonBox').textContent = JSON.stringify(generatedDraft, null, 2);
    document.getElementById('saveBtn').disabled = false;
    setStatus('Generated successfully. Review the preview, then save it to the site.', 'ok');
  } catch (error) {
    console.error(error);
    setStatus(error.message || 'Generation failed.', 'err');
  } finally {
    generateBtn.disabled = false;
  }
}

function renderPreview(blog) {
  const featured = blog.featured ? ' featured' : '';
  document.getElementById('preview').innerHTML = `
    <article class="preview-card${featured}">
      <img src="${blog.image}" alt="${blog.city}" onerror="this.onerror=null;this.src='${getFallbackImage('card', blog.city)}'">
      <div class="preview-body">
        <div class="country">${blog.country}</div>
        <h3 class="preview-title">${blog.title}</h3>
        <p class="excerpt">${blog.excerpt}</p>
        <div class="meta">
          <span>${blog.days} days</span>
          <span>${blog.budget}</span>
          <span>${blog.bestSeason}</span>
        </div>
      </div>
    </article>
  `;
}

function readSavedLocal() {
  try {
    const stored = JSON.parse(localStorage.getItem(GENERATED_BLOGS_KEY) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

async function saveStory() {
  if (!generatedDraft) return;
  if (!requireAdmin()) return;

  try {
    const { cityId, itineraryId, cityDoc, itineraryDoc, placeDocs } = buildFirestoreDocuments(generatedDraft);
    const existingSnapshot = await FIRESTORE_DB.collection('cities').get();
    const existingCities = existingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (generatedDraft.featured && getFeaturedCount(existingCities, cityId) >= 2) {
      setStatus('Only 2 featured cards are allowed. Unfeature one saved card first.', 'err');
      return;
    }
    const now = firebase.firestore.FieldValue.serverTimestamp();
    await FIRESTORE_DB.collection('cities').doc(cityId).set({
      ...cityDoc,
      createdAt: generatedDraft.createdAt || now,
      updatedAt: now,
      publishedBy: currentAdmin.email
    }, { merge: true });
    await FIRESTORE_DB.collection('itineraries').doc(itineraryId).set({
      ...itineraryDoc,
      createdAt: generatedDraft.createdAt || now,
      updatedAt: now,
      publishedBy: currentAdmin.email
    });
    const existingPlacesSnapshot = await FIRESTORE_DB.collection('places').where('cityId', '==', cityId).get();
    const nextPlaceIds = new Set(placeDocs.map(place => place.id));
    const batch = FIRESTORE_DB.batch();
    existingPlacesSnapshot.docs.forEach(doc => {
      if (!nextPlaceIds.has(doc.id)) batch.delete(doc.ref);
    });
    placeDocs.forEach(place => {
      batch.set(FIRESTORE_DB.collection('places').doc(place.id), {
        ...place,
        updatedAt: now,
        createdAt: generatedDraft.createdAt || now,
        publishedBy: currentAdmin.email
      }, { merge: true });
    });
    await batch.commit();
    setStatus(`${generatedDraft.city} published to Firebase. It will now appear on the website.`, 'ok');
    await loadSaved();
  } catch (error) {
    setStatus(error.message || 'Unable to save to Firebase.', 'err');
  }
}

async function loadSaved() {
  let saved = readSavedLocal();
  try {
    if (!FIRESTORE_DB && !initFirebase()) throw new Error('Firebase is not configured yet.');
    const [citiesSnapshot, itinerariesSnapshot, placesSnapshot] = await Promise.all([
      FIRESTORE_DB.collection('cities').get(),
      FIRESTORE_DB.collection('itineraries').get(),
      FIRESTORE_DB.collection('places').get()
    ]);
    if (citiesSnapshot.docs.length) {
      saved = sortPostsByCreatedAt(buildStructuredSavedItems(citiesSnapshot, itinerariesSnapshot, placesSnapshot));
    } else {
      const snapshot = await FIRESTORE_DB.collection('posts').get();
      saved = sortPostsByCreatedAt(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    localStorage.setItem(GENERATED_BLOGS_KEY, JSON.stringify(saved));
  } catch (error) {
    console.info('Using local saved posts fallback until Firebase is configured.', error);
  }

  const list = document.getElementById('savedList');
  if (!saved.length) {
    list.innerHTML = '<p class="hint">No generated posts saved yet.</p>';
    return;
  }
  list.innerHTML = saved.map(item => `
    <div class="saved-item">
      <div>
        <strong>${item.city}</strong>
        <span>${item.featured ? 'Featured' : 'Standard'} - ${item.showOnHome === false ? 'Hidden from home' : 'Shown on home'} - ${item.days} days - ${item.budget}</span>
      </div>
      <div class="saved-actions">
        <button class="btn" type="button" onclick="toggleFeatured('${item.id}', ${item.featured ? 'false' : 'true'})">${item.featured ? 'Unfeature' : 'Make featured'}</button>
        <button class="btn" type="button" onclick="toggleHomeVisibility('${item.id}', ${item.showOnHome === false ? 'true' : 'false'})">${item.showOnHome === false ? 'Show on home' : 'Hide from home'}</button>
        <button class="btn" type="button" onclick="removeSaved('${item.id}')">Remove</button>
      </div>
    </div>
  `).join('');
}

async function toggleHomeVisibility(id, nextVisible) {
  if (!requireAdmin()) return;

  try {
    await FIRESTORE_DB.collection('cities').doc(id).update({
      showOnHome: nextVisible,
      pinned: nextVisible,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    await loadSaved();
    setStatus(nextVisible ? 'Card will be shown on the home page.' : 'Card hidden from the home page.', 'ok');
  } catch (error) {
    setStatus(error.message || 'Unable to update home page visibility.', 'err');
  }
}

async function loadHomepageSettings() {
  renderHomeTagSettings();
  try {
    if (!FIRESTORE_DB && !initFirebase()) throw new Error('Firebase is not configured yet.');
    const doc = await FIRESTORE_DB.collection('siteConfig').doc('homepage').get();
    if (doc.exists) {
      const data = doc.data() || {};
      HOME_FILTER_TAGS = ensureArray(data.filterTags).length ? ensureArray(data.filterTags).map(slugify) : [...DEFAULT_HOME_FILTER_TAGS];
    } else {
      HOME_FILTER_TAGS = [...DEFAULT_HOME_FILTER_TAGS];
    }
  } catch (error) {
    console.info('Using default homepage tag settings.', error);
    HOME_FILTER_TAGS = [...DEFAULT_HOME_FILTER_TAGS];
  }
  renderHomeTagSettings();
}

async function toggleHomeFilterTag(tag, enabled) {
  if (!requireAdmin()) return;
  const next = enabled
    ? [...new Set([...HOME_FILTER_TAGS, tag])]
    : HOME_FILTER_TAGS.filter(item => item !== tag);
  HOME_FILTER_TAGS = next;
  renderHomeTagSettings();

  try {
    await FIRESTORE_DB.collection('siteConfig').doc('homepage').set({
      filterTags: HOME_FILTER_TAGS,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    setStatus('Home page filter tags updated.', 'ok');
  } catch (error) {
    setStatus(error.message || 'Unable to update home page filter tags.', 'err');
  }
}

async function toggleFeatured(id, nextFeatured) {
  if (!requireAdmin()) return;

  try {
    const existingSnapshot = await FIRESTORE_DB.collection('cities').get();
    const existingCities = existingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (nextFeatured && getFeaturedCount(existingCities, id) >= 2) {
      setStatus('Only 2 featured cards are allowed. Unfeature one saved card first.', 'err');
      return;
    }
    await FIRESTORE_DB.collection('cities').doc(id).update({
      featured: nextFeatured,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    await loadSaved();
    setStatus(nextFeatured ? 'Card marked as featured.' : 'Card removed from featured.', 'ok');
  } catch (error) {
    setStatus(error.message || 'Unable to update featured state.', 'err');
  }
}

async function removeSaved(id) {
  if (!requireAdmin()) return;

  try {
    await FIRESTORE_DB.collection('cities').doc(id).delete();
    const [itinerarySnapshot, placesSnapshot] = await Promise.all([
      FIRESTORE_DB.collection('itineraries').where('cityId', '==', id).get(),
      FIRESTORE_DB.collection('places').where('cityId', '==', id).get()
    ]);
    const batch = FIRESTORE_DB.batch();
    if (!itinerarySnapshot.empty) {
      itinerarySnapshot.docs.forEach(doc => batch.delete(doc.ref));
    }
    if (!placesSnapshot.empty) {
      placesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    }
    if (!itinerarySnapshot.empty || !placesSnapshot.empty) await batch.commit();
    await loadSaved();
    setStatus('Generated post removed from Firebase.', 'ok');
  } catch (error) {
    setStatus(error.message || 'Unable to remove generated post.', 'err');
  }
}

async function clearSaved() {
  if (!confirm('Clear all generated Smiles and Postcards posts from Firebase?')) return;
  if (!requireAdmin()) return;

  try {
    const [citiesSnapshot, itinerariesSnapshot, placesSnapshot] = await Promise.all([
      FIRESTORE_DB.collection('cities').get(),
      FIRESTORE_DB.collection('itineraries').get(),
      FIRESTORE_DB.collection('places').get()
    ]);
    const batch = FIRESTORE_DB.batch();
    citiesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    itinerariesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    placesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    localStorage.removeItem(GENERATED_BLOGS_KEY);
    generatedDraft = null;
    document.getElementById('saveBtn').disabled = true;
    document.getElementById('preview').innerHTML = '';
    document.getElementById('jsonBox').textContent = 'Generated JSON will appear here.';
    setStatus('Generated posts cleared from Firebase.', 'ok');
    loadSaved();
  } catch (error) {
    setStatus(error.message || 'Unable to clear generated posts.', 'err');
  }
}

async function copyJson() {
  const text = document.getElementById('jsonBox').textContent;
  if (!generatedDraft || !navigator.clipboard) {
    setStatus('Nothing generated yet, or clipboard is unavailable.', 'err');
    return;
  }
  await navigator.clipboard.writeText(text);
  setStatus('Generated JSON copied.', 'ok');
}

async function signInAdmin() {
  if (!initFirebase({ requireAuth: true }) || !FIREBASE_AUTH) return;
  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value;
  if (!email || !password) {
    setStatus('Enter your Firebase admin email and password.', 'err');
    return;
  }

  try {
    await FIREBASE_AUTH.signInWithEmailAndPassword(email, password);
    document.getElementById('adminPassword').value = '';
    setStatus('Signed in. You can publish posts now.', 'ok');
  } catch (error) {
    setStatus(formatFirebaseAuthError(error), 'err');
  }
}

async function signOutAdmin() {
  if (!FIREBASE_AUTH) return;
  await FIREBASE_AUTH.signOut();
  setStatus('Signed out.', 'ok');
}

function watchAdminAuth() {
  if (!initFirebase()) return;
  const authUser = document.getElementById('authUser');
  if (!FIREBASE_AUTH) {
    if (authUser) authUser.textContent = getFirebaseAuthEnvironmentMessage() || 'Firebase admin sign-in is unavailable.';
    return;
  }
  FIREBASE_AUTH.onAuthStateChanged(user => {
    currentAdmin = user;
    document.body.classList.toggle('is-admin', Boolean(user));
    if (authUser) authUser.textContent = user ? `Signed in as ${user.email}` : 'Not signed in.';
    if (user) loadSaved();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  resetPrompts();
  watchAdminAuth();
  loadSaved();
  loadHomepageSettings();
  document.getElementById('cardImageUrl').addEventListener('input', () => { syncDraftImageOverrides(); });
  document.getElementById('heroImageUrl').addEventListener('input', () => { syncDraftImageOverrides(); });
  document.getElementById('adminEmail').addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    signInAdmin();
  });
  document.getElementById('adminPassword').addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    signInAdmin();
  });
});
