const MailConfig = require("../config/mail.config");

class EmailService {
    constructor() {
        this.transporter = MailConfig.createTransporter();
    }

    // Verify transporter configuration
    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('Email Server connection verified');
            return true;
        } catch (error) {
            console.log('Email Server connection failed', error.message);
            return false;
        }
    }

    // Send base email method
    async sendEmail({ to, subject, html, text = null }) {
        try {
            const mailOptions = {
                from: {
                    name: process.env.APP_NAME,
                    address: process.env.FROM_EMAIL
                },
                to,
                subject,
                html,
                ...(text & {text})
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log(`Email Sent Successfully to ${to}: `, result.messageId);
            return {
                success: true,
                messageId: result.messageId,
                message: 'Email sent successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error sent email'
            };
        }
    }

    // Send Password Email
    async sendResetPasswordEmail(userEmail, userName, resetURL) {
        try {
            const html = resetPasswordTemplate(userName, resetURL);
            const subject = 'Reset Password - POS App';

            const result = await this.sendEmail({
                to: userEmail,
                subject,
                html
            });

            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to send reset password email'
            };
        }
    }

    // Send Email verification
    async sendVerificationEmail(userEmail, userName, verificationURL) {
        try {
            const html = verifyEmailTemplate(userName, verificationURL);
            const subject = 'Verifikasi Email - POS App';

            const result = await this.sendEmail({
                to: userEmail,
                subject,
                html
            });

            return result;
        } catch (error) {
            console.error('Error sending verification email:', error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to send verification email'
            };
        }
    }

    // Send Wellcome email
    async sendWelcomeEmail(userEmail, userName, userRole) {
        try {
            const html = wellcomeTemplate(userName, userRole);
            const subject = 'Selamat Datang di POS App! 🎉';

            const result = await this.sendEmail({
                to: userEmail,
                subject,
                html
            });

            return result;
        } catch (error) {
            console.error('Error sending welcome email:', error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to send welcome email'
            };
        }
    }

    // Send multiple emails (bulk)
    async sendBulkEmails(emails) {
        const results = [];
        
        for (const email of emails) {
            const result = await this.sendEmail(email);
            results.push({
                to: email.to,
                ...result
            });
        }

        const successCount = results.filter(r => r.success).length;
        console.log(`📊 Bulk email results: ${successCount}/${results.length} sent successfully`);

        return {
            totalEmails: results.length,
            successCount,
            failedCount: results.length - successCount,
            results
        };
    }

    // Send custom email (for general purposes)
    async sendCustomEmail(userEmail, subject, htmlContent, textContent = null) {
        try {
            const result = await this.sendEmail({
                to: userEmail,
                subject,
                html: htmlContent,
                text: textContent
            });

            return result;
        } catch (error) {
            console.error('Error sending custom email:', error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to send custom email'
            };
        }
    }

        // Test email functionality
    async sendTestEmail(testEmail) {
        try {
            const html = `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #4F46E5;">🧪 Test Email</h2>
                    <p>Ini adalah test email dari POS App.</p>
                    <p>Jika Anda menerima email ini, maka konfigurasi email sudah benar!</p>
                    <p><strong>Waktu pengiriman:</strong> ${new Date().toLocaleString('id-ID')}</p>
                </div>
            `;

            const result = await this.sendEmail({
                to: testEmail,
                subject: '🧪 Test Email - POS App',
                html
            });

            return result;
        } catch (error) {
            console.error('Error sending test email:', error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to send test email'
            };
        }
    }

    // Close transporter connection
    close() {
        if (this.transporter) {
            this.transporter.close();
            console.log('📧 Email transporter connection closed');
        }
    }
}

module.exports = EmailService;