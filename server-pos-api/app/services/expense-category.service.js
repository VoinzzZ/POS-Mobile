const prisma = require('../config/mysql.db.js');

const DEFAULT_CATEGORIES = [
    { code: 'PURCHASE_INVENTORY', name: 'Pembelian Barang', description: 'Pembelian barang dagangan dan stok inventory' },
    { code: 'SALARY', name: 'Gaji Karyawan', description: 'Gaji karyawan bulanan atau upah harian' },
    { code: 'RENT', name: 'Sewa Toko', description: 'Biaya sewa tempat usaha' },
    { code: 'UTILITIES', name: 'Listrik & Air', description: 'Tagihan listrik, air, dan internet' },
    { code: 'SUPPLIES', name: 'Perlengkapan', description: 'Perlengkapan toko dan operasional' },
    { code: 'MAINTENANCE', name: 'Perawatan', description: 'Biaya perawatan dan perbaikan' },
    { code: 'MARKETING', name: 'Marketing', description: 'Biaya promosi dan marketing' },
    { code: 'TRANSPORT', name: 'Transport', description: 'Biaya transport dan pengiriman' },
    { code: 'OTHER', name: 'Lainnya', description: 'Pengeluaran lain-lain' }
];

const createCategory = async (categoryData) => {
    try {
        const category = await prisma.t_expense_category.create({
            data: {
                category_code: categoryData.category_code,
                category_name: categoryData.category_name,
                category_description: categoryData.category_description || null,
                tenant_id: categoryData.tenant_id || null,
                is_active: categoryData.is_active !== undefined ? categoryData.is_active : true,
                is_system: categoryData.is_system || false,
                created_by: categoryData.created_by || null,
                updated_by: categoryData.updated_by || null
            }
        });
        return category;
    } catch (error) {
        throw error;
    }
};

const getCategories = async (filters = {}) => {
    try {
        const {
            tenant_id,
            is_active,
            search
        } = filters;

        const where = {};

        if (tenant_id) {
            where.OR = [
                { tenant_id: parseInt(tenant_id) },
                { tenant_id: null, is_system: true }
            ];
        }

        if (is_active !== undefined) {
            where.is_active = is_active === 'true' || is_active === true;
        }

        if (search) {
            where.AND = where.AND || [];
            where.AND.push({
                OR: [
                    { category_name: { contains: search } },
                    { category_code: { contains: search } },
                    { category_description: { contains: search } }
                ]
            });
        }

        const categories = await prisma.t_expense_category.findMany({
            where,
            orderBy: [
                { is_system: 'desc' },
                { created_at: 'desc' }
            ]
        });

        return categories;
    } catch (error) {
        throw error;
    }
};

const getCategoryById = async (category_id) => {
    try {
        const category = await prisma.t_expense_category.findUnique({
            where: {
                category_id: parseInt(category_id)
            },
            include: {
                _count: {
                    select: {
                        t_cash_transaction: true
                    }
                }
            }
        });
        return category;
    } catch (error) {
        throw error;
    }
};

const updateCategory = async (category_id, updateData) => {
    try {
        const existingCategory = await prisma.t_expense_category.findUnique({
            where: { category_id: parseInt(category_id) }
        });

        if (!existingCategory) {
            throw new Error('Category not found');
        }

        if (existingCategory.is_system) {
            throw new Error('Cannot update system category');
        }

        const category = await prisma.t_expense_category.update({
            where: {
                category_id: parseInt(category_id)
            },
            data: {
                ...(updateData.category_name && { category_name: updateData.category_name }),
                ...(updateData.category_code && { category_code: updateData.category_code }),
                ...(updateData.category_description !== undefined && { category_description: updateData.category_description }),
                ...(updateData.is_active !== undefined && { is_active: updateData.is_active }),
                ...(updateData.updated_by && { updated_by: updateData.updated_by }),
                updated_at: new Date()
            }
        });
        return category;
    } catch (error) {
        throw error;
    }
};

const deleteCategory = async (category_id) => {
    try {
        const existingCategory = await prisma.t_expense_category.findUnique({
            where: { category_id: parseInt(category_id) },
            include: {
                _count: {
                    select: {
                        t_cash_transaction: true
                    }
                }
            }
        });

        if (!existingCategory) {
            throw new Error('Category not found');
        }

        if (existingCategory.is_system) {
            throw new Error('Cannot delete system category');
        }

        if (existingCategory._count.t_cash_transaction > 0) {
            throw new Error('Cannot delete category that has associated transactions');
        }

        const category = await prisma.t_expense_category.delete({
            where: {
                category_id: parseInt(category_id)
            }
        });
        return category;
    } catch (error) {
        throw error;
    }
};

const seedDefaultCategories = async (tenant_id = null, created_by = null) => {
    try {
        const existingCategories = await prisma.t_expense_category.findMany({
            where: {
                tenant_id: tenant_id ? parseInt(tenant_id) : null,
                is_system: true
            }
        });

        if (existingCategories.length > 0) {
            return { message: 'Default categories already exist', count: existingCategories.length };
        }

        const categories = await Promise.all(
            DEFAULT_CATEGORIES.map(cat =>
                prisma.t_expense_category.create({
                    data: {
                        category_code: cat.code,
                        category_name: cat.name,
                        category_description: cat.description,
                        tenant_id: tenant_id ? parseInt(tenant_id) : null,
                        is_system: true,
                        is_active: true,
                        created_by: created_by ? parseInt(created_by) : null
                    }
                })
            )
        );

        return { message: 'Default categories seeded successfully', count: categories.length, data: categories };
    } catch (error) {
        throw error;
    }
};

const getCategoryByCode = async (category_code, tenant_id = null) => {
    try {
        const where = {
            category_code: category_code.toUpperCase()
        };

        if (tenant_id) {
            where.OR = [
                { tenant_id: parseInt(tenant_id) },
                { tenant_id: null, is_system: true }
            ];
        }

        const category = await prisma.t_expense_category.findFirst({
            where
        });

        return category;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    seedDefaultCategories,
    getCategoryByCode
};
