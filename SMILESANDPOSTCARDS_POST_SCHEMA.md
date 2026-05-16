# Smiles and Postcards Post JSON Structure

Your generation API can return either:

```json
{
  "blog": {
    "...": "post fields here"
  }
}
```

or the post object directly:

```json
{
  "city": "Kyoto",
  "...": "post fields here"
}
```

The admin panel will normalize and save it to Firebase.

## Firestore Storage Shape

Generated content is now split across three collections:

- `cities` stores city-level metadata used for cards, ranking, and homepage display.
- `itineraries` stores trip structure, including `itinerary[].spots` as `placeId[]`.
- `places` stores real-world entities such as attractions, restaurants, and hidden gems.

That means input like:

```json
{
  "itinerary": [
    {
      "day": "Day 1",
      "spots": ["Hawa Mahal", "Amber Fort"]
    }
  ]
}
```

is persisted conceptually as:

```json
{
  "itinerary": [
    {
      "day": "Day 1",
      "spots": ["jaipur-place-hawa-mahal", "jaipur-place-amber-fort"]
    }
  ]
}
```

with matching `places/{placeId}` documents containing the full place data.

## Required Shape

```json
{
  "city": "Kyoto",
  "country": "Japan",
  "title": "Kyoto - Temples, Tea Houses & Quiet Mountain Paths",
  "excerpt": "A slow, practical Kyoto guide through lantern-lit lanes, temple gardens, matcha houses, and day trips into the hills.",
  "image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=900&q=80",
  "heroImage": "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1920&q=80",
  "featured": false,
  "days": 5,
  "budget": "¥9000/day",
  "bestSeason": "Mar-May, Oct-Nov",
  "date": "April 2026",
  "tags": ["asia", "culture", "food", "temples", "city-break"],
  "stats": {
    "days": "5",
    "budget": "¥45000",
    "bestMonth": "November",
    "walkScore": "8.5/10"
  },
  "itinerary": [
    {
      "day": "Day 1",
      "title": "Gion, Yasaka Shrine & Higashiyama",
      "text": "Begin in Gion before the lanes fill up, then walk toward Yasaka Shrine and the preserved streets of Higashiyama. Save late afternoon for tea houses and a quiet sunset near Kodai-ji.",
      "spots": ["Gion", "Yasaka Shrine", "Higashiyama", "Kodai-ji"]
    },
    {
      "day": "Day 2",
      "title": "Fushimi Inari & Sake Streets",
      "text": "Arrive early at Fushimi Inari and climb beyond the crowded lower gates. Later, explore Fushimi's sake breweries and canals for a softer local rhythm.",
      "spots": ["Fushimi Inari", "Mount Inari", "Fushimi Sake District"]
    },
    {
      "day": "Day 3",
      "title": "Arashiyama, Bamboo & Riverside Lunch",
      "text": "Visit Arashiyama's bamboo grove at sunrise, then walk to quieter temples and the river. Spend the afternoon around preserved villas and garden paths.",
      "spots": ["Arashiyama Bamboo Grove", "Tenryu-ji", "Okochi Sanso", "Katsura River"]
    },
    {
      "day": "Day 4",
      "title": "Philosopher's Path & Northern Temples",
      "text": "Follow the Philosopher's Path between small cafes, canals, and temple gardens. Continue north for understated shrines and a gentler Kyoto pace.",
      "spots": ["Philosopher's Path", "Nanzen-ji", "Eikan-do", "Ginkaku-ji"]
    },
    {
      "day": "Day 5",
      "title": "Nishiki Market & Kurama Day Trip",
      "text": "Start with breakfast snacks at Nishiki Market, then ride north to Kurama for mountain air, hot springs, and forested temple trails.",
      "spots": ["Nishiki Market", "Kurama", "Kibune", "Kurama-dera"]
    }
  ],
  "food": [
    {
      "name": "Omen Ginkaku-ji",
      "cuisine": "Udon",
      "desc": "A calm noodle house near Ginkaku-ji known for udon served with seasonal vegetables and deeply comforting dipping broth.",
      "price": "¥1500-2500",
      "image": "https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?w=500&q=80"
    },
    {
      "name": "Nishiki Market Stalls",
      "cuisine": "Market Snacks",
      "desc": "Pick your way through skewers, pickles, tamagoyaki, mochi, and fresh seafood snacks. Go before lunch crowds arrive.",
      "price": "¥500-1800",
      "image": "https://images.unsplash.com/photo-1553621042-f6e147245754?w=500&q=80"
    },
    {
      "name": "Ippudo Kyoto",
      "cuisine": "Ramen",
      "desc": "Reliable, rich tonkotsu ramen in central Kyoto. It is not hidden, but it is exactly what you want after a long walking day.",
      "price": "¥1000-1600",
      "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&q=80"
    },
    {
      "name": "Tsujiri Tea House",
      "cuisine": "Matcha Desserts",
      "desc": "A classic stop for matcha parfaits, soft serve, and tea. Best as a quiet afternoon reset between temple visits.",
      "price": "¥900-1800",
      "image": "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=500&q=80"
    }
  ],
  "gems": [
    {
      "name": "Otagi Nenbutsu-ji",
      "desc": "A hillside temple filled with hundreds of expressive stone figures, far quieter than Arashiyama's headline stops.",
      "tip": "Pair it with a walk through Saga-Toriimoto preserved street."
    },
    {
      "name": "Shinnyodo Temple",
      "desc": "A peaceful temple with beautiful autumn color and far fewer visitors than Kyoto's famous garden stops.",
      "tip": "Go late afternoon for soft light and a slower atmosphere."
    },
    {
      "name": "Kamo River at Dusk",
      "desc": "Locals gather along the riverbanks with snacks, music, and bicycles. It is Kyoto at its most relaxed.",
      "tip": "Bring market snacks and sit near Sanjo or Demachiyanagi."
    },
    {
      "name": "Kifune Shrine",
      "desc": "A lantern-lined mountain shrine north of the city, especially atmospheric after rain or in winter.",
      "tip": "Combine with Kurama if you want a full mountain day."
    }
  ],
  "budgetBreakdown": [
    {
      "category": "Accommodation",
      "budget": "¥3500-6000",
      "mid": "¥9000-16000",
      "luxury": "¥30000+",
      "notes": "Guesthouses and small hotels book quickly in spring and autumn."
    },
    {
      "category": "Food & Drink",
      "budget": "¥2500-4000",
      "mid": "¥5000-9000",
      "luxury": "¥15000+",
      "notes": "Markets, ramen, and set meals keep costs manageable."
    },
    {
      "category": "Transport",
      "budget": "¥800-1500",
      "mid": "¥1500-2500",
      "luxury": "¥5000+",
      "notes": "Use buses, trains, and plenty of walking."
    },
    {
      "category": "Activities",
      "budget": "¥1000-2500",
      "mid": "¥3000-6000",
      "luxury": "¥10000+",
      "notes": "Most temple entries are inexpensive but add up over several days."
    },
    {
      "category": "Total / Day",
      "budget": "¥7800-14000",
      "mid": "¥18500-33500",
      "luxury": "¥60000+",
      "notes": ""
    }
  ]
}
```

## Field Notes

- `featured: true` makes the large Prague-style card.
- `featured: false` makes a normal card.
- `days` should match the number of objects in `itinerary`.
- `image` is used on cards.
- `heroImage` is used on the detail page.
- `tags` are used for search and filters.
- `itinerary[].spots` should still be provided as place names in the generated JSON; the admin layer converts them to place document IDs when saving.
- `food` and `gems` should still be provided as full objects in the generated JSON; the admin layer stores them in the `places` collection and keeps references in the itinerary document.
- `budgetBreakdown` powers the detail-page table.
