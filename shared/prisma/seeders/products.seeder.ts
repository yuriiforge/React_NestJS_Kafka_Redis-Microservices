import { PrismaClient } from '../../src/generated/prisma';

const products = [
  { name: 'Wireless Headphones', description: 'Over-ear noise-cancelling headphones', price: 89.99,  stock: 42, category: 'Electronics' },
  { name: 'Running Shoes',        description: 'Lightweight trail running shoes',       price: 129.99, stock: 18, category: 'Sports'      },
  { name: 'Coffee Maker',         description: '12-cup programmable coffee maker',      price: 59.99,  stock: 7,  category: 'Home'        },
  { name: 'Backpack',             description: '30L waterproof hiking backpack',        price: 49.99,  stock: 25, category: 'Accessories' },
  { name: 'Desk Lamp',            description: 'LED desk lamp with USB charging port',  price: 34.99,  stock: 31, category: 'Home'        },
  { name: 'Yoga Mat',             description: 'Non-slip 6mm thick yoga mat',           price: 24.99,  stock: 60, category: 'Sports'      },
];

export async function seedProducts(prisma: PrismaClient) {
  const existing = await prisma.product.count();

  if (existing > 0) {
    console.log('  products: already seeded, skipping');
    return;
  }

  const { count } = await prisma.product.createMany({
    data: products.map((p) => ({ ...p, isActive: true })),
  });

  console.log('  products: %d created', count);
}
