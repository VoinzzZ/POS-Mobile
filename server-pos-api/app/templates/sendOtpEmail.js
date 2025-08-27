const otpEmailTemplate = (otpCode) => {
    return `
        <body style="margin:0; padding:0; font-family: Arial, sans-serif; background:#f5f7fa;">
            <div style="max-width:600px; margin:20px auto; background:#ffffff; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1); overflow:hidden;">
                <div style="background:#0d6efd; padding:20px; text-align:center;">
                    <img src="cid:logo" alt="Logo" style="width:60px; height:auto;" />
                    <h1 style="color:#ffffff; margin:10px 0 0; font-size:20px;">Verifikasi Email</h1>
                </div>
                <div style="padding:30px; text-align:center; color:#333333;">
                    <p style="font-size:16px; margin-bottom:20px;">Masukkan kode OTP berikut untuk memverifikasi email kamu:</p>
                    <div style="font-size:32px; font-weight:bold; letter-spacing:6px; color:#0d6efd; margin:20px 0;">${otpCode}</div>
                        <p style="font-size:14px; color:#666;">Kode ini hanya berlaku selama <b>10 menit</b>.</p>
                    </div>
                <div style="padding:20px; background:#f1f3f6; text-align:center; font-size:12px; color:#777;">
                        © ${new Date().getFullYear()} POS Mobile App. Semua Hak Dilindungi.
                </div>
            </div>
        </body>
    `
}

module.exports = otpEmailTemplate;