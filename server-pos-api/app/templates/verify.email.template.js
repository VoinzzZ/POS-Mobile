function verifyEmailTemplate(userName, verificationURL) {
    return `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 500px; margin: auto;">
            <h2 style="color: #4F46E5; text-align: center;">Hi ${userName},</h2>
            <p style="text-align: center;">
                Terima kasih sudah mendaftar. Klik tombol di bawah untuk memverifikasi email kamu:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationURL}" 
                   style="
                       background-color: #4F46E5;
                       color: white;
                       padding: 12px 24px;
                       text-decoration: none;
                       font-size: 16px;
                       border-radius: 6px;
                       display: inline-block;
                       font-weight: bold;
                   ">
                   ✅ Verifikasi Email
                </a>
            </div>

            <p style="font-size: 14px; color: #555; text-align: center;">
                Link ini hanya berlaku selama <strong>24 jam</strong> demi keamanan akun Anda.
            </p>

            <p style="margin-top: 30px; text-align: center;">
                Salam hangat,<br><strong>Tim POS App</strong>
            </p>
        </div>
    `;
}

module.exports = verifyEmailTemplate;
