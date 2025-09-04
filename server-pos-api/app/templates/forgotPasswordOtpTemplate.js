const forgotPasswordOtpTemplate = (otpCode, userName) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password</title>
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
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
                text-align: center;
            }
            .otp-box {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 10px;
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                margin: 25px 0;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            .warning {
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
            .security-notice {
                background: #d1ecf1;
                border: 1px solid #bee5eb;
                color: #0c5460;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Reset Password</h1>
                <p>Permintaan reset password untuk akun Anda</p>
            </div>
            
            <div class="content">
                <h2>Halo ${userName || 'User'}!</h2>
                <p>Kami menerima permintaan untuk reset password akun Anda. Gunakan kode verifikasi di bawah ini:</p>
                
                <div class="otp-box">
                    ${otpCode}
                </div>
                
                <div class="warning">
                    ⚠️ <strong>Kode ini akan expired dalam 10 menit</strong><br>
                    Jangan bagikan kode ini kepada siapapun!
                </div>
                
                <div class="security-notice">
                    🛡️ <strong>Catatan Keamanan:</strong><br>
                    Jika Anda tidak meminta reset password, abaikan email ini. 
                    Akun Anda tetap aman dan tidak ada perubahan yang dibuat.
                </div>
                
                <p>Jika Anda membutuhkan bantuan, hubungi tim support kami.</p>
            </div>
            
            <div class="footer">
                <p>Email ini dikirim secara otomatis, mohon jangan membalas email ini.</p>
                <p>&copy; 2024 ${process.env.APP_NAME || 'Your App'}. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = forgotPasswordOtpTemplate;