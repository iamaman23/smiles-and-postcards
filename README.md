# Smiles and Postcards

Smiles and Postcards is a static travel storytelling site with a public reader experience and a protected admin panel for generating and publishing destination content.

The frontend is ready to be hosted on Vercel, while Firebase remains the backend for:

- Firestore
- Authentication
- Analytics

## Project Structure

- `index.html`: public site entrypoint
- `admin.html`: protected admin panel
- `analytics.js`: Firebase analytics bootstrap
- `smilesandpostcards-recommendation-intents.js`: recommendation prompt dataset
- `smilesandpostcards-site.js`: extracted public-site logic mirror
- `smilesandpostcards-admin.js`: extracted admin logic mirror
- `vercel.json`: Vercel routing and headers
- `firebase.json`: optional Firebase Hosting configuration
- `firestore.rules`: Firestore access control

## Deploy To Vercel

1. Push this repo to GitHub.
2. Import the repo into Vercel.
3. Use the default static deployment settings.
4. Deploy.

The site is configured so:

- `/` serves `index.html`
- `/admin` serves `admin.html`

## Firebase Checklist For Vercel

Firebase is still required even when hosting on Vercel.

1. In Firebase Authentication, add your Vercel domain and any custom domain under `Authorized domains`.
2. Keep the Firebase config in `index.html`, `admin.html`, and `analytics.js`.
3. Deploy Firestore rules from this repo whenever they change.
4. Open `admin.html` over `http://localhost` or a deployed `https://` URL when testing admin sign-in. Firebase auth will not work reliably from `file://`.

To deploy rules only:

```bash
firebase deploy --only firestore:rules
```

## Firebase Setup

Follow the full setup guide in `SMILESANDPOSTCARDS_FIREBASE_DEPLOYMENT.md`.

## Content Schema

The generated destination JSON contract is documented in `SMILESANDPOSTCARDS_POST_SCHEMA.md`.
