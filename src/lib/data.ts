export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface DeliveryLocation {
  name: string;
  price: number;
}

export const businessContact = {
  location: "East Legon (Boundary Road)",
  phones: ["0549537343", "0206819878"],
};

export const menuItems: MenuItem[] = [
  {
    id: "regular",
    name: "Regular",
    description: "CheckCheck Rice, Chicken, Special Salad Mix, Eggs",
    price: 60,
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80",
    category: "Meals",
  },
  {
    id: "loaded",
    name: "Loaded",
    description: "More CheckCheck Rice, Larger Chicken, Special Salad Mix, Eggs & Sausage",
    price: 80,
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=80",
    category: "Meals",
  },
  {
    id: "odogwu",
    name: "Odogwu",
    description: "More CheckCheck Rice, 2 Larger Chickens, Special Salad Mix, Eggs & Sausage",
    price: 120,
    image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&q=80",
    category: "Meals",
  },
];

export const deliveryLocations: DeliveryLocation[] = [
  { name: "Abeka", price: 35.00 },
  { name: "Ablekuma", price: 50.00 },
  { name: "Abokobi", price: 40.00 },
  { name: "Achimota", price: 35.00 },
  { name: "Adenta Frafraha", price: 35.00 },
  { name: "Adenta Housing", price: 30.00 },
  { name: "Adenta SDA", price: 30.00 },
  { name: "Adjimganor", price: 25.00 },
  { name: "Agboba", price: 35.00 },
  { name: "Accra", price: 40.00 },
  { name: "Airport", price: 35.00 },
  { name: "Airport Residential", price: 35.00 },
  { name: "Ashiaman", price: 55.00 },
  { name: "Ashiyie", price: 40.00 },
  { name: "Boteyman", price: 40.00 },
  { name: "Burma Camp", price: 40.00 },
  { name: "Cantoment", price: 40.00 },
  { name: "Chantang", price: 40.00 },
  { name: "Chorkor", price: 50.00 },
  { name: "Circle", price: 50.00 },
  { name: "Dansoman", price: 45.00 },
  { name: "Darkuman", price: 40.00 },
  { name: "Dewena", price: 60.00 },
  { name: "Dodowa", price: 60.00 },
  { name: "Dome", price: 40.00 },
  { name: "Dzorwulu", price: 30.00 },
  { name: "East Airport", price: 35.00 },
  { name: "East Legon", price: 20.00 },
  { name: "East Legon (Boundary Road)", price: 0.00 },
  { name: "East Legon Hills", price: 30.00 },
  { name: "Gbawe", price: 50.00 },
  { name: "Kaneshie", price: 40.00 },
  { name: "Kwabenya", price: 50.00 },
  { name: "Kwashieman", price: 40.00 },
  { name: "Labadi", price: 40.00 },
  { name: "Labone", price: 40.00 },
  { name: "LA", price: 45.00 },
  { name: "Lakeside C1–C6", price: 35.00 },
  { name: "Lakeside C7+", price: 40.00 },
  { name: "Lakeside Hill", price: 35.00 },
  { name: "Lapaz", price: 20.00 },
  { name: "Legon Campus", price: 35.00 },
  { name: "Lekma", price: 25.00 },
  { name: "Madina", price: 50.00 },
  { name: "Mamprobi", price: 35.00 },
  { name: "Manet", price: 40.00 },
  { name: "Mile 7", price: 40.00 },
  { name: "Nima", price: 40.00 },
  { name: "North Legon", price: 30.00 },
  { name: "Nungua", price: 40.00 },
  { name: "Ofankor", price: 45.00 },
  { name: "Ogbojo", price: 25.00 },
  { name: "Osu", price: 40.00 },
  { name: "Oyibi", price: 40.00 },
  { name: "Pantang", price: 35.00 },
  { name: "Pig Farm", price: 35.00 },
  { name: "Pokuase", price: 50.00 },
  { name: "Sakumono", price: 45.00 },
  { name: "Santou", price: 35.00 },
  { name: "School Junction", price: 25.00 },
  { name: "Sowutuom", price: 45.00 },
  { name: "Spintex", price: 40.00 },
  { name: "Taifa", price: 40.00 },
  { name: "Tema", price: 55.00 },
  { name: "Tema Comm. 18", price: 45.00 },
  { name: "Tesano", price: 35.00 },
  { name: "Teshie", price: 40.00 },
  { name: "Tseaaddo", price: 40.00 },
];
