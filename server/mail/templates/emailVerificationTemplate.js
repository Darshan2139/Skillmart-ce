const otpTemplate = (otp) => {
	return `<!DOCTYPE html>
	<html>
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>OTP Verification Email</title>
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
				font-weight: 700;
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
				color: #F1F2FF;
			}
			.otp-container {
				background: #FFD60A;
				color: #000;
				padding: 30px;
				border-radius: 15px;
				text-align: center;
				margin: 30px 0;
				border: 2px solid #fff;
			}
			.otp-code {
				font-size: 36px;
				font-weight: 700;
				letter-spacing: 8px;
				margin: 20px 0;
				padding: 20px;
				background-color: #fff;
				border-radius: 10px;
				border: 2px solid #000;
			}
			.instructions {
				background-color: #fff;
				padding: 20px;
				border-radius: 10px;
				border-left: 4px solid #FFD60A;
				margin: 20px 0;
				color: #000;
			}
			.warning {
				background-color: #fff;
				border: 2px solid #FFD60A;
				color: #000;
				padding: 15px;
				border-radius: 8px;
				margin: 20px 0;
				text-align: center;
			}
			.cta-button {
				display: inline-block;
				background: #FFD60A;
				color: #000;
				padding: 15px 30px;
				text-decoration: none;
				border-radius: 25px;
				font-weight: 700;
				text-align: center;
				margin: 20px 0;
				transition: transform 0.2s;
				border: 2px solid #fff;
			}
			.cta-button:hover {
				transform: translateY(-2px);
				box-shadow: 0 8px 20px rgba(6, 214, 160, 0.4);
			}
			.footer {
				text-align: center;
				color: #fff;
				font-size: 14px;
				margin-top: 30px;
				padding-top: 20px;
				border-top: 2px solid #fff;
			}
			.support-link {
				color: #FFD60A;
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
			.timer {
				background-color: #161D29;
				padding: 15px;
				border-radius: 10px;
				margin: 20px 0;
				border: 1px solid #2C333F;
				text-align: center;
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
				.otp-code {
					font-size: 28px;
					letter-spacing: 4px;
				}
			}
		</style>
	</head>
	<body>
		<div class="container">
			<div class="header">
				<img class="logo" src="https://res.cloudinary.com/doxdwenor/image/upload/v1745792110/SkillMartmail_tjswxr.png" alt="SkillMart Logo">
				<h1>🔐 Verify Your Account</h1>
				<p class="subtitle">Complete your SkillMart registration</p>
			</div>
			
			<div class="content">
				<div class="greeting">
					<p>Dear User,</p>
				</div>
				
				<div class="instructions">
					<p>Thank you for registering with SkillMart! To complete your registration and secure your account, please use the One-Time Password (OTP) below to verify your email address.</p>
				</div>
				
				<div class="otp-container">
					<h3 style="margin-top: 0; color: #000814;">Your Verification Code</h3>
					<div class="otp-code">${otp}</div>
					<p style="margin: 0; color: #000814; font-weight: 600;">Enter this code in the verification form</p>
				</div>
				
				<div class="timer">
					<p style="margin: 0; color: #FFD60A; font-weight: 600;">⏰ This code expires in 5 minutes</p>
				</div>
				
				<div class="warning">
					<strong>⚠️ Security Notice:</strong> If you did not request this verification, please ignore this email and consider changing your password immediately.
				</div>
				
				<div style="text-align: center;">
					<a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email" class="cta-button">
						✅ Complete Verification
					</a>
				</div>
			</div>
			
			<div class="footer">
				<p>Once verified, you'll have full access to all SkillMart features!</p>
				<p>Need help? Contact us at <a href="mailto:skillmart.ce@gmail.com" class="support-link">skillmart.ce@gmail.com</a></p>
				<p style="margin-top: 15px; font-size: 12px; color: #838894;">This is an automated message. Please do not reply to this email.</p>
			</div>
		</div>
	</body>
	</html>`;
};
module.exports = otpTemplate;