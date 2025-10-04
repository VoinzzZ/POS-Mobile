const prisma = require('../config/mysql.db');

async function getAllBrands() {
  return prisma.brand.findMany({ 
    include: { category: true },
    orderBy: { createdAt: 'desc' } 
  });
}

async function getBrandById(id) {
  return prisma.brand.findUnique({ 
    where: { id: parseInt(id) },
    include: { category: true }
  });
}

async function createBrand(data) {
  if (!data.name) throw new Error('Brand name is required');
  return prisma.brand.create({ 
    data: { 
      name: data.name,
      categoryId: data.categoryId ? parseInt(data.categoryId) : null
    },
    include: { category: true }
  });
}

async function updateBrand(id, data) {
  return prisma.brand.update({
    where: { id: parseInt(id) },
    data: { 
      name: data.name,
      categoryId: data.categoryId !== undefined ? (data.categoryId ? parseInt(data.categoryId) : null) : undefined
    },
    include: { category: true }
  });
}

async function deleteBrand(id) {
  return prisma.brand.delete({ where: { id: parseInt(id) } });
}

module.exports = {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand
};
