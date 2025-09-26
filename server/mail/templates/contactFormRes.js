exports.contactUsEmail = (
    email,
    firstname,
    lastname,
    message,
    phoneNo,
    countrycode
  ) => {
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contact Form Confirmation</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #fff;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background: #001B1D;
            }
            .container {
                background: #001B1D;
                padding: 30px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                border: 2px solid #fff;
            }
            .header {
                background: #fff;
                color: #000;
                padding: 25px;
                border-radius: 12px;
                text-align: center;
                margin-bottom: 30px;
                border: 2px solid #fff;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
            }
            .header .subtitle {
                margin: 10px 0 0 0;
                font-size: 16px;
                opacity: 0.9;
            }
            .content {
                margin-bottom: 30px;
            }
            .greeting {
                font-size: 18px;
                margin-bottom: 20px;
                color: #2c3e50;
            }
            .message-box {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
                border-left: 4px solid #667eea;
                margin: 20px 0;
            }
            .details {
                background-color: #e8f4fd;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
            }
            .detail-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e0e0e0;
            }
            .detail-item:last-child {
                border-bottom: none;
            }
            .detail-label {
                font-weight: 600;
                color: #555;
                min-width: 120px;
            }
            .detail-value {
                color: #333;
                flex: 1;
                text-align: right;
            }
            .message-content {
                background-color: #fff;
                padding: 15px;
                border-radius: 8px;
                border: 1px solid #e0e0e0;
                margin-top: 10px;
                font-style: italic;
                color: #666;
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
            }
            .footer {
                text-align: center;
                color: #666;
                font-size: 14px;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
            }
            .support-link {
                color: #667eea;
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
                .detail-item {
                    flex-direction: column;
                    text-align: left;
                }
                .detail-value {
                    text-align: left;
                    margin-top: 5px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img class="logo" src="https://res.cloudinary.com/doxdwenor/image/upload/v1745792110/SkillMartmail_tjswxr.png" alt="SkillMart Logo">
                <h1>📧 Message Received!</h1>
                <p class="subtitle">We've got your message and we're on it!</p>
            </div>
            
            <div class="content">
                <div class="greeting">
                    <p>Dear <strong>${firstname} ${lastname}</strong>,</p>
                </div>
                
                <div class="message-box">
                    <p>Thank you for reaching out to us! We have successfully received your message and our team will review it shortly.</p>
                    <p>We typically respond within 24 hours, and we'll get back to you as soon as possible.</p>
                </div>
                
                <div class="details">
                    <h3 style="margin-top: 0; color: #667eea;">📋 Your Message Details</h3>
                    <div class="detail-item">
                        <span class="detail-label">Name:</span>
                        <span class="detail-value">${firstname} ${lastname}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">${email}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Phone:</span>
                        <span class="detail-value">${countrycode} ${phoneNo}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Message:</span>
                        <div class="message-content">${message}</div>
                    </div>
                </div>
                
                <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="cta-button">
                        Visit SkillMart
                    </a>
                </div>
            </div>
            
            <div class="footer">
                <p>We appreciate your interest in SkillMart and look forward to helping you!</p>
                <p>Need immediate assistance? Contact us at <a href="mailto:info@skillmart.com" class="support-link">info@skillmart.com</a></p>
                <p style="margin-top: 15px; font-size: 12px; color: #999;">This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>`
  }