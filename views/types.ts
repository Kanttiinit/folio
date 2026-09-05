export type Area = { id: number; name: string; restaurants: Restaurant[] };
export type Course = { title: string; properties?: string[] };
export type Restaurant = {
  id: number;
  name: string;
  url: string;
  address: string;
  openingHours: string[];
};
