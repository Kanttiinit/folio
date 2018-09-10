const translations = {
  homepage: {
    fi: "Kotisivu",
    en: "Homepage"
  },
  today: {
    fi: "Tänään",
    en: "Today"
  },
  tomorrow: {
    fi: "Huomenna",
    en: "Tomorrow"
  },
  noMenu: {
    fi: "Ei ruokalistaa.",
    en: "No menu."
  }
};

module.exports = lang => key => {
  if (key in translations) {
    if (lang in translations[key]) {
      return translations[key][lang];
    }
  }
  throw new Error("Translation not found for: " + key + ", in " + lang);
};
