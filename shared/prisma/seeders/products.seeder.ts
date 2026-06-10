import { PrismaClient } from '../../src/generated/prisma';

const categories = [
  'Electronics',
  'Sports',
  'Home',
  'Accessories',
  'Books',
  'Office',
];

const categoryEmoji: Record<string, string> = {
  Electronics: '🎧',
  Sports:      '👟',
  Home:        '🏠',
  Accessories: '🎒',
  Books:       '📚',
  Office:      '🖊️',
};

const adjectives = [
  'Premium',
  'Smart',
  'Portable',
  'Advanced',
  'Compact',
  'Wireless',
  'Eco',
  'Professional',
  'Deluxe',
  'Modern',
];

const productTypes = [
  'Headphones',
  'Speaker',
  'Backpack',
  'Coffee Maker',
  'Desk Lamp',
  'Keyboard',
  'Mouse',
  'Yoga Mat',
  'Water Bottle',
  'Monitor',
  'Chair',
  'Notebook',
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPrice(min: number, max: number): number {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

function generateProducts(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const adjective = randomItem(adjectives);
    const type = randomItem(productTypes);

    const category = randomItem(categories);
    return {
      name: `${adjective} ${type} ${i + 1}`,
      description: `${adjective.toLowerCase()} ${type.toLowerCase()} for everyday use`,
      price: randomPrice(10, 500),
      stock: Math.floor(Math.random() * 100) + 1,
      category,
      emoji: categoryEmoji[category] ?? '📦',
      isActive: true,
    };
  });
}

export async function seedProducts(prisma: PrismaClient) {
  const existing = await prisma.product.count();

  if (existing > 0) {
    console.log('  products: already seeded, skipping');
    return;
  }

  const products = generateProducts(200);

  const { count } = await prisma.product.createMany({
    data: products,
  });

  console.log('  products: %d created', count);
}
