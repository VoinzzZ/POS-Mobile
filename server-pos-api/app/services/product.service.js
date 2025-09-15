const prisma = require('../config/mysql.db');

async function createProduct(data) {
  // Validate Category
  if (data.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) throw new Error('Category does not exist');
  }

  // Validate Brand
  if (data.brandId) {
    const brand = await prisma.brand.findUnique({ where: { id: data.brandId } });
    if (!brand) throw new Error('Brand does not exist');
  }

  return prisma.product.create({ data });
}

async function getAllProducts() {
  return prisma.product.findMany({
    include: { category: true, brand: true },
    orderBy: { createdAt: 'desc' },
  });
}

async function getProductById(id) {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id, 10) },
    include: { category: true, brand: true },
  });

  if (!product) throw new Error('Product not found');
  return product;
}

async function updateProduct(id, data) {
  await getProductById(id);

  if (data.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) throw new Error('Category does not exist');
  }

  if (data.brandId) {
    const brand = await prisma.brand.findUnique({ where: { id: data.brandId } });
    if (!brand) throw new Error('Brand does not exist');
  }

  return prisma.product.update({ where: { id: parseInt(id, 10) }, data });
}

async function deleteProduct(id) {
  await getProductById(id);
  return prisma.product.delete({ where: { id: parseInt(id, 10) } });
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
