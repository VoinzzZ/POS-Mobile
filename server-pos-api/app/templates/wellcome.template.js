function wellcomeTemplate(userName, userRole) {
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
        `
    ;
}

module.exports = wellcomeTemplate;