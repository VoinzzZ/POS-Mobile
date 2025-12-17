const MailConfig = require("../config/mail.config");
const otpTemplate = require("../templates/sendOtpEmail");
const forgotPasswordOtpTemplate = require("../templates/forgotPasswordOtpTemplate")

class EmailService {
    constructor() {
        this.transporter = MailConfig.createTransporter();
    }

    async verifyConnection() {
        try {
            await this.transporter.verify();
                        return true;
        } catch (error) {
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
                        return { success: true, messageId: result.messageId };
        } catch (error) {
                        return { success: false, error: error.message };
        }
    }

    async sendOtpEmail(to, otpCode) {
        return this.sendEmail({
            to,
            subject: "Kode OTP Verifikasi Email",
            html: otpTemplate(otpCode)
        });
    }

        async sendForgotPasswordOtp(to, otpCode, userName) {
        return this.sendEmail({
            to,
            subject: "Reset Password - Kode Verifikasi",
            html: forgotPasswordOtpTemplate(otpCode, userName)
        });
    }

    close() {
        if (this.transporter) {
            this.transporter.close();
                    }
    }
}

module.exports = EmailService;