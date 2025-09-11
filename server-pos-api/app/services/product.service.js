const { PrismaClient } = require('@prisma/client');
const { ValidationError } = require('../utils/errors');

const prisma = new PrismaClient();

class ProductService {
    async createProduct(data) {
        return prisma.product.create({ data });
    }

    async getAllProducts() {
        return prisma.product.findMany();
    }

    async getProductById(id) {
        const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });
        if (!product) throw new ValidationError('Product not found');
        return product;
    }

    async updateProduct(id, data) {
        await this.getProductById(id);
        return prisma.product.update({
            where: { id: parseInt(id) },
            data
        });
    }

    async deleteProduct(id) {
        await this.getProductById(id);
        return prisma.product.delete({ where: { id: parseInt(id) } });
    }
}

module.exports = new ProductService();
