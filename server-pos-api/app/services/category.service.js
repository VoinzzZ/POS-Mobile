const prisma = require('../config/mysql.db');

async function getAllCategories() {
  return prisma.category.findMany({ orderBy: { createdAt: 'desc' } });
}

async function getCategoryById(id) {
  return prisma.category.findUnique({ where: { id: parseInt(id) } });
}

async function createCategory(data) {
  if (!data.name) throw new Error('Category name is required');
  return prisma.category.create({ data: { name: data.name } });
}

async function updateCategory(id, data) {
  return prisma.category.update({
    where: { id: parseInt(id) },
    data: { name: data.name }
  });
}

async function deleteCategory(id) {
  return prisma.category.delete({ where: { id: parseInt(id) } });
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
