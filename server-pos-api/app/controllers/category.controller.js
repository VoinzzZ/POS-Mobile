const categoryService = require('../services/category.service');

async function getAllCategories(req, res) {
  try {
    const categories = await categoryService.getAllCategories();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getCategoryById(req, res) {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function createCategory(req, res) {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({ success: true, message: 'Category created', data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

async function updateCategory(req, res) {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Category updated', data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

async function deleteCategory(req, res) {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
