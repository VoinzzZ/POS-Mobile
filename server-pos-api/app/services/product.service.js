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

async function getAllProducts(filters = {} ) {
  const { search, categoryId, brandId } = filters;

  const safeCategoryId = categoryId && !isNaN(Number(categoryId)) ? Number(categoryId) : undefined;
  const safeBrandId = brandId && !isNaN(Number(brandId)) ? Number(brandId) : undefined;
 
  return prisma.product.findMany({
    where: {
      AND: [
        search? {
          name: {
            contains: search,
          },
        }
        : {},
        safeCategoryId ? { categoryId: safeCategoryId }: {},
        safeBrandId ? { brandId: safeBrandId } : {},
      ],
    },
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
  // Ambil product lama
  const existingProduct = await prisma.product.findUnique({
    where: { id: parseInt(id, 10) }
  });

  if (!existingProduct) throw new Error('Product not found');

  // Merge data baru ke data lama
  const updateData = {
    name: data.name ?? existingProduct.name,
    price: data.price ?? existingProduct.price,
    stock: data.stock ?? existingProduct.stock,
    imageUrl: data.imageUrl ?? existingProduct.imageUrl,
    brandId: data.brandId ?? existingProduct.brandId,
    categoryId: data.categoryId ?? existingProduct.categoryId,
  };

  return prisma.product.update({
    where: { id: parseInt(id, 10) },
    data: updateData
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
