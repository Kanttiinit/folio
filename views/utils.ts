const properties = {
  'A+': 'contains allergens',
  'C+': 'contains celery',
  E: 'egg-free',
  G: 'gluten-free',
  H: 'healthier choice',
  L: 'lactose-free',
  LL: 'low in lactose',
  M: 'milk-free',
  'N+': 'contains nuts',
  'O+': 'contains garlic',
  S: 'soy-free',
  'S+': 'contains soy',
  V: 'vegetarian',
  VV: 'vegan',
};

export function explainProperty(property: string) {
  if (property in properties) {
    return (properties as any)[property];
  }
  return 'Unknown';
}

const translations = {
  homepage: {
    fi: 'Kotisivu',
    en: 'Homepage',
  },
  today: {
    fi: 'Tänään',
    en: 'Today',
  },
  tomorrow: {
    fi: 'Huomenna',
    en: 'Tomorrow',
  },
  noMenu: {
    fi: 'Ei ruokalistaa.',
    en: 'No menu.',
  },
};

export function translate(lang: 'fi' | 'en', key: keyof typeof translations) {
  if (key in translations) {
    if (lang in translations[key]) {
      return translations[key][lang];
    }
  }
  throw new Error('Translation not found for: ' + key + ', in ' + lang);
}
