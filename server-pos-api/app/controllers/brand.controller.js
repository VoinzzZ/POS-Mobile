const brandService = require('../services/brand.service');

async function getAllBrands(req, res) {
  try {
    const brands = await brandService.getAllBrands();
    res.status(200).json({ success: true, data: brands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getBrandById(req, res) {
  try {
    const brand = await brandService.getBrandById(req.params.id);
    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }
    res.status(200).json({ success: true, data: brand });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function createBrand(req, res) {
  try {
    const brand = await brandService.createBrand(req.body);
    res.status(201).json({ success: true, message: 'Brand created', data: brand });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

async function updateBrand(req, res) {
  try {
    const brand = await brandService.updateBrand(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Brand updated', data: brand });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

async function deleteBrand(req, res) {
  try {
    await brandService.deleteBrand(req.params.id);
    res.status(200).json({ success: true, message: 'Brand deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

module.exports = {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand
};
