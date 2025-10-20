const employeeRejectionTemplate = (employeeName, tenantName, rejectionReason) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pendaftaran Employee Ditolak</title>
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
                background: linear-gradient(135deg, #fd7e14 0%, #e8590c 100%);
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
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                font-size: 16px;
            }
            .reason-box {
                background: #f8d7da;
                border: 1px solid #f5c6cb;
                color: #721c24;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                font-size: 16px;
            }
            .info-box {
                background: #f8f9fa;
                border-left: 4px solid #fd7e14;
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
            .next-steps {
                background: #e2e3e5;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .contact-info {
                background: #d1ecf1;
                border: 1px solid #bee5eb;
                color: #0c5460;
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
                <p>Informasi Penolakan Employee</p>
            </div>

            <div class="content">
                <h2>Halo <strong>${employeeName}</strong>,</h2>

                <div class="rejection-box">
                    ⚠️ <strong>Kami mohon maaf, pendaftaran employee Anda di toko <em>${tenantName}</em> telah ditolak oleh Owner.</strong>
                </div>

                <div class="reason-box">
                    <h3>📋 Alasan Penolakan:</h3>
                    <p><em>"${rejectionReason}"</em></p>
                </div>

                <div class="info-box">
                    <h3>📝 Informasi Pendaftaran:</h3>
                    <p><strong>Nama Pelamar:</strong> ${employeeName}</p>
                    <p><strong>Toko yang Dilamar:</strong> ${tenantName}</p>
                    <p><strong>Status:</strong> <span style="color: #dc3545; font-weight: bold;">DITOLAK</span></p>
                    <p><strong>Tanggal:</strong> ${new Date().toLocaleDateString('id-ID')}</p>
                </div>

                <div class="next-steps">
                    <h3>🔄 Langkah Selanjutnya</h3>
                    <p>Jika Anda masih tertarik untuk bergabung dengan ${tenantName}, Anda bisa:</p>
                    <ol>
                        <li><strong>Hubungi Owner:</strong> Diskusikan lebih lanjut mengenai alasan penolakan</li>
                        <li><strong>Perbaiki Berkas:</strong> Pastikan data diri sudah lengkap dan valid</li>
                        <li><strong>Tunggu Invite Baru:</strong> Owner bisa mengirim PIN registration baru di kemudian hari</li>
                    </ol>
                </div>

                <div class="contact-info">
                    <h3>💡 Catatan Penting</h3>
                    <ul>
                        <li>Penolakan ini bukan berarti Anda tidak kompeten, mungkin ada kesalahan teknis atau ketidakcocokan jadwal</li>
                        <li>Anda tetap bisa mendaftar sebagai employee di toko lain yang menggunakan KasirGO</li>
                        <li>Jika Anda merasa ini adalah kesalahan, jangan ragu untuk klarifikasi dengan owner toko</li>
                    </ul>
                </div>

                <h3>📞 Butuh Bantuan?</h3>
                <p>Jika Anda mengalami kesulitan atau memiliki pertanyaan:</p>
                <ul>
                    <li><strong>Hubungi Owner Toko:</strong> Pastikan Anda memiliki kontak yang tepat</li>
                    <li><strong>Support KasirGO:</strong> support@kasirgo.com untuk bantuan teknis</li>
                    <li><strong>Coba Daftar Lagi:</strong> Jika owner mengizinkan, Anda bisa menggunakan PIN registration baru</li>
                </ul>

                <p>Terima kasih atas minat Anda untuk bergabung dengan ${tenantName}. Semoga sukses di tempat lain! 🌟</p>
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

module.exports = employeeRejectionTemplate;