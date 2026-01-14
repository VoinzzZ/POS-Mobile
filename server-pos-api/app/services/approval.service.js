const prisma = require('../config/mysql.db.js');
const EmailService = require('./email.service.js');
const tenantApprovalTemplate = require('../templates/tenantApprovalTemplate.js');
const tenantRejectionTemplate = require('../templates/tenantRejectionTemplate.js');
const employeeApprovalTemplate = require('../templates/employeeApprovalTemplate.js');
const employeeRejectionTemplate = require('../templates/employeeRejectionTemplate.js');

const emailService = new EmailService();

class ApprovalService {
  static async saApproveOwner(data) {
    const { user_id, approved_by, notes } = data;

    return await prisma.$transaction(async (tx) => {
      // Find owner user with tenant
      const owner = await tx.m_user.findFirst({
        where: {
          user_id,
          registration_type: 'OWNER',
          approved_at: null,
          rejected_at: null,
          deleted_at: null
        },
        include: { m_tenant: true }
      });

      if (!owner) {
        throw new Error('Owner user tidak ditemukan atau sudah diproses');
      }

      if (!owner.tenant_id) {
        throw new Error('Owner tidak memiliki tenant terkait');
      }

      // Verify approver is SA
      const approver = await tx.m_user.findFirst({
        where: {
          user_id: approved_by,
          is_sa: true,
          deleted_at: null
        }
      });

      if (!approver) {
        throw new Error('Hanya Super Admin yang bisa approve owner');
      }

      // Update owner user status
      await tx.m_user.update({
        where: { user_id },
        data: {
          approved_at: { not: null },
          is_active: true,
          approved_by,
          approved_at: new Date()
        }
      });

      // Update tenant status
      await tx.m_tenant.update({
        where: { tenant_id: owner.tenant_id },
        data: {
          tenant_status: 'APPROVED',
          is_active: true,
          approved_by,
          approved_at: new Date()
        }
      });

      // Send approval email notification
      try {
        await emailService.sendEmail({
          to: owner.user_email,
          subject: 'Akun Owner Anda Telah Disetujui',
          html: tenantApprovalTemplate(owner.user_full_name, owner.m_tenant.tenant_name, notes)
        });
      } catch (emailError) {
      }

      return {
        user_id,
        tenant_id: owner.tenant_id,
        approved_at: { not: null },
        tenant_status: 'APPROVED',
        message: 'Owner dan tenant berhasil disetujui. Email notifikasi telah dikirim'
      };
    });
  }

  static async saRejectOwner(data) {
    const { user_id, rejected_by, rejection_reason } = data;

    return await prisma.$transaction(async (tx) => {
      // Find owner user with tenant
      const owner = await tx.m_user.findFirst({
        where: {
          user_id,
          registration_type: 'OWNER',
          approved_at: null,
          rejected_at: null,
          deleted_at: null
        },
        include: { m_tenant: true }
      });

      if (!owner) {
        throw new Error('Owner user tidak ditemukan atau sudah diproses');
      }

      // Verify rejector is SA
      const rejector = await tx.m_user.findFirst({
        where: {
          user_id: rejected_by,
          is_sa: true,
          deleted_at: null
        }
      });

      if (!rejector) {
        throw new Error('Hanya Super Admin yang bisa reject owner');
      }

      // Update owner user status
      await tx.m_user.update({
        where: { user_id },
        data: {
          rejected_at: { not: null },
          is_active: false,
          rejected_by,
          rejected_at: new Date(),
          rejection_reason
        }
      });

      // Update tenant status
      if (owner.tenant_id) {
        await tx.m_tenant.update({
          where: { tenant_id: owner.tenant_id },
          data: {
            tenant_status: 'REJECTED',
            is_active: false,
            rejected_by,
            rejected_at: new Date(),
            rejection_reason
          }
        });
      }

      // Send rejection email notification
      try {
        await emailService.sendEmail({
          to: owner.user_email,
          subject: 'Pendaftaran Owner Ditolak',
          html: tenantRejectionTemplate(owner.user_full_name, owner.m_tenant?.tenant_name, rejection_reason)
        });
      } catch (emailError) {
      }

      return {
        user_id,
        tenant_id: owner.tenant_id,
        rejected_at: { not: null },
        tenant_status: 'REJECTED',
        message: 'Owner dan tenant berhasil ditolak. Email notifikasi telah dikirim'
      };
    });
  }

  static async ownerApproveEmployee(data) {
    const { user_id, role_id, approved_by, notes } = data;

    return await prisma.$transaction(async (tx) => {
      // Find employee user
      const employee = await tx.m_user.findFirst({
        where: {
          user_id,
          registration_type: 'EMPLOYEE',
          approved_at: null,
          rejected_at: null,
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
          html: employeeApprovalTemplate(employee.user_full_name, employee.m_tenant.tenant_name, role.role_name, notes)
        });
      } catch (emailError) {
      }

      return {
        user_id,
        approved_at: new Date(),
        role_id,
        role_name: role.role_name,
        tenant_name: employee.m_tenant.tenant_name,
        message: 'Employee berhasil disetujui dan role telah diassign. Email notifikasi telah dikirim'
      };
    });
  }

  static async ownerRejectEmployee(data) {
    const { user_id, rejected_by, rejection_reason } = data;

    return await prisma.$transaction(async (tx) => {
      // Find employee user
      const employee = await tx.m_user.findFirst({
        where: {
          user_id,
          registration_type: 'EMPLOYEE',
          approved_at: null,
          rejected_at: null,
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
          rejected_at: { not: null },
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
          html: employeeRejectionTemplate(employee.user_full_name, employee.m_tenant.tenant_name, rejection_reason)
        });
      } catch (emailError) {
      }

      return {
        user_id,
        rejected_at: { not: null },
        tenant_name: employee.m_tenant.tenant_name,
        message: 'Employee berhasil ditolak. Email notifikasi telah dikirim'
      };
    });
  }

  static async getPendingOwnerApprovals() {
    const pendingOwners = await prisma.m_user.findMany({
      where: {
        registration_type: 'OWNER',
        approved_at: null,
        rejected_at: null,
        deleted_at: null
      },
      include: {
        m_tenant: {
          select: {
            tenant_id: true,
            tenant_name: true,
            tenant_phone: true,
            tenant_email: true,
            tenant_address: true,
            tenant_description: true,
            created_at: true
          }
        },
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

    return pendingOwners.map(owner => ({
      user_id: owner.user_id,
      user_name: owner.user_name,
      user_email: owner.user_email,
      user_full_name: owner.user_full_name,
      user_phone: owner.user_phone,
      tenant: owner.m_tenant,
      role: owner.m_role,
      registration_completed_at: owner.created_at
    }));
  }

  static async getPendingEmployeeApprovals(tenant_id) {
    const pendingEmployees = await prisma.m_user.findMany({
      where: {
        tenant_id,
        registration_type: 'EMPLOYEE',
        approved_at: null,
        rejected_at: null,
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
}

module.exports = ApprovalService;
