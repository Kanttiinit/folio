const properties = {
  "A+": "contains allergens",
  "C+": "contains celery",
  E: "egg-free",
  G: "gluten-free",
  H: "healthier choice",
  L: "lactose-free",
  LL: "low in lactose",
  M: "milk-free",
  "N+": "contains nuts",
  "O+": "contains garlic",
  S: "soy-free",
  "S+": "contains soy",
  V: "vegetarian",
  VV: "vegan"
};

module.exports = property => {
  if (property in properties) {
    return properties[property];
  }
  return "Unknown";
};
