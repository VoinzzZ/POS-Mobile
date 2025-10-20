const employeeApprovalTemplate = (employeeName, tenantName, roleName, notes) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Akun Employee Disetujui</title>
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
                background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
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
                background: #d1ecf1;
                border: 1px solid #bee5eb;
                color: #0c5460;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                font-size: 16px;
            }
            .role-box {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                text-align: center;
            }
            .role-box h3 {
                margin: 0 0 10px 0;
                font-size: 24px;
            }
            .role-box .role-name {
                font-size: 20px;
                font-weight: bold;
                margin: 10px 0;
            }
            .info-box {
                background: #f8f9fa;
                border-left: 4px solid #17a2b8;
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
                background: #17a2b8;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                font-weight: 500;
            }
            .features {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin: 20px 0;
            }
            .feature-item {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Selamat Bergabung!</h1>
                <p>Akun Employee Anda Telah Disetujui</p>
            </div>

            <div class="content">
                <h2>Halo <strong>${employeeName}</strong>!</h2>

                <div class="success-box">
                    ✅ <strong>Akun employee Anda di toko <em>${tenantName}</em> telah disetujui oleh Owner.</strong>
                </div>

                <div class="role-box">
                    <h3>👔 Role Anda</h3>
                    <div class="role-name">${roleName}</div>
                    <p>Selamat bekerja dengan role baru Anda!</p>
                </div>

                <div class="info-box">
                    <h3>🏪 Informasi Tempat Kerja:</h3>
                    <p><strong>Toko:</strong> ${tenantName}</p>
                    <p><strong>Status Akun:</strong> <span style="color: #28a745; font-weight: bold;">AKTIF</span></p>
                    <p><strong>Tanggal Aktif:</strong> ${new Date().toLocaleDateString('id-ID')}</p>
                </div>

                ${notes ? `
                <div class="notes-box">
                    📝 <strong>Pesan dari Owner:</strong><br>
                    ${notes}
                </div>
                ` : ''}

                <h3>🚀 Anda sekarang dapat:</h3>
                <div class="features">
                    <div class="feature-item">
                        <h4>📱 Login Aplikasi</h4>
                        <p>Akses semua fitur sesuai role</p>
                    </div>
                    <div class="feature-item">
                        <h4>💰 Transaksi</h4>
                        <p>Proses penjualan dengan mudah</p>
                    </div>
                    <div class="feature-item">
                        <h4>📦 Kelola Produk</h4>
                        <p>Atur stok dan inventaris</p>
                    </div>
                    <div class="feature-item">
                        <h4>📊 Lihat Laporan</h4>
                        <p>Monitoring penjualan harian</p>
                    </div>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="#" class="btn">Login Sekarang</a>
                </div>

                <p><strong>Selamat bekerja di ${tenantName}! 🎯</strong></p>
                <p>Kami siap mendukung produktivitas Anda dengan KasirGO.</p>
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

module.exports = employeeApprovalTemplate;