export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  facts: string[];
  imageUrl: string;
  imageAlt: string;
  href: string;
  badge?: string;
    sponsors?: {
    id: string;
    name: string;
    tier: string;
  }[];
}

export interface Sponsor {
  id: string;
  name: string;
  imageUrl: string;
  imageAlt: string;
  href: string;
  tagline?: string;
}

export * from "./property";