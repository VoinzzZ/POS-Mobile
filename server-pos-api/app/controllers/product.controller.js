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
    
}

module.exports = ProductController;