const prisma = require('../prisma/client');
const { ValidationError } = require('../utils/errors');

class ProductService {
    async createProduct(data) {
        return prisma.product.create({ data });
    }

    async getAllProducts() {
        return prisma.product.findMany();
    }

    async getProductById(id) {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) throw new ValidationError('Product not found');
        return product;
    }

    
}

module.exports = new ProductService();
