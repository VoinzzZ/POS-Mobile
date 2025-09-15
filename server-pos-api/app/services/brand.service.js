const prisma = require('../config/mysql.db');

async function getAllBrands() {
  return prisma.brand.findMany({ orderBy: { createdAt: 'desc' } });
}

async function getBrandById(id) {
  return prisma.brand.findUnique({ where: { id: parseInt(id) } });
}

async function createBrand(data) {
  if (!data.name) throw new Error('Brand name is required');
  return prisma.brand.create({ data: { name: data.name } });
}

async function updateBrand(id, data) {
  return prisma.brand.update({
    where: { id: parseInt(id) },
    data: { name: data.name }
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
