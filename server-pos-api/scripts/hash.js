const PasswordService = require('../app/utils/passwordService');

(async () => {
  const hash = await PasswordService.hashPassword('Admin123!');
  console.log(hash);
})();