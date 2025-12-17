const prisma = require('../config/mysql.db.js');

const createCategory = async (categoryData) => {
  try {
    const category = await prisma.m_category.create({
      data: {
        category_name: categoryData.category_name,
        category_description: categoryData.category_description || null,
        brand_id: categoryData.brand_id,
        tenant_id: categoryData.tenant_id,
        is_active: categoryData.is_active !== undefined ? categoryData.is_active : true,
        created_by: categoryData.created_by || null,
        updated_by: categoryData.updated_by || null
      },
      include: {
        m_brand: true,
        m_tenant: {
          select: {
            tenant_id: true,
            tenant_name: true
          }
        }
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
      brand_id,
      is_active,
      search
    } = filters;

    const where = {};

    if (tenant_id) where.tenant_id = parseInt(tenant_id);
    if (brand_id) where.brand_id = parseInt(brand_id);
    if (is_active !== undefined) where.is_active = is_active === 'true' || is_active === true;

    if (search) {
      where.OR = [
        { category_name: { contains: search } },
        { category_description: { contains: search } }
      ];
    }

    const categories = await prisma.m_category.findMany({
      where,
      include: {
        m_brand: {
          select: {
            brand_id: true,
            brand_name: true
          }
        },
        m_tenant: {
          select: {
            tenant_id: true,
            tenant_name: true
          }
        },
        _count: {
          select: {
            m_product: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return categories;
  } catch (error) {
        throw error;
  }
};

const getCategoryById = async (category_id, includeRelations = true) => {
  try {
    const category = await prisma.m_category.findUnique({
      where: {
        category_id: parseInt(category_id)
      },
      include: includeRelations ? {
        m_brand: {
          select: {
            brand_id: true,
            brand_name: true,
            brand_description: true
          }
        },
        m_tenant: {
          select: {
            tenant_id: true,
            tenant_name: true
          }
        },
        _count: {
          select: {
            m_product: true
          }
        }
      } : undefined
    });
    return category;
  } catch (error) {
        throw error;
  }
};

const updateCategory = async (category_id, updateData) => {
  try {
    const existingCategory = await prisma.m_category.findUnique({
      where: { category_id: parseInt(category_id) }
    });

    if (!existingCategory) {
      throw new Error('Category not found');
    }

    const category = await prisma.m_category.update({
      where: {
        category_id: parseInt(category_id)
      },
      data: {
        ...(updateData.category_name && { category_name: updateData.category_name }),
        ...(updateData.category_description !== undefined && { category_description: updateData.category_description }),
        ...(updateData.brand_id && { brand_id: updateData.brand_id }),
        ...(updateData.is_active !== undefined && { is_active: updateData.is_active }),
        ...(updateData.updated_by && { updated_by: updateData.updated_by }),
        updated_at: new Date()
      },
      include: {
        m_brand: {
          select: {
            brand_id: true,
            brand_name: true
          }
        },
        m_tenant: {
          select: {
            tenant_id: true,
            tenant_name: true
          }
        }
      }
    });
    return category;
  } catch (error) {
        throw error;
  }
};

const deleteCategory = async (category_id, deleted_by = null) => {
  try {
    const existingCategory = await prisma.m_category.findUnique({
      where: { category_id: parseInt(category_id) },
      include: {
        _count: {
          select: {
            m_product: true
          }
        }
      }
    });

    if (!existingCategory) {
      throw new Error('Category not found');
    }

    if (existingCategory._count.m_product > 0) {
      throw new Error('Cannot delete category that has associated products');
    }

    const category = await prisma.m_category.update({
      where: {
        category_id: parseInt(category_id)
      },
      data: {
        deleted_by,
        deleted_at: new Date(),
        is_active: false
      }
    });
    return category;
  } catch (error) {
        throw error;
  }
};

const getCategoriesByBrand = async (brand_id, tenant_id, isActiveOnly = true) => {
  try {
    const categories = await prisma.m_category.findMany({
      where: {
        brand_id: parseInt(brand_id),
        tenant_id: parseInt(tenant_id),
        ...(isActiveOnly && { is_active: true })
      },
      select: {
        category_id: true,
        category_name: true,
        category_description: true,
        is_active: true,
        _count: {
          select: {
            m_product: true
          }
        }
      },
      orderBy: {
        category_name: 'asc'
      }
    });
    return categories;
  } catch (error) {
        throw error;
  }
};

const getCategoryByName = async (category_name, tenant_id, brand_id) => {
  try {
    const category = await prisma.m_category.findFirst({
      where: {
        category_name: category_name.trim(),
        tenant_id: parseInt(tenant_id),
        brand_id: parseInt(brand_id),
        deleted_at: null
      }
    });
    return category;
  } catch (error) {
        throw error;
  }
};

const toggleCategoryStatus = async (category_id, updated_by = null) => {
  try {
    const existingCategory = await prisma.m_category.findUnique({
      where: { category_id: parseInt(category_id) }
    });

    if (!existingCategory) {
      throw new Error('Category not found');
    }

    const category = await prisma.m_category.update({
      where: {
        category_id: parseInt(category_id)
      },
      data: {
        is_active: !existingCategory.is_active,
        updated_by,
        updated_at: new Date()
      },
      include: {
        m_brand: {
          select: {
            brand_id: true,
            brand_name: true
          }
        }
      }
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
  getCategoriesByBrand,
  getCategoryByName,
  toggleCategoryStatus
};