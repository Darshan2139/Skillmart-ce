exports.paymentSuccessEmail = (name, amount, orderId, paymentId) => {
    return `<!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Confirmation</title>
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
              .payment-details {
                  background: linear-gradient(135deg, #FFD60A 0%, #E7C009 100%);
                  color: #000814;
                  padding: 25px;
                  border-radius: 15px;
                  margin: 25px 0;
                  text-align: center;
                  box-shadow: 0 10px 25px rgba(255, 214, 10, 0.3);
              }
              .amount {
                  font-size: 32px;
                  font-weight: 700;
                  margin: 15px 0;
                  color: #000814;
              }
              .details-grid {
                  background-color: #073B4C;
                  padding: 20px;
                  border-radius: 10px;
                  margin: 20px 0;
                  border-left: 4px solid #06D6A0;
              }
              .detail-row {
                  display: flex;
                  justify-content: space-between;
                  padding: 10px 0;
                  border-bottom: 1px solid #2D5A6A;
              }
              .detail-row:last-child {
                  border-bottom: none;
              }
              .detail-label {
                  font-weight: 600;
                  color: #ECF5FF;
              }
              .detail-value {
                  color: #FFD60A;
                  font-weight: 700;
                  font-family: 'Roboto Mono', monospace;
              }
              .success-message {
                  background-color: #161D29;
                  padding: 20px;
                  border-radius: 10px;
                  margin: 20px 0;
                  border: 1px solid #2C333F;
                  text-align: center;
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
              .next-steps {
                  background-color: #161D29;
                  padding: 20px;
                  border-radius: 10px;
                  margin: 20px 0;
                  border: 1px solid #2C333F;
              }
              .step-item {
                  display: flex;
                  align-items: center;
                  margin: 10px 0;
                  color: #DBDDEA;
              }
              .step-icon {
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
                  .amount {
                      font-size: 24px;
                  }
                  .detail-row {
                      flex-direction: column;
                      text-align: left;
                  }
                  .detail-value {
                      margin-top: 5px;
                  }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <img class="logo" src="https://res.cloudinary.com/doxdwenor/image/upload/v1745792110/SkillMartmail_tjswxr.png" alt="SkillMart Logo">
                  <h1>💳 Payment Successful!</h1>
                  <p class="subtitle">Your course enrollment is confirmed</p>
              </div>
              
              <div class="content">
                  <div class="greeting">
                      <p>Dear <strong>${name}</strong>,</p>
                  </div>
                  
                  <div class="payment-details">
                      <h3 style="margin-top: 0; color: #000814;">Payment Received</h3>
                      <div class="amount">₹${amount}</div>
                      <p style="margin: 0; color: #000814; font-weight: 600;">Thank you for your purchase!</p>
                  </div>
                  
                  <div class="details-grid">
                      <h3 style="margin-top: 0; color: #FFD60A; text-align: center;">📋 Transaction Details</h3>
                      <div class="detail-row">
                          <span class="detail-label">Payment ID:</span>
                          <span class="detail-value">${paymentId}</span>
                      </div>
                      <div class="detail-row">
                          <span class="detail-label">Order ID:</span>
                          <span class="detail-value">${orderId}</span>
                      </div>
                      <div class="detail-row">
                          <span class="detail-label">Amount:</span>
                          <span class="detail-value">₹${amount}</span>
                      </div>
                      <div class="detail-row">
                          <span class="detail-label">Status:</span>
                          <span class="detail-value" style="color: #06D6A0;">✅ Completed</span>
                      </div>
                  </div>
                  
                  <div class="success-message">
                      <p style="margin: 0; color: #F1F2FF; font-size: 18px; font-weight: 600;">🎉 Welcome to SkillMart!</p>
                      <p style="margin: 10px 0 0 0; color: #DBDDEA;">Your course access has been activated and you can now start learning immediately.</p>
                  </div>
                  
                  <div class="next-steps">
                      <h3 style="margin-top: 0; color: #FFD60A; text-align: center;">🚀 What's Next?</h3>
                      <div class="step-item">
                          <span class="step-icon">📚</span>
                          <span>Access your enrolled courses</span>
                      </div>
                      <div class="step-item">
                          <span class="step-icon">🎯</span>
                          <span>Start your learning journey</span>
                      </div>
                      <div class="step-item">
                          <span class="step-icon">📱</span>
                          <span>Download course materials</span>
                      </div>
                      <div class="step-item">
                          <span class="step-icon">🏆</span>
                          <span>Track your progress</span>
                      </div>
                  </div>
                  
                  <div style="text-align: center;">
                      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/enrolled-courses" class="cta-button">
                          🎓 Start Learning Now
                      </a>
                  </div>
              </div>
              
              <div class="footer">
                  <p>Ready to unlock your potential? Your courses are waiting!</p>
                  <p>Need help? Contact us at <a href="mailto:info@skillmart.com" class="support-link">info@skillmart.com</a></p>
                  <p style="margin-top: 15px; font-size: 12px; color: #838894;">This is an automated message. Please do not reply to this email.</p>
              </div>
          </div>
      </body>
      </html>`
  }