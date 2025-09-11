const BaseController = require('./base.controller');
const ProductService = require('../services/product.service');

class ProductController extends BaseController {
    constructor() {
        super();
    }

    addProduct = this.asyncHandler(async (req, res) => {
        this.validateRequiredFields(req.body, ['name', 'brand', 'price', 'stock']);
        const product = await ProductService.createProduct(req.body);

        return this.sendSuccess(res, {
            statusCode: 201,
            message: 'Product created successfully',
            data: product
        });
    });

    getAllProducts = this.asyncHandler(async (req, res) => {
        const products = await ProductService.getAllProducts();
        return this.sendSuccess(res, { data: products });
    });

    updateProduct = this.asyncHandler(async (req, res) => {
        const { id } = req.params;
        const updated = await ProductService.updateProduct(parseInt(id), req.body);

        return this.sendSuccess(res, { message: 'Product updated successfully', data: updated });
    });

    deleteProduct = this.asyncHandler(async (req, res) => {
        const { id } = req.params;
        await ProductService.deleteProduct(parseInt(id));

        return this.sendSuccess(res, { message: 'Product deleted successfully' });
    });
}

module.exports = ProductController;
