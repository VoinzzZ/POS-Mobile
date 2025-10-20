const prisma = require('../config/mysql.db.js');
const EmailService = require('./email.service.js');

const emailService = new EmailService();

class SystemService {
  /**
   * Get system overview statistics
   * Hanya Super Admin yang bisa akses
   */
  static async getSystemOverview() {
    try {
      const [
        totalTenants,
        activeTenants,
        pendingTenants,
        suspendedTenants,
        totalUsers,
        activeUsers,
        totalTransactions,
        recentTransactions
      ] = await Promise.all([
        // Tenant statistics
        prisma.m_tenant.count(),
        prisma.m_tenant.count({
          where: {
            tenant_status: 'APPROVED',
            is_active: true
          }
        }),
        prisma.m_tenant.count({
          where: {
            tenant_status: 'PENDING'
          }
        }),
        prisma.m_tenant.count({
          where: {
            tenant_status: 'APPROVED',
            is_active: false
          }
        }),
        // User statistics
        prisma.m_user.count({
          where: {
            deleted_at: null
          }
        }),
        prisma.m_user.count({
          where: {
            deleted_at: null,
            user_is_verified: true
          }
        }),
        // Transaction statistics
        prisma.m_transaction.count(),
        prisma.m_transaction.count({
          where: {
            created_at: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        })
      ]);

      return {
        tenants: {
          total: totalTenants,
          active: activeTenants,
          pending: pendingTenants,
          suspended: suspendedTenants
        },
        users: {
          total: totalUsers,
          active: activeUsers
        },
        transactions: {
          total: totalTransactions,
          recent: recentTransactions
        }
      };

    } catch (error) {
      console.error('Error getting system overview:', error);
      throw error;
    }
  }

  /**
   * Get all tenants with pagination and filtering
   */
  static async getAllTenants(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        isActive,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = options;

      const skip = (page - 1) * limit;
      const where = {};

      if (search) {
        where.OR = [
          { tenant_name: { contains: search } },
          { tenant_email: { contains: search } },
          { tenant_phone: { contains: search } }
        ];
      }

      if (status) {
        where.tenant_status = status;
      }

      if (isActive !== undefined) {
        where.is_active = isActive;
      }

      const [tenants, total] = await Promise.all([
        prisma.m_tenant.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: {
            m_user: {
              where: {
                deleted_at: null
              },
              include: {
                m_role: true
              }
            }
          },
          orderBy: {
            [sortBy]: sortOrder
          }
        }),
        prisma.m_tenant.count({ where })
      ]);

      const result = tenants.map(tenant => ({
        tenantId: tenant.tenant_id,
        tenantName: tenant.tenant_name,
        tenantEmail: tenant.tenant_email,
        tenantPhone: tenant.tenant_phone,
        tenantAddress: tenant.tenant_address,
        status: tenant.tenant_status,
        isActive: tenant.is_active,
        subscriptionPlan: tenant.subscription_plan,
        subscriptionExpiresAt: tenant.subscription_expires_at,
        ownerInfo: tenant.m_user.find(user => user.m_role?.role_name === 'OWNER'),
        userCount: tenant.m_user.length,
        createdAt: tenant.created_at,
        updatedAt: tenant.updated_at
      }));

      return {
        tenants: result,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('Error getting all tenants:', error);
      throw error;
    }
  }

  
  
  /**
   * Suspend tenant
   */
  static async suspendTenant(tenantId, suspensionReason, suspendedBy) {
    try {
      const tenant = await prisma.m_tenant.findFirst({
        where: {
          tenant_id: tenantId,
          tenant_status: 'APPROVED'
        }
      });

      if (!tenant) {
        throw new Error('Tenant tidak ditemukan atau status tidak valid');
      }

      const updatedTenant = await prisma.m_tenant.update({
        where: {
          tenant_id: tenantId
        },
        data: {
          is_active: false,
          suspension_reason: suspensionReason,
          suspended_at: new Date(),
          suspended_by: suspendedBy,
          updated_at: new Date()
        }
      });

      return {
        success: true,
        message: 'Tenant berhasil disuspend',
        tenant: {
          tenantId: updatedTenant.tenant_id,
          tenantName: updatedTenant.tenant_name,
          isActive: updatedTenant.is_active,
          suspensionReason: updatedTenant.suspension_reason,
          suspendedAt: updatedTenant.suspended_at
        }
      };

    } catch (error) {
      console.error('Error suspending tenant:', error);
      throw error;
    }
  }

  /**
   * Reactivate tenant
   */
  static async reactivateTenant(tenantId, reactivatedBy) {
    try {
      const tenant = await prisma.m_tenant.findFirst({
        where: {
          tenant_id: tenantId,
          tenant_status: 'APPROVED',
          is_active: false
        }
      });

      if (!tenant) {
        throw new Error('Tenant tidak ditemukan atau status tidak valid');
      }

      const updatedTenant = await prisma.m_tenant.update({
        where: {
          tenant_id: tenantId
        },
        data: {
          is_active: true,
          suspension_reason: null,
          suspended_at: null,
          suspended_by: null,
          reactivated_at: new Date(),
          reactivated_by: reactivatedBy,
          updated_at: new Date()
        }
      });

      return {
        success: true,
        message: 'Tenant berhasil diaktifkan kembali',
        tenant: {
          tenantId: updatedTenant.tenant_id,
          tenantName: updatedTenant.tenant_name,
          isActive: updatedTenant.is_active,
          reactivatedAt: updatedTenant.reactivated_at
        }
      };

    } catch (error) {
      console.error('Error reactivating tenant:', error);
      throw error;
    }
  }

  /**
   * Get tenant details with users and statistics
   */
  static async getTenantDetails(tenantId) {
    try {
      const tenant = await prisma.m_tenant.findFirst({
        where: {
          tenant_id: tenantId
        },
        include: {
          m_user: {
            where: {
              deleted_at: null
            },
            include: {
              m_role: true
            }
          }
        }
      });

      if (!tenant) {
        throw new Error('Tenant tidak ditemukan');
      }

      // Get tenant statistics
      const [
        totalTransactions,
        recentTransactions,
        totalProducts,
        activeProducts
      ] = await Promise.all([
        prisma.m_transaction.count({
          where: {
            tenant_id: tenantId
          }
        }),
        prisma.m_transaction.count({
          where: {
            tenant_id: tenantId,
            created_at: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        prisma.m_product.count({
          where: {
            tenant_id: tenantId,
            deleted_at: null
          }
        }),
        prisma.m_product.count({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            is_active: true
          }
        })
      ]);

      const usersByRole = tenant.m_user.reduce((acc, user) => {
        const roleName = user.m_role?.role_name || 'UNKNOWN';
        acc[roleName] = (acc[roleName] || 0) + 1;
        return acc;
      }, {});

      return {
        tenant: {
          tenantId: tenant.tenant_id,
          tenantName: tenant.tenant_name,
          tenantEmail: tenant.tenant_email,
          tenantPhone: tenant.tenant_phone,
          tenantAddress: tenant.tenant_address,
          status: tenant.tenant_status,
          isActive: tenant.is_active,
          subscriptionPlan: tenant.subscription_plan,
          subscriptionExpiresAt: tenant.subscription_expires_at,
          createdAt: tenant.created_at,
          updatedAt: tenant.updated_at
        },
        statistics: {
          users: {
            total: tenant.m_user.length,
            byRole: usersByRole
          },
          transactions: {
            total: totalTransactions,
            recent: recentTransactions
          },
          products: {
            total: totalProducts,
            active: activeProducts
          }
        },
        users: tenant.m_user.map(user => ({
          userId: user.user_id,
          userName: user.user_name,
          fullName: user.user_full_name,
          email: user.user_email,
          phone: user.user_phone,
          roleName: user.m_role?.role_name,
          isActive: user.user_is_verified,
          lastLogin: user.user_last_login,
          createdAt: user.created_at
        }))
      };

    } catch (error) {
      console.error('Error getting tenant details:', error);
      throw error;
    }
  }

  /**
   * Get all users across all tenants
   */
  static async getAllUsers(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        role,
        tenantStatus,
        isActive,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = options;

      const skip = (page - 1) * limit;
      const where = {
        deleted_at: null
      };

      if (search) {
        where.OR = [
          { user_name: { contains: search } },
          { user_full_name: { contains: search } },
          { user_email: { contains: search } }
        ];
      }

      const include = {
        m_role: true,
        m_tenant: {
          select: {
            tenant_id: true,
            tenant_name: true,
            tenant_status: true,
            is_active: true
          }
        }
      };

      if (role) {
        where.m_role = {
          role_name: role
        };
      }

      if (isActive !== undefined) {
        where.user_is_verified = isActive;
      }

      if (tenantStatus) {
        where.m_tenant = {
          tenant_status: tenantStatus
        };
      }

      const [users, total] = await Promise.all([
        prisma.m_user.findMany({
          where,
          include,
          skip,
          take: parseInt(limit),
          orderBy: {
            [sortBy]: sortOrder
          }
        }),
        prisma.m_user.count({ where })
      ]);

      const result = users.map(user => ({
        userId: user.user_id,
        userName: user.user_name,
        fullName: user.user_full_name,
        email: user.user_email,
        phone: user.user_phone,
        roleName: user.m_role?.role_name,
        tenantInfo: user.m_tenant,
        isActive: user.user_is_verified,
        isSa: user.is_sa,
        lastLogin: user.user_last_login,
        createdAt: user.created_at
      }));

      return {
        users: result,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  
  
  
  /**
   * Get system activity logs
   */
  static async getActivityLogs(options = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        action,
        userId,
        tenantId,
        startDate,
        endDate
      } = options;

      const skip = (page - 1) * limit;
      const where = {};

      if (action) {
        where.action = action;
      }

      if (userId) {
        where.user_id = userId;
      }

      if (tenantId) {
        where.tenant_id = tenantId;
      }

      if (startDate || endDate) {
        where.created_at = {};
        if (startDate) {
          where.created_at.gte = new Date(startDate);
        }
        if (endDate) {
          where.created_at.lte = new Date(endDate);
        }
      }

      // Note: This assumes you have an activity_logs table
      // You may need to adjust based on your actual schema
      const [logs, total] = await Promise.all([
        prisma.activity_logs?.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: {
            created_at: 'desc'
          },
          include: {
            m_user: {
              select: {
                user_id: true,
                user_name: true,
                user_full_name: true
              }
            },
            m_tenant: {
              select: {
                tenant_id: true,
                tenant_name: true
              }
            }
          }
        }) || [],
        prisma.activity_logs?.count({ where }) || 0
      ]);

      return {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('Error getting activity logs:', error);
      throw error;
    }
  }
}

module.exports = SystemService;