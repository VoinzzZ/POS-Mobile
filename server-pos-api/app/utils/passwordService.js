const bcrypt = require('bcryptjs');

async function hashPassword(plainPassword) {
  try {
    const saltRounds = 12;
    return await bcrypt.hash(plainPassword, saltRounds);
  } catch (error) {
    throw new Error(`Password Hashing failed: ${error.message}`);
  }
}

async function comparePassword(plainPassword, hashedPassword) {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    throw new Error(`Password comparison failed: ${error.message}`);
  }
}

function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateConfirmPassword(password, confirmPassword) {
  if (password !== confirmPassword) {
    return {
      isValid: false,
      errors: ['Passwords do not match']
    };
  }
  return { isValid: true, errors: [] };
}

module.exports = {
  hashPassword,
  comparePassword,
  validatePassword,
  validateConfirmPassword
};
