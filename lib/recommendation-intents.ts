export type RecommendationIntent = {
  id: string;
  title: string;
  filters?: Record<string, unknown>;
  ranking?: Record<string, unknown>;
};

export const RECOMMENDATION_INTENTS: RecommendationIntent[] = [
  {
    id: "budget_europe",
    title: "Best Budget Trips in Europe",
    filters: {
      continent: "Europe",
      travelStyles: ["budget", "backpacking"],
      scores: { affordability: 8 }
    },
    ranking: {
      limit: 10,
      scoreWeights: { affordability: 4, finalScore: 2, walkability: 1, food: 1 },
      boostTravelStyles: ["budget", "backpacking"],
      boostTags: ["weekend", "first_time"]
    }
  },
  {
    id: "foodie_asia",
    title: "Asia's Best Food Cities",
    filters: {
      continent: "Asia",
      travelStyles: ["foodie"],
      scores: { food: 8 }
    },
    ranking: {
      limit: 10,
      scoreWeights: { food: 4, finalScore: 2, culture: 1 },
      boostTravelStyles: ["foodie"],
      boostTags: ["nightlife"]
    }
  },
  {
    id: "romantic_getaways",
    title: "Romantic Escapes for Couples",
    filters: {
      travelStyles: ["romantic"]
    },
    ranking: {
      limit: 10,
      scoreWeights: { finalScore: 3, safety: 1, culture: 1 },
      boostTravelStyles: ["romantic"],
      boostTags: ["scenic", "coastal", "architecture"],
      preferPace: "relaxed"
    }
  },
  {
    id: "solo_friendly",
    title: "Best Cities for Solo Travelers",
    filters: {
      travelStyles: ["solo"]
    },
    ranking: {
      limit: 10,
      scoreWeights: { safety: 3, walkability: 2, connectivity: 2, finalScore: 2 },
      boostTravelStyles: ["solo"],
      boostTags: ["first_time"]
    }
  },
  {
    id: "digital_nomad_hubs",
    title: "Top Digital Nomad Cities",
    filters: {
      travelStyles: ["digital_nomad"]
    },
    ranking: {
      limit: 10,
      scoreWeights: { connectivity: 4, affordability: 2, finalScore: 2, walkability: 1 },
      boostTravelStyles: ["digital_nomad"],
      boostTags: ["weekend"]
    }
  },
  {
    id: "walkable_city_breaks",
    title: "Most Walkable City Breaks",
    filters: {
      scores: { walkability: 9 }
    },
    ranking: {
      limit: 10,
      scoreWeights: { walkability: 5, finalScore: 2, culture: 1 },
      boostTags: ["weekend", "architecture", "history"]
    }
  },
  {
    id: "nightlife_capitals",
    title: "Cities That Never Sleep",
    filters: {
      travelStyles: ["party"]
    },
    ranking: {
      limit: 10,
      scoreWeights: { nightlife: 5, finalScore: 2, connectivity: 1 },
      boostTravelStyles: ["party"],
      preferPace: "fast"
    }
  },
  {
    id: "cultural_capitals",
    title: "Culture-Rich Destinations",
    filters: {
      travelStyles: ["cultural"]
    },
    ranking: {
      limit: 10,
      scoreWeights: { culture: 5, finalScore: 2, walkability: 1 },
      boostTravelStyles: ["cultural"],
      boostTags: ["history", "architecture"]
    }
  },
  {
    id: "nature_escape",
    title: "Nature Escapes Around the World",
    filters: {
      scores: { nature: 9 }
    },
    ranking: {
      limit: 10,
      scoreWeights: { nature: 5, finalScore: 2, safety: 1 },
      boostTags: ["nature", "mountains", "coastal"],
      preferPace: "relaxed"
    }
  },
  {
    id: "family_friendly_trips",
    title: "Best Family-Friendly Destinations",
    filters: {
      travelStyles: ["family"]
    },
    ranking: {
      limit: 10,
      scoreWeights: { familyFriendly: 5, safety: 2, walkability: 1, finalScore: 2 },
      boostTravelStyles: ["family"]
    }
  },
  {
    id: "first_time_europe",
    title: "Perfect First Trips to Europe",
    filters: {
      continent: "Europe",
      tags: ["first_time"]
    },
    ranking: {
      limit: 10,
      scoreWeights: { safety: 2, walkability: 2, connectivity: 2, finalScore: 2 },
      boostTags: ["first_time", "weekend"]
    }
  },
  {
    id: "offbeat_adventures",
    title: "Offbeat Destinations Worth Discovering",
    filters: {
      tags: ["offbeat"]
    },
    ranking: {
      limit: 10,
      scoreWeights: { finalScore: 3, culture: 1, nature: 1 },
      boostTags: ["offbeat", "hidden_gems"]
    }
  },
  {
    id: "luxury_city_escapes",
    title: "Luxury City Escapes",
    filters: {
      travelStyles: ["luxury"]
    },
    ranking: {
      limit: 10,
      scoreWeights: { finalScore: 4, culture: 1, food: 1, safety: 1 },
      boostTravelStyles: ["luxury"],
      preferBudgetRange: "luxury"
    }
  },
  {
    id: "cheap_weekend_trips",
    title: "Cheap Weekend Getaways",
    filters: {
      tags: ["weekend"],
      scores: { affordability: 8 }
    },
    ranking: {
      limit: 10,
      scoreWeights: { affordability: 4, walkability: 2, finalScore: 2 },
      boostTags: ["weekend"],
      boostTravelStyles: ["budget"]
    }
  },
  {
    id: "architecture_lovers",
    title: "Cities for Architecture Lovers",
    filters: {
      tags: ["architecture"]
    },
    ranking: {
      limit: 10,
      scoreWeights: { culture: 3, walkability: 1, finalScore: 2 },
      boostTags: ["architecture", "history", "photography"]
    }
  },
  {
    id: "history_buff_destinations",
    title: "Historic Cities Full of Stories",
    filters: {
      tags: ["history"]
    },
    ranking: {
      limit: 10,
      scoreWeights: { culture: 4, finalScore: 2, walkability: 1 },
      boostTags: ["history", "architecture"],
      boostTravelStyles: ["cultural"]
    }
  },
  {
    id: "coastal_city_vibes",
    title: "Coastal Cities with Great Vibes",
    filters: {
      tags: ["coastal"]
    },
    ranking: {
      limit: 10,
      scoreWeights: { finalScore: 3, food: 1, nature: 1 },
      boostTags: ["coastal", "scenic"]
    }
  },
  {
    id: "mountain_towns",
    title: "Mountain Town Escapes",
    filters: {
      tags: ["mountains"]
    },
    ranking: {
      limit: 10,
      scoreWeights: { nature: 4, finalScore: 2, safety: 1 },
      boostTags: ["mountains", "nature"],
      preferPace: "relaxed"
    }
  },
  {
    id: "hidden_gem_cities",
    title: "Underrated Hidden Gem Cities",
    filters: {
      tags: ["offbeat", "hidden_gems"]
    },
    ranking: {
      limit: 10,
      scoreWeights: { finalScore: 3, culture: 1, food: 1 },
      boostTags: ["offbeat", "hidden_gems"]
    }
  },
  {
    id: "best_food_on_budget",
    title: "Amazing Food Without Breaking the Bank",
    filters: {
      travelStyles: ["foodie", "budget"]
    },
    ranking: {
      limit: 10,
      scoreWeights: { food: 4, affordability: 3, finalScore: 2 },
      boostTravelStyles: ["foodie", "budget"]
    }
  }
];
