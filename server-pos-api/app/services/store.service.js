const prisma = require('../config/mysql.db.js');
const { deleteImage } = require('../middlewares/upload.middleware');

class StoreService {
  static async getStoreSettings(tenantId) {
    try {
      const tenant = await prisma.m_tenant.findUnique({
        where: {
          tenant_id: tenantId
        },
        select: {
          tenant_id: true,
          tenant_name: true,
          tenant_address: true,
          tenant_phone: true,
          tenant_email: true,
          store_logo_url: true,
          store_description: true,
          created_at: true,
          updated_at: true
        }
      });

      if (!tenant) {
        throw new Error('Tenant not found');
      }

      // Map the response to match the expected store format
      const storeData = {
        store_id: tenant.tenant_id,
        store_name: tenant.tenant_name,
        store_address: tenant.tenant_address,
        store_phone: tenant.tenant_phone,
        store_email: tenant.tenant_email,
        store_logo_url: tenant.store_logo_url,
        store_description: tenant.store_description,
        store_created_at: tenant.created_at,
        store_updated_at: tenant.updated_at,

        // CamelCase aliases for frontend use
        id: tenant.tenant_id,
        name: tenant.tenant_name,
        address: tenant.tenant_address,
        phone: tenant.tenant_phone,
        email: tenant.tenant_email,
        logoUrl: tenant.store_logo_url,
        description: tenant.store_description,
        createdAt: tenant.created_at,
        updatedAt: tenant.updated_at
      };

      return storeData;
    } catch (error) {
      throw error;
    }
  }

  static async updateStoreSettings(tenantId, updateData, updatedBy) {
    try {
      // Prepare update data
      const updatePayload = {
        updated_by: updatedBy
      };

      if (updateData.store_name !== undefined) updatePayload.tenant_name = updateData.store_name;
      if (updateData.store_address !== undefined) updatePayload.tenant_address = updateData.store_address;
      if (updateData.store_phone !== undefined) updatePayload.tenant_phone = updateData.store_phone;
      if (updateData.store_email !== undefined) updatePayload.tenant_email = updateData.store_email;
      if (updateData.store_description !== undefined) updatePayload.store_description = updateData.store_description;

      const updatedTenant = await prisma.m_tenant.update({
        where: {
          tenant_id: tenantId
        },
        data: updatePayload,
        select: {
          tenant_id: true,
          tenant_name: true,
          tenant_address: true,
          tenant_phone: true,
          tenant_email: true,
          store_logo_url: true,
          store_description: true,
          created_at: true,
          updated_at: true
        }
      });

      // Map the response to match the expected store format
      const storeData = {
        store_id: updatedTenant.tenant_id,
        store_name: updatedTenant.tenant_name,
        store_address: updatedTenant.tenant_address,
        store_phone: updatedTenant.tenant_phone,
        store_email: updatedTenant.tenant_email,
        store_logo_url: updatedTenant.store_logo_url,
        store_description: updatedTenant.store_description,
        store_created_at: updatedTenant.created_at,
        store_updated_at: updatedTenant.updated_at,

        // CamelCase aliases for frontend use
        id: updatedTenant.tenant_id,
        name: updatedTenant.tenant_name,
        address: updatedTenant.tenant_address,
        phone: updatedTenant.tenant_phone,
        email: updatedTenant.tenant_email,
        logoUrl: updatedTenant.store_logo_url,
        description: updatedTenant.store_description,
        createdAt: updatedTenant.created_at,
        updatedAt: updatedTenant.updated_at
      };

      return storeData;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Tenant not found');
      }
      throw error;
    }
  }

  static async uploadStoreLogo(tenantId, file, uploadedBy) {
    try {
      if (!file) {
        throw new Error('No file uploaded');
      }

      // The file is already uploaded to Cloudinary by the middleware
      // The file object now contains the Cloudinary URL
      const cloudinaryUrl = file.path;

      // Update tenant with new logo URL
      const updatedTenant = await prisma.m_tenant.update({
        where: {
          tenant_id: tenantId
        },
        data: {
          store_logo_url: cloudinaryUrl,
          updated_by: uploadedBy
        },
        select: {
          tenant_id: true,
          tenant_name: true,
          tenant_address: true,
          tenant_phone: true,
          tenant_email: true,
          store_logo_url: true,
          store_description: true,
          created_at: true,
          updated_at: true
        }
      });

      // Map the response to match the expected store format
      const storeData = {
        store_id: updatedTenant.tenant_id,
        store_name: updatedTenant.tenant_name,
        store_address: updatedTenant.tenant_address,
        store_phone: updatedTenant.tenant_phone,
        store_email: updatedTenant.tenant_email,
        store_logo_url: updatedTenant.store_logo_url,
        store_description: updatedTenant.store_description,
        store_created_at: updatedTenant.created_at,
        store_updated_at: updatedTenant.updated_at,

        // CamelCase aliases for frontend use
        id: updatedTenant.tenant_id,
        name: updatedTenant.tenant_name,
        address: updatedTenant.tenant_address,
        phone: updatedTenant.tenant_phone,
        email: updatedTenant.tenant_email,
        logoUrl: updatedTenant.store_logo_url,
        description: updatedTenant.store_description,
        createdAt: updatedTenant.created_at,
        updatedAt: updatedTenant.updated_at
      };

      return {
        logo_url: cloudinaryUrl,
        store: storeData
      };
    } catch (error) {
      throw error;
    }
  }

  static async deleteStoreLogo(tenantId, deletedBy) {
    try {
      // Get current tenant to check if there's a logo to delete
      const currentTenant = await prisma.m_tenant.findUnique({
        where: {
          tenant_id: tenantId
        },
        select: {
          store_logo_url: true
        }
      });

      if (!currentTenant || !currentTenant.store_logo_url) {
        throw new Error('No store logo to delete');
      }

      // Delete from Cloudinary
      await deleteImage(currentTenant.store_logo_url, 'store');

      // Update tenant to remove logo URL
      const updatedTenant = await prisma.m_tenant.update({
        where: {
          tenant_id: tenantId
        },
        data: {
          store_logo_url: null,
          updated_by: deletedBy
        },
        select: {
          tenant_id: true,
          tenant_name: true,
          tenant_address: true,
          tenant_phone: true,
          tenant_email: true,
          store_logo_url: true,
          store_description: true,
          created_at: true,
          updated_at: true
        }
      });

      // Map the response to match the expected store format
      const storeData = {
        store_id: updatedTenant.tenant_id,
        store_name: updatedTenant.tenant_name,
        store_address: updatedTenant.tenant_address,
        store_phone: updatedTenant.tenant_phone,
        store_email: updatedTenant.tenant_email,
        store_logo_url: updatedTenant.store_logo_url,
        store_description: updatedTenant.store_description,
        store_created_at: updatedTenant.created_at,
        store_updated_at: updatedTenant.updated_at,

        // CamelCase aliases for frontend use
        id: updatedTenant.tenant_id,
        name: updatedTenant.tenant_name,
        address: updatedTenant.tenant_address,
        phone: updatedTenant.tenant_phone,
        email: updatedTenant.tenant_email,
        logoUrl: updatedTenant.store_logo_url,
        description: updatedTenant.store_description,
        createdAt: updatedTenant.created_at,
        updatedAt: updatedTenant.updated_at
      };

      return storeData;
    } catch (error) {
      if (error.message === 'No store logo to delete') {
        throw error;
      }
      throw error;
    }
  }
}

module.exports = StoreService;