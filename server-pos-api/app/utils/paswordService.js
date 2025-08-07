const bcrypt = require('bcryptjs');

class PasswordService {
    // Hash Password
    static async hashPassword(plainPassword) {
        try {
            const saltRounds = 12
            return await bcrypt.hash(plainPassword, saltRounds);
        } catch (error) {
            throw Error(`Password Hashing failed: ${error.message}`);
        }
    }

    // Compare Password
    static async comparePassword(plainPassword, hashedPassword) {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
           throw Error(`Password comparision failed: ${error.message}`); 
        }
    }

    // Validasi Password Strenght
    static validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const errors = []

        if(password.length < minLength) {
            errors.push(`Password must be at least ${minLength} Character long`);
        }
        if(!hasUpperCase) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if(!hasLowerCase) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if(!hasNumbers) {
            errors.push('Password must contain at least one number');
        }
        if(!hasSpecialChar) {
            errors.push('Password must contain at least one special character')
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Validate confrim password
    static validateConfrimPassword(password, confirmPassword) {
        if(password !== confirmPassword) {
            return {
                isValid: false,
                error: 'Password does not match'
            };
        }

        return {
            isValid: true,
            error: null
        };
    }
}

module.exports = PasswordService;