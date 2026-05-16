# Smiles and Postcards Backend Setup

This project is now prepared to host the frontend on Vercel while continuing to use Firebase for backend services.

## What Firebase Does Now

- Firebase Firestore stores generated city cards.
- Firebase Authentication protects the admin panel.
- Firebase Analytics tracks consented usage.

The flow is:

```text
Vercel-hosted frontend -> Firebase login -> Firestore cities + itineraries collections -> public website reads structured trip data
```

## 1. Create Firebase Project

1. Go to the Firebase Console.
2. Create a new project.
3. Add a Web App.
4. Copy the Firebase config object.

Paste that config into both files:

- `index.html`
- `admin.html`

Replace this placeholder:

```js
const FIREBASE_CONFIG = {
  apiKey: 'PASTE_FIREBASE_API_KEY',
  authDomain: 'PASTE_PROJECT_ID.firebaseapp.com',
  projectId: 'PASTE_PROJECT_ID',
  storageBucket: 'PASTE_PROJECT_ID.appspot.com',
  messagingSenderId: 'PASTE_SENDER_ID',
  appId: 'PASTE_APP_ID'
};
```

## 2. Enable Firestore

1. In Firebase Console, open Firestore Database.
2. Create database.
3. Start in production mode.
4. Choose the nearest region.

Firestore collections used by this app:

```text
cities
itineraries
siteConfig
```

## 3. Enable Admin Login

1. Open Authentication.
2. Enable Email/Password sign-in.
3. Add your admin user email and password.
4. Open `firestore.rules`.
5. Replace:

```text
REPLACE_WITH_YOUR_ADMIN_EMAIL@example.com
```

with your real admin email.

This lets everyone read destination data, but only your admin account can create, edit, or delete records in `cities`, `itineraries`, `places`, and `siteConfig`.

If you use a custom domain for the admin page, add that domain in Firebase Authentication under:

```text
Authentication -> Settings -> Authorized domains
```

## 4. Deploy The Frontend On Vercel

1. Push this repository to GitHub.
2. Import it into Vercel.
3. Deploy with the default static-site settings.
4. Use `/admin` for the admin panel.

## 5. Deploy Firebase Rules

Install Firebase CLI once if you have not already:

```bash
npm install -g firebase-tools
```

Log in:

```bash
firebase login
```

Connect this folder to your project:

```bash
firebase use --add
```

Deploy Firestore rules:

```bash
firebase deploy --only firestore:rules
```

After Vercel deployment:

- Website: `https://YOUR-PROJECT.vercel.app/`
- Admin: `https://YOUR-PROJECT.vercel.app/admin`

Important: add your Vercel domain and any custom domain to Firebase Authentication:

```text
Authentication -> Settings -> Authorized domains
```

## 6. Using The Admin Panel

1. Open `/admin`.
2. Sign in with your Firebase admin email/password.
3. Enter city name.
4. Enter your generation API endpoint.
5. Generate card JSON.
6. Review preview.
7. Click `Save card to site`.

The card is saved into Firestore and automatically appears on the public site hosted on Vercel.

Current storage model:

```text
cities/
  core destination metadata, images, scores, filtering tags, ranking fields

itineraries/
  structured itinerary content keyed by cityId and days

places/   (optional future layer)
  reusable place entities such as food spots, gems, and attractions
```

## Important API-Key Note

Do not put a private long-lived server key directly into a deployed admin page unless you are comfortable with that exposure.

Best practice:

```text
Admin panel -> your secure generation endpoint -> Gemini API
```

Your generation endpoint should return the JSON structure described in `SMILESANDPOSTCARDS_POST_SCHEMA.md`.

This project can also call Gemini directly from the admin page if you choose to use a browser key and accept that tradeoff.
