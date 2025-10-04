const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create Admin User
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pos.com' },
    update: {},
    create: {
      userName: 'admin',
      email: 'admin@pos.com',
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
    },
  });

  console.log('✅ Admin user created:', {
    id: admin.id,
    userName: admin.userName,
    email: admin.email,
    role: admin.role,
  });

  // Create some sample categories
  const categories = [
    { name: 'Minuman' },
    { name: 'Makanan' },
    { name: 'Snack' },
  ];

  console.log('🏷️  Creating categories...');
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
    console.log(`   ✓ ${created.name}`);
  }

  // Create some sample brands
  const brands = [
    { name: 'Coca-Cola', categoryId: 1 }, // Minuman
    { name: 'Pepsi', categoryId: 1 },     // Minuman
    { name: 'Indomie', categoryId: 2 },   // Makanan
    { name: 'Chitato', categoryId: 3 },   // Snack
  ];

  console.log('🏪 Creating brands...');
  for (const brand of brands) {
    const created = await prisma.brand.upsert({
      where: { name: brand.name },
      update: {},
      create: brand,
    });
    console.log(`   ✓ ${created.name}`);
  }

  // Create some sample products
  const products = [
    { name: 'Coca-Cola 330ml', price: 5000, stock: 100, brandId: 1 },
    { name: 'Coca-Cola 1L', price: 12000, stock: 50, brandId: 1 },
    { name: 'Pepsi 330ml', price: 5000, stock: 80, brandId: 2 },
    { name: 'Indomie Goreng', price: 3000, stock: 200, brandId: 3 },
    { name: 'Indomie Soto', price: 3000, stock: 150, brandId: 3 },
    { name: 'Chitato Sapi Panggang', price: 8000, stock: 60, brandId: 4 },
  ];

  console.log('📦 Creating products...');
  for (const product of products) {
    const created = await prisma.product.create({
      data: product,
    });
    console.log(`   ✓ ${created.name} - Rp ${created.price}`);
  }

  console.log('');
  console.log('✨ Seed completed successfully!');
  console.log('');
  console.log('═════════════════════════════════════');
  console.log('  Admin Credentials');
  console.log('═════════════════════════════════════');
  console.log('  Email:    admin@pos.com');
  console.log('  Password: Admin123!');
  console.log('  Role:     ADMIN');
  console.log('═════════════════════════════════════');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
