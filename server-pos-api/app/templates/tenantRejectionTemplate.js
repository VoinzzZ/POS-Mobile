const tenantRejectionTemplate = (ownerName, tenantName, rejectionReason) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pendaftaran Ditolak</title>
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
                background: linear-gradient(135deg, #dc3545 0%, #e74c3c 100%);
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
            .rejection-box {
                background: #f8d7da;
                border: 1px solid #f5c6cb;
                color: #721c24;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                font-size: 16px;
            }
            .reason-box {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                font-size: 16px;
            }
            .info-box {
                background: #f8f9fa;
                border-left: 4px solid #dc3545;
                padding: 15px;
                margin: 20px 0;
                border-radius: 5px;
            }
            .footer {
                background: #f8f9fa;
                padding: 20px 30px;
                text-align: center;
                font-size: 12px;
                color: #6c757d;
            }
            .contact-info {
                background: #e2e3e5;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>❌ Pendaftaran Ditolak</h1>
                <p>Informasi Penolakan Pendaftaran</p>
            </div>

            <div class="content">
                <h2>Halo <strong>${ownerName}</strong>,</h2>

                <div class="rejection-box">
                    ⚠️ <strong>Kami mohon maaf, pendaftaran akun owner Anda untuk toko <em>${tenantName}</em> telah ditolak.</strong>
                </div>

                <div class="reason-box">
                    <h3>📋 Alasan Penolakan:</h3>
                    <p><em>"${rejectionReason}"</em></p>
                </div>

                <div class="info-box">
                    <h3>📝 Informasi Pendaftaran:</h3>
                    <p><strong>Nama Pemohon:</strong> ${ownerName}</p>
                    <p><strong>Nama Toko:</strong> ${tenantName}</p>
                    <p><strong>Status:</strong> <span style="color: #dc3545; font-weight: bold;">DITOLAK</span></p>
                </div>

                <h3>🔍 Apa yang bisa Anda lakukan?</h3>
                <ol>
                    <li><strong>Perbaiki data pendaftaran:</strong> Jika penolakan disebabkan oleh kesalahan data, Anda bisa mendaftar kembali dengan informasi yang benar.</li>
                    <li><strong>Hubungi admin:</strong> Jika Anda perlu klarifikasi lebih lanjut mengenai alasan penolakan.</li>
                    <li><strong>Tinjau persyaratan:</strong> Pastikan Anda memenuhi semua persyaratan pendaftaran.</li>
                </ol>

                <div class="contact-info">
                    <h3>📞 Butuh Bantuan?</h3>
                    <p>Jika Anda memiliki pertanyaan atau merasa ini adalah kesalahan, jangan ragu untuk menghubungi tim support kami:</p>
                    <ul>
                        <li><strong>Email:</strong> support@kasirgo.com</li>
                        <li><strong>WhatsApp:</strong> +62 812-3456-7890</li>
                        <li><strong>Jam Operasional:</strong> Senin - Jumat, 09:00 - 17:00 WIB</li>
                    </ul>
                </div>

                <p>Terima kasih telah mencoba mendaftar di KasirGO. Kami harap Anda bisa mencoba kembali di kemudian hari.</p>
            </div>

            <div class="footer">
                <p>Email ini dikirim secara otomatis, mohon jangan membalas email ini.</p>
                <p>&copy; ${new Date().getFullYear()} KasirGO. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = tenantRejectionTemplate;