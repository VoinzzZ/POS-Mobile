const prisma = require('../config/mysql.db.js');

const createBrand = async (brandData) => {
  try {
    const brand = await prisma.m_brand.create({
      data: {
        brand_name: brandData.brand_name,
        brand_description: brandData.brand_description || null,
        brand_logo_url: brandData.brand_logo_url || null,
        tenant_id: brandData.tenant_id,
        is_active: brandData.is_active !== undefined ? brandData.is_active : true,
        created_by: brandData.created_by || null,
        updated_by: brandData.updated_by || null
      },
      include: {
        m_tenant: {
          select: {
            tenant_id: true,
            tenant_name: true
          }
        }
      }
    });
    return brand;
  } catch (error) {
    throw error;
  }
};

const getBrands = async (filters = {}) => {
  try {
    const {
      tenant_id,
      is_active,
      search
    } = filters;

    const where = {
      deleted_at: null  // Filter soft deleted brands
    };

    if (tenant_id) where.tenant_id = parseInt(tenant_id);
    if (is_active !== undefined) where.is_active = is_active === 'true' || is_active === true;

    if (search) {
      where.OR = [
        { brand_name: { contains: search } },
        { brand_description: { contains: search } }
      ];
    }

    const brands = await prisma.m_brand.findMany({
      where,
      include: {
        m_tenant: {
          select: {
            tenant_id: true,
            tenant_name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return brands;
  } catch (error) {
    throw error;
  }
};

const getBrandById = async (brand_id, includeRelations = true) => {
  try {
    const brand = await prisma.m_brand.findUnique({
      where: {
        brand_id: parseInt(brand_id)
      },
      include: includeRelations ? {
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
    return brand;
  } catch (error) {
    throw error;
  }
};

const updateBrand = async (brand_id, updateData) => {
  try {
    const existingBrand = await prisma.m_brand.findUnique({
      where: { brand_id: parseInt(brand_id) }
    });

    if (!existingBrand) {
      throw new Error('Brand not found');
    }

    const brand = await prisma.m_brand.update({
      where: {
        brand_id: parseInt(brand_id)
      },
      data: {
        ...(updateData.brand_name && { brand_name: updateData.brand_name }),
        ...(updateData.brand_description !== undefined && { brand_description: updateData.brand_description }),
        ...(updateData.brand_logo_url !== undefined && { brand_logo_url: updateData.brand_logo_url }),
        ...(updateData.is_active !== undefined && { is_active: updateData.is_active }),
        ...(updateData.updated_by && { updated_by: updateData.updated_by }),
        updated_at: new Date()
      },
      include: {
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
      }
    });
    return brand;
  } catch (error) {
    throw error;
  }
};

const deleteBrand = async (brand_id, deleted_by = null) => {
  try {
    const existingBrand = await prisma.m_brand.findUnique({
      where: { brand_id: parseInt(brand_id) },
      include: {
        _count: {
          select: {
            m_product: true
          }
        }
      }
    });

    if (!existingBrand) {
      throw new Error('Brand not found');
    }

    // Update all products with this brand to have null brand_id
    if (existingBrand._count.m_product > 0) {
      await prisma.m_product.updateMany({
        where: {
          brand_id: parseInt(brand_id)
        },
        data: {
          brand_id: null,
          updated_by: deleted_by,
          updated_at: new Date()
        }
      });
    }

    // Soft delete the brand
    const brand = await prisma.m_brand.update({
      where: {
        brand_id: parseInt(brand_id)
      },
      data: {
        deleted_by,
        deleted_at: new Date(),
        is_active: false
      }
    });
    return brand;
  } catch (error) {
    throw error;
  }
};

const getBrandByName = async (brand_name, tenant_id) => {
  try {
    const brand = await prisma.m_brand.findFirst({
      where: {
        brand_name: brand_name.trim(),
        tenant_id: parseInt(tenant_id),
        deleted_at: null
      }
    });
    return brand;
  } catch (error) {
    throw error;
  }
};

const toggleBrandStatus = async (brand_id, updated_by = null) => {
  try {
    const existingBrand = await prisma.m_brand.findUnique({
      where: { brand_id: parseInt(brand_id) }
    });

    if (!existingBrand) {
      throw new Error('Brand not found');
    }

    const brand = await prisma.m_brand.update({
      where: {
        brand_id: parseInt(brand_id)
      },
      data: {
        is_active: !existingBrand.is_active,
        updated_by,
        updated_at: new Date()
      },
      include: {
        m_tenant: {
          select: {
            tenant_id: true,
            tenant_name: true
          }
        }
      }
    });
    return brand;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
  getBrandByName,
  toggleBrandStatus
};