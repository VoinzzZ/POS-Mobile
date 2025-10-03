const adminService = require('../services/admin.service');

async function generatePin(req, res) {
  try {
    const { expiresInHours } = req.body;
    const { userId: adminId } = req.user;

    const data = await adminService.generatePin(adminId, expiresInHours);

    return res.status(201).json({
      success: true,
      status: 'success',
      message: 'Registration PIN generated successfully',
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 'error',
      message: error.message || 'Internal Server Error',
      error: error.code || 'INTERNAL_SERVER_ERROR',
      details: error.stack,
    });
  }
}

async function listPins(req, res) {
  try {
    const { status, page, limit } = req.query;
    const data = await adminService.listPins(status, page, limit);

    return res.json({
      success: true,
      message: 'Registration PINs retrieved successfully',
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 'error',
      message: error.message || 'Internal Server Error',
      error: error.code || 'INTERNAL_SERVER_ERROR',
      details: error.stack,
    });
  }
}

async function revokePin(req, res) {
  try {
    const { pinId } = req.params;
    const { userId: adminId } = req.user;

    await adminService.revokePin(pinId, adminId);

    return res.json({
      success: true,
      message: 'Registration PIN revoked successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 'error',
      message: error.message || 'Internal Server Error',
      error: error.code || 'INTERNAL_SERVER_ERROR',
      details: error.stack,
    });
  }
}

async function getPinStats(req, res) {
  try {
    const data = await adminService.getPinStats();

    return res.json({
      success: true,
      message: 'PIN statistics retrieved successfully',
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 'error',
      message: error.message || 'Internal Server Error',
      error: error.code || 'INTERNAL_SERVER_ERROR',
      details: error.stack,
    });
  }
}

async function getAllUsers(req, res) {
  try {
    const { role, page, limit } = req.query;
    const data = await adminService.getAllUsers(role, page, limit);

    return res.json({
      success: true,
      message: 'Users retrieved successfully',
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 'error',
      message: error.message || 'Internal Server Error',
      error: error.code || 'INTERNAL_SERVER_ERROR',
      details: error.stack,
    });
  }
}

async function getUserStats(req, res) {
  try {
    const data = await adminService.getUserStats();

    return res.json({
      success: true,
      message: 'User statistics retrieved successfully',
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 'error',
      message: error.message || 'Internal Server Error',
      error: error.code || 'INTERNAL_SERVER_ERROR',
      details: error.stack,
    });
  }
}

module.exports = {
  generatePin,
  listPins,
  revokePin,
  getPinStats,
  getAllUsers,
  getUserStats,
};
