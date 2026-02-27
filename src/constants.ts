import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'arena-leggings',
    name: 'ARENA LEGGINGS',
    category: 'Leggings',
    sizes: ['M', 'L', 'XL', '2XL', '3XL'],
    price: 225,
    description: 'Trendy and comfortable Arena leggings for women. Perfect for daily wear and casual outings.',
    image: 'https://picsum.photos/seed/fashion-model-1/800/1000',
    variants: [
      { size: 'M to 2XL', price: 225 },
      { size: '3XL', price: 230 }
    ]
  },
  {
    id: 'zara-anglefit',
    name: 'ZARA ANGLEFIT',
    category: 'Leggings',
    sizes: ['M', 'L', 'XL', '2XL'],
    price: 185,
    description: 'Premium Zara Anglefit leggings. Designed for a perfect fit and long-lasting comfort.',
    image: 'https://picsum.photos/seed/fashion-model-2/800/1000',
    variants: [
      { size: 'M to 2XL', price: 185 }
    ]
  },
  {
    id: 'shimmer-leggings',
    name: 'SHIMMER LEGGINGS',
    category: 'Leggings',
    sizes: ['L', 'XL', '2XL'],
    price: 270,
    description: 'Glamorous shimmer leggings for party wear. Shine bright with this elegant collection.',
    image: 'https://picsum.photos/seed/fashion-model-3/800/1000',
    variants: [
      { size: 'L to 2XL', price: 270 }
    ]
  },
  {
    id: 'ayra-leggings',
    name: 'AYRA LEGGINGS',
    category: 'Leggings',
    sizes: ['L', 'XL', '2XL'],
    price: 155,
    description: 'Best quality Ayra leggings at the lowest price. Soft fabric and stylish design.',
    image: 'https://picsum.photos/seed/fashion-model-4/800/1000',
    variants: [
      { size: 'L to 2XL', price: 155 }
    ]
  },
  {
    id: 'straight-phant',
    name: 'STRAIGHT PHANT',
    category: 'Pants',
    sizes: ['L', 'XL', '2XL'],
    price: 250,
    description: 'Classic straight pants for women. Ideal for office wear and formal occasions.',
    image: 'https://picsum.photos/seed/fashion-model-5/800/1000',
    variants: [
      { size: 'L to 2XL', price: 250 }
    ]
  },
  {
    id: 'risa-paijama-set',
    name: 'RISA PAIJAMA SET',
    category: 'Nightwear',
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    price: 350,
    description: 'Super soft Risa pajama set. Stay comfortable all night with this premium nightwear.',
    image: 'https://picsum.photos/seed/fashion-model-6/800/1000',
    variants: [
      { size: 'S to 3XL', price: 350 }
    ]
  },
  {
    id: 'sofy-maternity-nighty',
    name: 'SOFY MATERNITY NIGHTY',
    category: 'Nightwear',
    sizes: ['L', 'XL', '2XL'],
    price: 299,
    description: 'Specially designed maternity nighty for ultimate comfort during pregnancy.',
    image: 'https://picsum.photos/seed/fashion-model-7/800/1000',
    variants: [
      { size: 'L to 2XL', price: 299 }
    ]
  },
  {
    id: 'jasmin-pattiyala-leggings',
    name: 'JASMIN PATTIYALA LEGGINGS',
    category: 'Leggings',
    sizes: ['L', 'XL', '2XL'],
    price: 159,
    description: 'Traditional Jasmin Pattiyala style leggings. Perfect match for your ethnic wear.',
    image: 'https://picsum.photos/seed/fashion-model-8/800/1000',
    variants: [
      { size: 'L to 2XL', price: 159 }
    ]
  }
];
