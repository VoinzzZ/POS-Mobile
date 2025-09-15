const prisma = require('../config/mysql.db');

async function createProduct(data) {
  return prisma.product.create({
    data: {
      name: data.name,
      price: data.price,
      stock: data.stock ?? 0,
      imageUrl: data.imageUrl ?? null,
      brandId: data.brandId || null,       
      categoryId: data.categoryId || null, 
    },
    include: {
      brand: true,
      category: true,
    }
  });
}

async function getAllProducts() {
  return prisma.product.findMany({
    include: { category: true, brand: true },
    orderBy: { createdAt: 'desc' }
  });
}

async function getProductById(id) {
  return prisma.product.findUnique({
    where: { id: Number(id) },
    include: { category: true, brand: true }
  });
}

async function updateProduct(id, data) {
  return prisma.product.update({
    where: { id: Number(id) },
    data: {
      name: data.name,
      price: data.price,
      stock: data.stock ?? 0,
      imageUrl: data.imageUrl ?? null,
      brandId: data.brandId ?? null,       
      categoryId: data.categoryId ?? null,
    },
    include: {
      brand: true,
      category: true,
    }
  });
}

async function deleteProduct(id) {
  return prisma.product.delete({ where: { id: Number(id) } });
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
