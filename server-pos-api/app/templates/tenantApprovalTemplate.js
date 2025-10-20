const tenantApprovalTemplate = (ownerName, tenantName, notes) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Akun Owner Disetujui</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f6f9fc;
                margin: 0;
                padding: 20px;
                color: #333;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .header {
                padding: 40px 30px;
                text-align: center;
                color: white;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
            }
            .content {
                background: white;
                padding: 40px 30px;
                text-align: left;
            }
            .success-box {
                background: #d4edda;
                border: 1px solid #c3e6cb;
                color: #155724;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                font-size: 16px;
            }
            .info-box {
                background: #f8f9fa;
                border-left: 4px solid #28a745;
                padding: 15px;
                margin: 20px 0;
                border-radius: 5px;
            }
            .notes-box {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                font-size: 14px;
            }
            .footer {
                background: #f8f9fa;
                padding: 20px 30px;
                text-align: center;
                font-size: 12px;
                color: #6c757d;
            }
            .btn {
                display: inline-block;
                padding: 12px 24px;
                background: #28a745;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                font-weight: 500;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Selamat! Akun Anda Telah Disetujui</h1>
                <p>Pendaftaran Owner Berhasil</p>
            </div>

            <div class="content">
                <h2>Halo <strong>${ownerName}</strong>!</h2>

                <div class="success-box">
                    ✅ <strong>Akun owner Anda untuk toko <em>${tenantName}</em> telah disetujui oleh Super Admin.</strong>
                </div>

                <div class="info-box">
                    <h3>🏪 Informasi Toko:</h3>
                    <p><strong>Nama Toko:</strong> ${tenantName}</p>
                    <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">AKTIF</span></p>
                </div>

                ${notes ? `
                <div class="notes-box">
                    📝 <strong>Catatan dari Super Admin:</strong><br>
                    ${notes}
                </div>
                ` : ''}

                <p>Anda sekarang dapat:</p>
                <ul>
                    <li>Login ke aplikasi KasirGO</li>
                    <li>Mengelola produk dan inventaris</li>
                    <li>Melakukan transaksi penjualan</li>
                    <li>Mengundang employee dengan PIN registration</li>
                    <li>Melihat laporan penjualan</li>
                </ul>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="#" class="btn">Login Sekarang</a>
                </div>

                <p><strong>Terima kasih telah memilih KasirGO!</strong></p>
                <p>Kami siap membantu kesuksesan bisnis Anda. 🚀</p>
            </div>

            <div class="footer">
                <p>Email ini dikirim secara otomatis, mohon jangan membalas email ini.</p>
                <p>&copy; ${new Date().getFullYear()} KasirGO. All rights reserved.</p>
                <p>Butuh bantuan? Hubungi support@kasirgo.com</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = tenantApprovalTemplate;