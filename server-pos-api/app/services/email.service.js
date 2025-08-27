const MailConfig = require("../config/mail.config");
const otpTemplate = require("../templates/sendOtpEmail");

class EmailService {
    constructor() {
        this.transporter = MailConfig.createTransporter();
    }

    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Email Server connection verified');
            return true;
        } catch (error) {
            console.log('❌ Email Server connection failed', error.message);
            return false;
        }
    }

    async sendEmail({ to, subject, html, text = null, attachments = [] }) {
        try {
            const mailOptions = {
                from: {
                    name: process.env.APP_NAME,
                    address: process.env.FROM_EMAIL
                },
                to,
                subject,
                html,
                ...(text ? { text } : {}),
                ...(attachments.length ? { attachments } : {})
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log(`📨 Email sent to ${to}: `, result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('nodemailer error: ', error);
            return { success: false, error: error.message };
        }
    }

    // Method khusus OTP
    async sendOtpEmail(to, otpCode) {
        return this.sendEmail({
            to,
            subject: "Kode OTP Verifikasi Email",
            html: otpTemplate(otpCode)
        });
    }

    close() {
        if (this.transporter) {
            this.transporter.close();
            console.log('📧 Email transporter connection closed');
        }
    }
}

module.exports = EmailService;