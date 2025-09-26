exports.courseEnrollmentEmail = (courseName, name) => {
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Course Registration Confirmation</title>
        <style>
            body {
                font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
                background: #FFD60A;
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
            .course-highlight {
                background: linear-gradient(135deg, #06D6A0 0%, #05BF8E 100%);
                color: #000814;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                text-align: center;
                font-weight: 600;
                font-size: 18px;
                box-shadow: 0 5px 15px rgba(6, 214, 160, 0.2);
            }
            .welcome-message {
                background-color: #073B4C;
                padding: 20px;
                border-radius: 10px;
                border-left: 4px solid #06D6A0;
                margin: 20px 0;
                color: #ECF5FF;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #FFD60A 0%, #E7C009 100%);
                color: #000814;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 25px;
                font-weight: 700;
                text-align: center;
                margin: 20px 0;
                transition: transform 0.2s;
                box-shadow: 0 5px 15px rgba(255, 214, 10, 0.3);
            }
            .cta-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(255, 214, 10, 0.4);
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
            .features {
                background-color: #161D29;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                border: 1px solid #2C333F;
            }
            .feature-item {
                display: flex;
                align-items: center;
                margin: 10px 0;
                color: #DBDDEA;
            }
            .feature-icon {
                margin-right: 10px;
                color: #06D6A0;
                font-size: 18px;
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
                <h1>🎉 Welcome to SkillMart!</h1>
                <p class="subtitle">Your learning journey starts now!</p>
            </div>
            
            <div class="content">
                <div class="greeting">
                    <p>Dear <strong>${name}</strong>,</p>
                </div>
                
                <div class="course-highlight">
                    📚 Successfully enrolled in<br>
                    <strong>"${courseName}"</strong>
                </div>
                
                <div class="welcome-message">
                    <p>Congratulations! You have successfully registered for the course and we are absolutely thrilled to have you as part of our learning community!</p>
                    <p>Get ready to embark on an exciting educational journey that will enhance your skills and knowledge.</p>
                </div>
                
                <div class="features">
                    <h3 style="margin-top: 0; color: #FFD60A; text-align: center;">🚀 What's Next?</h3>
                    <div class="feature-item">
                        <span class="feature-icon">📖</span>
                        <span>Access comprehensive course materials</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">🎯</span>
                        <span>Complete interactive assignments and quizzes</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">🏆</span>
                        <span>Earn certificates upon completion</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">👥</span>
                        <span>Connect with fellow learners</span>
                    </div>
                </div>
                
                <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/enrolled-courses" class="cta-button">
                        🚀 Start Learning Now
                    </a>
                </div>
            </div>
            
            <div class="footer">
                <p>Ready to transform your skills? Your dashboard is waiting!</p>
                <p>Need help? Contact us at <a href="mailto:info@skillmart.com" class="support-link">info@skillmart.com</a></p>
                <p style="margin-top: 15px; font-size: 12px; color: #838894;">This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>`;
  };