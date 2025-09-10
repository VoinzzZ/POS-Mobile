const BaseController = require("./base.controller");
const { PrismaClient } = require('@prisma/client');

class ProductController extends BaseController {
    constructor() {
        super();
        this.prisma = new PrismaClient();
    }

    // GET all products
    getAllProducts = this.asyncHandler(async (req, res) => {
        const products = await this.prisma.product.findMany();
        return this.sendSuccess(res, { message: 'Products fetched successfully', data: products });
    });

    // POST add new product
    addProduct = this.asyncHandler(async (req, res) => {
        const { name, brand, type, price, stock, imageUrl } = req.body;
        this.validateRequiredFields(req.body, ['name', 'price', 'stock']);

        const newProduct = await this.prisma.$transaction(async (tx) => {
            const product = await tx.product.create({
                data: { name, brand, type, price, stock, imageUrl }
            });
            return product;
        });

        return this.sendSuccess(res, { statusCode: 201, message: 'Product created successfully', data: newProduct });
    });
    
}

module.exports = ProductController;