const prisma = require('../config/mysql.db');
const crypto = require('crypto');

// Generate Registration PIN
async function generatePin(adminId, expiresInHours = 24) {
  if (expiresInHours < 1 || expiresInHours > 168) {
    throw new Error('Expiry hours must be between 1 and 168');
  }

  const code = String(crypto.randomInt(100000, 999999));
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  const pin = await prisma.registrationPin.create({
    data: {
      code,
      expiresAt,
      createdById: adminId,
    },
  });

  return {
    pin: pin.code,
    expiresAt: pin.expiresAt,
  };
}

// List all generated PINs
async function listPins(status, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const where = {};

  if (status === 'active') {
    where.AND = [{ used: false }, { expiresAt: { gt: new Date() } }];
  } else if (status === 'used') {
    where.used = true;
  } else if (status === 'expired') {
    where.AND = [{ used: false }, { expiresAt: { lt: new Date() } }];
  }

  const [pins, total] = await Promise.all([
    prisma.registrationPin.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            id: true,
            userName: true,
            email: true,
          },
        },
      },
    }),
    prisma.registrationPin.count({ where }),
  ]);

  return {
    pins,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Revoke a PIN
async function revokePin(pinId, adminId) {
  const id = parseInt(pinId, 10);
  const pin = await prisma.registrationPin.findUnique({
    where: { id },
  });

  if (!pin) throw new Error('Registration PIN not found');
  if (pin.used) throw new Error('Cannot revoke already used PIN');

  await prisma.registrationPin.update({
    where: { id },
    data: {
      expiresAt: new Date(),
      revokedById: adminId,
      revokedAt: new Date(),
    },
  });
}

// Get PIN usage statistics
async function getPinStats() {
  const [activePins, usedPins, expiredPins, recentActivity] = await prisma.$transaction([
    prisma.registrationPin.count({
      where: { used: false, expiresAt: { gt: new Date() } },
    }),
    prisma.registrationPin.count({
      where: { used: true },
    }),
    prisma.registrationPin.count({
      where: { used: false, expiresAt: { lt: new Date() } },
    }),
    prisma.registrationPin.findMany({
      where: {
        OR: [{ used: true }, { expiresAt: { lt: new Date() } }],
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        createdBy: {
          select: { userName: true, email: true },
        },
      },
    }),
  ]);

  return {
    activePins,
    usedPins,
    expiredPins,
    recentActivity,
  };
}

// Get all users with optional role filter
async function getAllUsers(role, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  const where = {};

  if (role && ['ADMIN', 'CASHIER'].includes(role.toUpperCase())) {
    where.role = role.toUpperCase();
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userName: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Get user statistics
async function getUserStats() {
  const [totalUsers, adminCount, cashierCount, verifiedUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.user.count({ where: { role: 'CASHIER' } }),
    prisma.user.count({ where: { isVerified: true } }),
  ]);

  return {
    totalUsers,
    adminCount,
    cashierCount,
    verifiedUsers,
    unverifiedUsers: totalUsers - verifiedUsers,
  };
}

module.exports = {
  generatePin,
  listPins,
  revokePin,
  getPinStats,
  getAllUsers,
  getUserStats,
};
