function resetPassword(userName, resetURL) {
    return `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <h2 style="color: #DC2626;">Hi ${userName},</h2>
            <p>Kami menerima permintaan untuk mereset password akun Anda. Klik tombol di bawah untuk melanjutkan:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetURL}" 
                   style="
                       background-color: #DC2626;
                       color: white;
                       padding: 12px 24px;
                       text-decoration: none;
                       font-size: 16px;
                       border-radius: 6px;
                       display: inline-block;
                   ">
                   Reset Password
                </a>
            </div>

            <p style="font-size: 14px; color: #555;">
                Jika Anda tidak meminta reset password, abaikan email ini.
            </p>

            <p style="margin-top: 30px;">Salam hangat,<br><strong>Tim POS App</strong></p>
        </div>
        `
    ;
}

module.exports = resetPassword;