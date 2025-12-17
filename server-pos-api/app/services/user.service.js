const prisma = require('../config/mysql.db.js');
const validator = require('validator');
const PasswordService = require('../utils/passwordService.js');
const EmailService = require('./email.service.js');

const emailService = new EmailService();

class UserService {
    static async generateEmployeePin(tenantId, generatedBy) {
    try {
      // Verify user is owner of tenant
      const user = await prisma.m_user.findFirst({
        where: {
          user_id: generatedBy,
          tenant_id: tenantId,
          deleted_at: null
        },
        include: {
          m_role: true,
          m_tenant: true
        }
      });

      if (!user || user.m_role?.role_code !== 'OWNER') {
        throw new Error('Anda tidak memiliki akses untuk generate PIN employee');
      }

      const tenant = user.m_tenant;

      // Generate unique 6-digit PIN
      let pin;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;

      while (!isUnique && attempts < maxAttempts) {
        pin = Math.floor(100000 + Math.random() * 900000).toString();

        const existingPin = await prisma.s_registration_pin.findFirst({
          where: {
            code: pin,
            used: false,
            expires_at: {
              gt: new Date()
            }
          }
        });

        if (!existingPin) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        throw new Error('Gagal generate PIN unik, silakan coba lagi');
      }

      // Create PIN record with expiry (24 hours)
      const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

      const pinRecord = await prisma.s_registration_pin.create({
        data: {
          code: pin,
          tenant_id: tenantId,
          created_by: generatedBy,
          expires_at: expiryTime,
          used: false,
          created_at: new Date()
        }
      });

      return {
        pin,
        expiresAt: expiryTime,
        pinId: pinRecord.id
      };

    } catch (error) {
            throw error;
    }
  }

    static async validatePin(pin, tenantId) {
    try {
      const pinRecord = await prisma.registration_pins.findFirst({
        where: {
          pin,
          tenant_id: tenantId,
          is_active: true,
          expires_at: {
            gt: new Date()
          }
        },
        include: {
          m_tenant: {
            select: {
              tenant_id: true,
              tenant_name: true,
              tenant_status: true
            }
          }
        }
      });

      if (!pinRecord) {
        throw new Error('PIN tidak valid atau sudah kadaluarsa');
      }

      return {
        pinId: pinRecord.pin_id,
        tenant: pinRecord.m_tenant
      };

    } catch (error) {
            throw error;
    }
  }

    static async getEmployeesByTenant(tenantId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10, 
        search,
        isActive,
        role
      } = options;

      const skip = (page - 1) * limit;

      // Filter untuk role yang bukan OWNER dan SUPER ADMIN
      const employeeRoles = ['ADMIN', 'CASHIER', 'INVENTORY'];
      const where = {
        tenant_id: tenantId,
        is_sa: false, // Bukan super admin
        m_role: {
          role_code: {
            in: role ? [role] : employeeRoles
          }
        }
      };

      if (isActive !== undefined) {
        where.is_active = isActive;
      }

      if (search) {
        where.OR = [
          { user_full_name: { contains: search } },
          { user_email: { contains: search } },
          { user_phone: { contains: search } }
        ];
      }

      const [employees, total] = await Promise.all([
        prisma.m_user.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: {
            m_role: true
          },
          orderBy: {
            created_at: 'desc'
          }
        }),
        prisma.m_user.count({ where })
      ]);

      const result = employees.map(user => ({
        userId: user.user_id,
        userName: user.user_name,
        fullName: user.user_full_name,
        email: user.user_email,
        phone: user.user_phone,
        roleName: user.m_role?.role_name,
        isActive: user.user_is_verified,
        lastLogin: user.user_last_login,
        createdAt: user.created_at
      }));

      return {
        employees: result,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
            throw error;
    }
  }

  /**
   * Update employee status (activate/deactivate)
   */
  static async updateEmployeeStatus(employeeId, tenantId, isActive, updatedBy) {
    try {
      // Verify employee belongs to tenant
      const employee = await prisma.m_user.findFirst({
        where: {
          user_id: employeeId,
          tenant_id: tenantId,
          deleted_at: null,
          m_role: {
            role_name: 'EMPLOYEE'
          }
        }
      });

      if (!employee) {
        throw new Error('Employee tidak ditemukan');
      }

      const updatedEmployee = await prisma.m_user.update({
        where: {
          user_id: employeeId
        },
        data: {
          user_is_verified: isActive,
          updated_at: new Date(),
          updated_by: updatedBy
        },
        include: {
          m_role: true
        }
      });

      return {
        success: true,
        message: `Employee berhasil ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
        employee: {
          userId: updatedEmployee.user_id,
          userName: updatedEmployee.user_name,
          fullName: updatedEmployee.user_full_name,
          email: updatedEmployee.user_email,
          roleName: updatedEmployee.m_role?.role_name,
          isActive: updatedEmployee.user_is_verified
        }
      };

    } catch (error) {
            throw error;
    }
  }

  /**
   * Delete employee
   */
  static async deleteEmployee(employeeId, tenantId, deletedBy) {
    try {
      // Verify employee belongs to tenant
      const employee = await prisma.m_user.findFirst({
        where: {
          user_id: employeeId,
          tenant_id: tenantId,
          deleted_at: null,
          m_role: {
            role_name: 'EMPLOYEE'
          }
        }
      });

      if (!employee) {
        throw new Error('Employee tidak ditemukan');
      }

      // Soft delete
      await prisma.m_user.update({
        where: {
          user_id: employeeId
        },
        data: {
          deleted_at: new Date(),
          deleted_by: deletedBy
        }
      });

      return {
        success: true,
        message: 'Employee berhasil dihapus'
      };

    } catch (error) {
            throw error;
    }
  }

  /**
   * Get employee statistics
   */
  static async getEmployeeStats(tenantId) {
    try {
      const [
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        recentLogins
      ] = await Promise.all([
        prisma.m_user.count({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            m_role: {
              role_name: 'EMPLOYEE'
            }
          }
        }),
        prisma.m_user.count({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            m_role: {
              role_name: 'EMPLOYEE'
            },
            user_is_verified: true
          }
        }),
        prisma.m_user.count({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            m_role: {
              role_name: 'EMPLOYEE'
            },
            user_is_verified: false
          }
        }),
        prisma.m_user.count({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            m_role: {
              role_name: 'EMPLOYEE'
            },
            user_last_login: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          }
        })
      ]);

      return {
        total: totalEmployees,
        active: activeEmployees,
        inactive: inactiveEmployees,
        recentLogins
      };

    } catch (error) {
            throw error;
    }
  }

  /**
   * Clean up expired PINs
   */
  static async cleanupExpiredPins() {
    try {
      const result = await prisma.registration_pins.updateMany({
        where: {
          expires_at: {
            lt: new Date()
          },
          is_active: true
        },
        data: {
          is_active: false
        }
      });

      return {
        success: true,
        message: `${result.count} PIN kadaluarsa berhasil dinonaktifkan`,
        cleanedCount: result.count
      };

    } catch (error) {
            throw error;
    }
  }

  // Legacy methods converted to static
  static async getUsersByTenant(tenantId, { page = 1, limit = 10, role, search }) {
    const skip = (page - 1) * limit;
    const where = {
      tenant_id: tenantId,
      deleted_at: null
    };

    if (role && role !== 'all') {
      where.m_role = {
        role_name: role
      };
    }

    if (search) {
      where.OR = [
        {
          user_name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          user_email: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          user_full_name: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.m_user.findMany({
        where,
        include: {
          m_role: true
        },
        orderBy: {
          created_at: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.m_user.count({ where })
    ]);

    const result = users.map(user => ({
      userId: user.user_id,
      userName: user.user_name,
      fullName: user.user_full_name,
      email: user.user_email,
      phone: user.user_phone,
      roleId: user.role_id,
      roleName: user.m_role?.role_name,
      isSa: user.is_sa,
      isVerified: user.user_is_verified,
      lastLogin: user.user_last_login,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }));

    return {
      users: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  static async getUserById(userId) {
    const user = await prisma.m_user.findFirst({
      where: {
        user_id: userId,
        deleted_at: null
      },
      include: {
        m_role: true,
        m_tenant: true
      }
    });

    if (!user) throw new Error('User not found');

    return {
      userId: user.user_id,
      userName: user.user_name,
      fullName: user.user_full_name,
      email: user.user_email,
      phone: user.user_phone,
      roleId: user.role_id,
      roleName: user.m_role?.role_name,
      tenantId: user.tenant_id,
      tenantInfo: user.m_tenant ? {
        tenantId: user.m_tenant.tenant_id,
        tenantName: user.m_tenant.tenant_name,
        tenantStatus: user.m_tenant.tenant_status
      } : null,
      isSa: user.is_sa,
      isVerified: user.user_is_verified,
      lastLogin: user.user_last_login,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }

  static async createUser(userData) {
    const {
      userName,
      email,
      password,
      fullName,
      phone,
      roleName,
      tenantId,
      createdBy
    } = userData;

    // Validation
    if (!userName || !email || !password || !roleName || !tenantId) {
      throw new Error("userName, email, password, roleName, and tenantId are required");
    }
    if (!validator.isEmail(email)) {
      throw new Error("Invalid email format");
    }

    return await prisma.$transaction(async (tx) => {
      // Check if email already exists in the same tenant
      const existingUser = await tx.m_user.findFirst({
        where: {
          user_email: email,
          tenant_id: tenantId,
          deleted_at: null
        }
      });

      if (existingUser) {
        throw new Error("Email already exists in this tenant");
      }

      // Check if username already exists in the same tenant
      const existingUsername = await tx.m_user.findFirst({
        where: {
          user_name: userName,
          tenant_id: tenantId,
          deleted_at: null
        }
      });

      if (existingUsername) {
        throw new Error("Username already exists in this tenant");
      }

      // Get role
      const role = await tx.m_role.findFirst({
        where: {
          role_name: roleName,
          deleted_at: null
        }
      });

      if (!role) {
        throw new Error(`Role ${roleName} not found`);
      }

      // Validate password
      const passwordValidation = PasswordService.validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
      }

      // Hash password
      const hashedPassword = await PasswordService.hashPassword(password);

      // Create user
      const newUser = await tx.m_user.create({
        data: {
          user_name: userName,
          user_email: email,
          user_password: hashedPassword,
          user_full_name: fullName,
          user_phone: phone,
          tenant_id: tenantId,
          role_id: role.role_id,
          is_sa: false,
          user_is_verified: true, // Auto-verify for tenant users created by owner/admin
          created_by: createdBy
        }
      });

      return {
        user: {
          userId: newUser.user_id,
          userName: newUser.user_name,
          fullName: newUser.user_full_name,
          email: newUser.user_email,
          phone: newUser.user_phone,
          roleName: role.role_name,
          isVerified: newUser.user_is_verified,
          createdAt: newUser.created_at
        },
        message: `User ${roleName} created successfully`
      };
    });
  }

  static async updateUser(userId, updateData, updatedBy) {
    const user = await prisma.m_user.findFirst({
      where: {
        user_id: userId,
        deleted_at: null
      },
      include: {
        m_role: true
      }
    });

    if (!user) throw new Error('User not found');
    if (user.is_sa) throw new Error('Cannot update Super Admin user');

    const allowedFields = [
      'user_name',
      'user_full_name',
      'user_phone',
      'role_id'
    ];

    const data = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        data[field] = updateData[field];
      }
    });

    // Handle email change
    if (updateData.email && updateData.email !== user.user_email) {
      if (!validator.isEmail(updateData.email)) {
        throw new Error("Invalid email format");
      }

      // Check if email already exists in the same tenant
      const existingEmail = await prisma.m_user.findFirst({
        where: {
          user_email: updateData.email,
          tenant_id: user.tenant_id,
          deleted_at: null,
          user_id: { not: userId }
        }
      });

      if (existingEmail) {
        throw new Error("Email already exists in this tenant");
      }

      data.user_email = updateData.email;
      data.user_is_verified = false; // Require re-verification for email change
    }

    // Handle password change
    if (updateData.password) {
      const passwordValidation = PasswordService.validatePassword(updateData.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
      }

      data.user_password = await PasswordService.hashPassword(updateData.password);
    }

    data.updated_by = updatedBy;

    const updatedUser = await prisma.m_user.update({
      where: { user_id: userId },
      data,
      include: {
        m_role: true
      }
    });

    return {
      message: 'User updated successfully',
      user: {
        userId: updatedUser.user_id,
        userName: updatedUser.user_name,
        fullName: updatedUser.user_full_name,
        email: updatedUser.user_email,
        phone: updatedUser.user_phone,
        roleName: updatedUser.m_role?.role_name,
        isVerified: updatedUser.user_is_verified,
        updatedAt: updatedUser.updated_at
      }
    };
  }

  static async deleteUser(userId, deletedBy) {
    const user = await prisma.m_user.findFirst({
      where: {
        user_id: userId,
        deleted_at: null
      }
    });

    if (!user) throw new Error('User not found');
    if (user.is_sa) throw new Error('Cannot delete Super Admin user');

    await prisma.m_user.update({
      where: { user_id: userId },
      data: {
        deleted_at: new Date(),
        deleted_by: deletedBy
      }
    });

    return { message: 'User deleted successfully' };
  }

  static async getAvailableRoles() {
    const roles = await prisma.m_role.findMany({
      where: {
        deleted_at: null,
        is_active: true
      },
      orderBy: {
        role_name: 'asc'
      }
    });

    return roles.map(role => ({
      roleId: role.role_id,
      roleName: role.role_name,
      roleDescription: role.role_description
    }));
  }

  static async getUsersByRole(tenantId, roleName) {
    const users = await prisma.m_user.findMany({
      where: {
        tenant_id: tenantId,
        deleted_at: null,
        m_role: {
          role_name: roleName
        }
      },
      include: {
        m_role: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return users.map(user => ({
      userId: user.user_id,
      userName: user.user_name,
      fullName: user.user_full_name,
      email: user.user_email,
      phone: user.user_phone,
      roleName: user.m_role?.role_name,
      isVerified: user.user_is_verified,
      lastLogin: user.user_last_login,
      createdAt: user.created_at
    }));
  }

  static async changeUserRole(userId, newRoleId, changedBy) {
    const user = await prisma.m_user.findFirst({
      where: {
        user_id: userId,
        deleted_at: null
      }
    });

    if (!user) throw new Error('User not found');
    if (user.is_sa) throw new Error('Cannot change Super Admin role');

    // Verify role exists
    const role = await prisma.m_role.findFirst({
      where: {
        role_id: newRoleId,
        deleted_at: null,
        is_active: true
      }
    });

    if (!role) throw new Error('Role not found');

    const updatedUser = await prisma.m_user.update({
      where: { user_id: userId },
      data: {
        role_id: newRoleId,
        updated_by: changedBy
      },
      include: {
        m_role: true
      }
    });

    return {
      message: 'User role changed successfully',
      user: {
        userId: updatedUser.user_id,
        userName: updatedUser.user_name,
        fullName: updatedUser.user_full_name,
        roleName: updatedUser.m_role?.role_name,
        updatedAt: updatedUser.updated_at
      }
    };
  }

  
  /**
   * Get pending employee approvals for owner's tenant
   */
  static async getPendingEmployeeApprovals(tenant_id) {
    const pendingEmployees = await prisma.m_user.findMany({
      where: {
        tenant_id,
        registration_type: 'EMPLOYEE',
        user_status: 'PENDING',
        deleted_at: null
      },
      include: {
        m_role: {
          select: {
            role_id: true,
            role_name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return pendingEmployees.map(employee => ({
      user_id: employee.user_id,
      user_name: employee.user_name,
      user_email: employee.user_email,
      user_full_name: employee.user_full_name,
      user_phone: employee.user_phone,
      current_role: employee.m_role,
      registration_completed_at: employee.created_at
    }));
  }

  /**
   * Owner Approve Employee (with role assignment)
   */
  static async ownerApproveEmployee(data) {
    const { user_id, role_id, approved_by, notes } = data;

    return await prisma.$transaction(async (tx) => {
      // Find employee user
      const employee = await tx.m_user.findFirst({
        where: {
          user_id,
          registration_type: 'EMPLOYEE',
          user_status: 'PENDING',
          deleted_at: null
        },
        include: { m_tenant: true }
      });

      if (!employee) {
        throw new Error('Employee user tidak ditemukan atau sudah diproses');
      }

      // Verify approver is owner of the same tenant
      const owner = await tx.m_user.findFirst({
        where: {
          user_id: approved_by,
          tenant_id: employee.tenant_id,
          deleted_at: null
        },
        include: { m_role: true }
      });

      if (!owner) {
        throw new Error('Owner tidak ditemukan');
      }

      if (owner.m_role?.role_code !== 'OWNER' && !owner.is_sa) {
        throw new Error('Hanya Owner yang bisa approve employee');
      }

      // Verify role exists and is valid
      const role = await tx.m_role.findFirst({
        where: {
          role_id,
          is_active: true,
          deleted_at: null
        }
      });

      if (!role) {
        throw new Error('Role tidak ditemukan atau tidak aktif');
      }

      // Don't allow assigning OWNER role
      if (role.role_code === 'OWNER') {
        throw new Error('Tidak dapat mengassign role OWNER ke employee');
      }

      // Update employee user status and assign role
      await tx.m_user.update({
        where: { user_id },
        data: {
          user_status: 'ACTIVE',
          is_active: true,
          role_id,
          approved_by,
          approved_at: new Date()
        }
      });

      // Send approval email notification
      try {
        await emailService.sendEmail({
          to: employee.user_email,
          subject: 'Akun Employee Anda Telah Disetujui',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Selamat! Akun Anda Telah Disetujui ✅</h2>
              <p>Halo <strong>${employee.user_full_name}</strong>,</p>
              <p>Akun employee Anda di toko <strong>${employee.m_tenant.tenant_name}</strong> telah disetujui oleh Owner.</p>
              <p><strong>Role yang diberikan:</strong> ${role.role_name}</p>
              <p>Anda sekarang dapat login dan menggunakan aplikasi KasirGO.</p>
              ${notes ? `<p><strong>Catatan dari Owner:</strong> ${notes}</p>` : ''}
              <p>Terima kasih!</p>
            </div>
          `
        });
      } catch (emailError) {
              }

      return {
        user_id,
        user_status: 'ACTIVE',
        role_id,
        role_name: role.role_name,
        tenant_name: employee.m_tenant.tenant_name,
        message: 'Employee berhasil disetujui dan role telah diassign. Email notifikasi telah dikirim'
      };
    });
  }

  /**
   * Owner Reject Employee
   */
  static async ownerRejectEmployee(data) {
    const { user_id, rejected_by, rejection_reason } = data;

    return await prisma.$transaction(async (tx) => {
      // Find employee user
      const employee = await tx.m_user.findFirst({
        where: {
          user_id,
          registration_type: 'EMPLOYEE',
          user_status: 'PENDING',
          deleted_at: null
        },
        include: { m_tenant: true }
      });

      if (!employee) {
        throw new Error('Employee user tidak ditemukan atau sudah diproses');
      }

      // Verify rejector is owner of the same tenant
      const owner = await tx.m_user.findFirst({
        where: {
          user_id: rejected_by,
          tenant_id: employee.tenant_id,
          deleted_at: null
        },
        include: { m_role: true }
      });

      if (!owner) {
        throw new Error('Owner tidak ditemukan');
      }

      if (owner.m_role?.role_code !== 'OWNER' && !owner.is_sa) {
        throw new Error('Hanya Owner yang bisa reject employee');
      }

      // Update employee user status
      await tx.m_user.update({
        where: { user_id },
        data: {
          user_status: 'REJECTED',
          is_active: false,
          rejected_by,
          rejected_at: new Date(),
          rejection_reason
        }
      });

      // Send rejection email notification
      try {
        await emailService.sendEmail({
          to: employee.user_email,
          subject: 'Pendaftaran Employee Ditolak',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Pendaftaran Ditolak ❌</h2>
              <p>Halo <strong>${employee.user_full_name}</strong>,</p>
              <p>Kami mohon maaf, pendaftaran employee Anda di toko <strong>${employee.m_tenant.tenant_name}</strong> telah ditolak oleh Owner.</p>
              <p><strong>Alasan penolakan:</strong> ${rejection_reason}</p>
              <p>Jika Anda memiliki pertanyaan, silakan hubungi owner toko.</p>
            </div>
          `
        });
      } catch (emailError) {
              }

      return {
        user_id,
        user_status: 'REJECTED',
        tenant_name: employee.m_tenant.tenant_name,
        message: 'Employee berhasil ditolak. Email notifikasi telah dikirim'
      };
    });
  }
}

module.exports = UserService;
