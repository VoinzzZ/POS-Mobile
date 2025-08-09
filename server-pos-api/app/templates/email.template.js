class EmailTemplate {
    static verification(userName, verificationURL) {
        return `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <h2 style="color: #4F46E5;">Hi ${userName},</h2>
            <p>Terima kasih sudah mendaftar. Klik tombol di bawah untuk memverifikasi email kamu:</p>
            
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
                   ">
                   Verifikasi Email
                </a>
            </div>

            <p style="font-size: 14px; color: #555;">
                Link ini hanya berlaku selama <strong>24 jam</strong> demi keamanan akun Anda.
            </p>

            <p style="margin-top: 30px;">Salam hangat,<br><strong>Tim POS App</strong></p>
        </div>
        `;
    }

    static resetPassword(userName, resetURL) {
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
        `;
    }

    static welcome(userName, userRole) {
        return `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <h2 style="color: #16A34A;">Welcome, ${userName}!</h2>
            <p>Email kamu berhasil diverifikasi 🎉. Selamat bergabung di aplikasi POS kami!</p>
            
            <div style="background-color: #F0FDF4; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <strong>Role kamu:</strong> 
                <span style="color: #16A34A;">${userRole}</span>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="https://pos-app.com/dashboard" 
                   style="
                       background-color: #16A34A;
                       color: white;
                       padding: 12px 24px;
                       text-decoration: none;
                       font-size: 16px;
                       border-radius: 6px;
                       display: inline-block;
                   ">
                   Buka Dashboard
                </a>
            </div>

            <p style="font-size: 14px; color: #555;">
                Mulai kelola penjualan dan stok produk kamu sekarang juga.
            </p>

            <p style="margin-top: 30px;">Salam hangat,<br><strong>Tim POS App</strong></p>
        </div>
        `;
    }
}

module.exports = EmailTemplate;