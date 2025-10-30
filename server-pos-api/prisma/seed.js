const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create System Roles
  console.log('👥 Creating system roles...');

  const ownerRole = await prisma.m_role.upsert({
    where: { role_name: 'OWNER' },
    update: {},
    create: {
      role_name: 'OWNER',
      role_code: 'OWNER',
      role_description: 'Pemilik toko dengan akses penuh ke tenant-nya',
      role_level: 1,
      is_system_role: true,
      is_active: true
    },
  });

  const adminRole = await prisma.m_role.upsert({
    where: { role_name: 'ADMIN' },
    update: {},
    create: {
      role_name: 'ADMIN',
      role_code: 'ADMIN',
      role_description: 'Admin toko dengan akses manajemen',
      role_level: 2,
      is_system_role: true,
      is_active: true
    },
  });

  const cashierRole = await prisma.m_role.upsert({
    where: { role_name: 'CASHIER' },
    update: {},
    create: {
      role_name: 'CASHIER',
      role_code: 'CASHIER',
      role_description: 'Kasir untuk transaksi harian',
      role_level: 3,
      is_system_role: true,
      is_active: true
    },
  });

  const inventoryRole = await prisma.m_role.upsert({
    where: { role_name: 'INVENTORY' },
    update: {},
    create: {
      role_name: 'INVENTORY',
      role_code: 'INVENTORY',
      role_description: 'Staf inventory untuk mengelola stok dan produk',
      role_level: 4,
      is_system_role: true,
      is_active: true
    },
  });

  console.log('   ✓ OWNER role created');
  console.log('   ✓ ADMIN role created');
  console.log('   ✓ CASHIER role created');
  console.log('   ✓ INVENTORY role created');

  // Create Super Admin User
  console.log('🔧 Creating Super Admin user...');
  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  const superAdmin = await prisma.m_user.upsert({
    where: { user_email: 'admin@kasirgo.com' },
    update: {},
    create: {
      user_name: 'admin',
      user_email: 'admin@kasirgo.com',
      user_password: hashedPassword,
      role_id: null, // Super admin doesn't need role
      is_sa: true, // Super Admin flag
      user_is_verified: true,
      is_active: true,
      created_by: null
    },
  });

  console.log('✅ Super Admin user created:', {
    id: superAdmin.user_id,
    userName: superAdmin.user_name,
    email: superAdmin.user_email,
    isSa: superAdmin.is_sa,
  });

  console.log('');
  console.log('✨ Seed completed successfully!');
  console.log('');
  console.log('═════════════════════════════════════');
  console.log('  Super Admin Credentials');
  console.log('═════════════════════════════════════');
  console.log('  Email:    admin@kasirgo.com');
  console.log('  Password: Admin123!');
  console.log('  Role:     SUPER ADMIN');
  console.log('  SA Flag:  true');
  console.log('  Status:   Active & Verified');
  console.log('═════════════════════════════════════');
  console.log('');
  console.log('Available System Roles:');
  console.log('  • OWNER (Level 1) - Pemilik toko');
  console.log('  • ADMIN (Level 2) - Admin toko');
  console.log('  • CASHIER (Level 3) - Kasir');
  console.log('  • INVENTORY (Level 4) - Staf inventory');
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