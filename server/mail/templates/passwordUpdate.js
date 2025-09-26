exports.passwordUpdated = (email, name) => {
	return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Update Confirmation</title>
        <style>
            body {
                font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #F1F2FF;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background: linear-gradient(135deg, #000814 0%, #161D29 100%);
            }
            .container {
                background: linear-gradient(135deg, #2C333F 0%, #424854 100%);
                padding: 30px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                border: 1px solid #585D69;
            }
            .header {
                background: linear-gradient(135deg, #06D6A0 0%, #05BF8E 100%);
                color: #000814;
                padding: 25px;
                border-radius: 12px;
                text-align: center;
                margin-bottom: 30px;
                box-shadow: 0 5px 15px rgba(6, 214, 160, 0.3);
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
            }
            .header .subtitle {
                margin: 10px 0 0 0;
                font-size: 16px;
                opacity: 0.8;
            }
            .content {
                margin-bottom: 30px;
            }
            .greeting {
                font-size: 18px;
                margin-bottom: 20px;
                color: #F1F2FF;
            }
            .success-message {
                background-color: #073B4C;
                padding: 20px;
                border-radius: 10px;
                border-left: 4px solid #06D6A0;
                margin: 20px 0;
                color: #ECF5FF;
            }
            .email-highlight {
                background: linear-gradient(135deg, #FFD60A 0%, #E7C009 100%);
                color: #000814;
                padding: 15px;
                border-radius: 10px;
                margin: 20px 0;
                text-align: center;
                font-weight: 600;
                font-size: 16px;
                box-shadow: 0 5px 15px rgba(255, 214, 10, 0.2);
            }
            .security-notice {
                background-color: #2D5A6A;
                border: 1px solid #EF476F;
                color: #ECF5FF;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
            }
            .security-notice h3 {
                margin-top: 0;
                color: #EF476F;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #06D6A0 0%, #05BF8E 100%);
                color: #000814;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 25px;
                font-weight: 700;
                text-align: center;
                margin: 20px 0;
                transition: transform 0.2s;
                box-shadow: 0 5px 15px rgba(6, 214, 160, 0.3);
            }
            .cta-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(6, 214, 160, 0.4);
            }
            .footer {
                text-align: center;
                color: #AFB2BF;
                font-size: 14px;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #585D69;
            }
            .support-link {
                color: #06D6A0;
                text-decoration: none;
                font-weight: 600;
            }
            .support-link:hover {
                text-decoration: underline;
            }
            .logo {
                max-width: 150px;
                margin-bottom: 15px;
            }
            .security-tips {
                background-color: #161D29;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                border: 1px solid #2C333F;
            }
            .tip-item {
                display: flex;
                align-items: center;
                margin: 10px 0;
                color: #DBDDEA;
            }
            .tip-icon {
                margin-right: 10px;
                color: #06D6A0;
                font-size: 16px;
            }
            @media (max-width: 600px) {
                body {
                    padding: 10px;
                }
                .container {
                    padding: 20px;
                }
                .header h1 {
                    font-size: 24px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img class="logo" src="https://res.cloudinary.com/doxdwenor/image/upload/v1745792110/SkillMartmail_tjswxr.png" alt="SkillMart Logo">
                <h1>🔒 Password Updated!</h1>
                <p class="subtitle">Your account security has been enhanced</p>
            </div>
            
            <div class="content">
                <div class="greeting">
                    <p>Hey <strong>${name}</strong>,</p>
                </div>
                
                <div class="success-message">
                    <p>Great news! Your password has been successfully updated and your account is now more secure.</p>
                </div>
                
                <div class="email-highlight">
                    📧 Account: ${email}
                </div>
                
                <div class="security-notice">
                    <h3>⚠️ Security Alert</h3>
                    <p>If you did not request this password change, please contact us immediately to secure your account. This could indicate unauthorized access to your account.</p>
                </div>
                
                <div class="security-tips">
                    <h3 style="margin-top: 0; color: #FFD60A; text-align: center;">🛡️ Security Tips</h3>
                    <div class="tip-item">
                        <span class="tip-icon">🔐</span>
                        <span>Use a strong, unique password</span>
                    </div>
                    <div class="tip-item">
                        <span class="tip-icon">🔄</span>
                        <span>Change passwords regularly</span>
                    </div>
                    <div class="tip-item">
                        <span class="tip-icon">📱</span>
                        <span>Enable two-factor authentication</span>
                    </div>
                    <div class="tip-item">
                        <span class="tip-icon">🚫</span>
                        <span>Never share your password</span>
                    </div>
                </div>
                
                <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="cta-button">
                        🏠 Go to Dashboard
                    </a>
                </div>
            </div>
            
            <div class="footer">
                <p>Your account security is our top priority!</p>
                <p>Need help? Contact us at <a href="mailto:info@skillmart.com" class="support-link">info@skillmart.com</a></p>
                <p style="margin-top: 15px; font-size: 12px; color: #838894;">This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>`;
};