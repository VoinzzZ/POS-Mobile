const { PrismaClient } = require('@prisma/client');
const passwordService = require('../utils/paswordService');
const jwtService = require('../utils/jwtService');

const prisma = PrismaClient();

class AuthController {
        // User Registration
        static async register(req, res) {
            try {
                const {name, email, password, confirmPassword, role} = req.body;

                if(!name || !email || !password || !confirmPassword) {
                    return res.status(400).json({
                        success: false,
                        message: 'All fields are required',
                        error: 'MISSING_FIELDS'
                    });
                }

            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message: 'Register failed',
                    error: 'REGISTER_ERROR'
                });
            }
        }
}