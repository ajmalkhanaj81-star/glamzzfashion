export interface Product {
  id: string;
  name: string;
  category: string;
  sizes: string[];
  price: number | string;
  description: string;
  image: string;
  variants?: { size: string; price: number }[];
}
