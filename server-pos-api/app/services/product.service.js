const { PrismaClient } = require('@prisma/client');
const { ValidationError, NotFoundError } = require('../utils/errors');

const prisma = new PrismaClient();

class ProductService {
    async createProduct(data) {
        // Validate Category
        if (data.categoryId) {
            const category = await prisma.category.findUnique({
                where: { id: data.categoryId }
            });
            if (!category) throw new ValidationError('Category does not exist');
        }

        // Validate Brand
        if (data.brandId) {
            const brand = await prisma.brand.findUnique({
                where: { id: data.brandId }
            });
            if (!brand) throw new ValidationError('Brand does not exist');
        }

        return prisma.product.create({
            data
        });
    }

    async getAllProducts() {
        return prisma.product.findMany({
            include: {
                category: true,
                brand: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async getProductById(id) {
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
            include: {
                category: true,
                brand: true
            }
        });

        if (!product) throw new NotFoundError('Product not found');
        return product;
    }

    async updateProduct(id, data) {
        await this.getProductById(id);

        if (data.categoryId) {
            const category = await prisma.category.findUnique({
                where: { id: data.categoryId }
            });
            if (!category) throw new ValidationError('Category does not exist');
        }

        if (data.brandId) {
            const brand = await prisma.brand.findUnique({
                where: { id: data.brandId }
            });
            if (!brand) throw new ValidationError('Brand does not exist');
        }

        return prisma.product.update({
            where: { id: parseInt(id) },
            data
        });
    }

    async deleteProduct(id) {
        await this.getProductById(id);
        return prisma.product.delete({
            where: { id: parseInt(id) }
        });
    }
}

module.exports = new ProductService();
