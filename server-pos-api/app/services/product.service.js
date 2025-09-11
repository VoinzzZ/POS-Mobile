const prisma = require('../prisma/client');
const { ValidationError } = require('../utils/errors');

class ProductService {
    async createProduct(data) {
        return prisma.product.create({ data });
    }

    async getAllProducts() {
        return prisma.product.findMany();
    }

    
}

module.exports = new ProductService();
