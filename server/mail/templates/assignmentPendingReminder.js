const assignmentPendingReminder = (assignment, studentName, daysRemaining) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Assignment Pending Reminder</title>
        <style>
            body {
                font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #2d3748;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background: #f7fafc;
            }
            .container {
                background: #ffffff;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                border: 1px solid #e2e8f0;
            }
            .header {
                background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
                color: #ffffff;
                padding: 25px;
                border-radius: 12px;
                text-align: center;
                margin-bottom: 30px;
                box-shadow: 0 4px 6px rgba(237, 137, 54, 0.3);
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
                color: #4a5568;
            }
            .assignment-details {
                background-color: #f8fafc;
                padding: 20px;
                border-radius: 10px;
                border-left: 4px solid #4299e1;
                margin: 20px 0;
                border: 1px solid #e2e8f0;
            }
            .assignment-details h3 {
                margin-top: 0;
                color: #2d3748;
                font-size: 18px;
                font-weight: 600;
            }
            .assignment-details p {
                margin: 8px 0;
                color: #4a5568;
            }
            .time-remaining {
                background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
                color: #ffffff;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                margin: 20px 0;
                font-weight: 600;
                font-size: 18px;
                box-shadow: 0 4px 6px rgba(66, 153, 225, 0.3);
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
                color: #ffffff;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                text-align: center;
                margin: 20px 0;
                transition: all 0.2s;
                box-shadow: 0 4px 6px rgba(66, 153, 225, 0.3);
            }
            .cta-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 8px rgba(66, 153, 225, 0.4);
                color: #ffffff;
            }
            .footer {
                text-align: center;
                color: #718096;
                font-size: 14px;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
            }
            .support-link {
                color: #4299e1;
                text-decoration: none;
                font-weight: 600;
            }
            .support-link:hover {
                text-decoration: underline;
                color: #3182ce;
            }
            .logo {
                max-width: 150px;
                margin-bottom: 15px;
            }
            .reminder-note {
                background-color: #f8fafc;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                border: 1px solid #e2e8f0;
                text-align: center;
            }
            .reminder-note p {
                color: #4a5568;
                margin: 0;
            }
            .days-badge {
                display: inline-block;
                background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: 700;
                font-size: 14px;
                margin: 0 5px;
                box-shadow: 0 2px 4px rgba(229, 62, 62, 0.3);
            }
            .content p {
                color: #4a5568;
                margin: 12px 0;
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
                <h1>📝 Assignment Pending</h1>
                <p class="subtitle">Don't forget to complete your ${assignment.type.toLowerCase()}!</p>
            </div>
            
            <div class="content">
                <div class="greeting">
                    <p>Dear <strong>${studentName}</strong>,</p>
                </div>
                
                <div class="assignment-details">
                    <h3>${assignment.title}</h3>
                    <p><strong>Course:</strong> ${assignment.course?.courseName || 'N/A'}</p>
                    <p><strong>Section:</strong> ${assignment.section?.sectionName || 'N/A'}</p>
                    <p><strong>Type:</strong> ${assignment.type}</p>
                    <p><strong>Max Marks:</strong> ${assignment.maxMarks}</p>
                    <p><strong>Description:</strong> ${assignment.description}</p>
                </div>
                
                <div class="time-remaining">
                    <span class="days-badge">${daysRemaining} ${daysRemaining === 1 ? 'Day' : 'Days'}</span> remaining until due date
                    <br>
                    <strong>Due: ${new Date(assignment.dueDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</strong>
                </div>
                
                <div class="reminder-note">
                    <p style="margin: 0; color: #DBDDEA;">⏰ This is a friendly reminder to complete your ${assignment.type.toLowerCase()} before the deadline.</p>
                    <p style="margin: 10px 0 0 0; color: #AFB2BF;">Don't wait until the last minute - start working on it now!</p>
                </div>
                
                <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/student/assignments" class="cta-button">
                        📚 View Assignment
                    </a>
                </div>
            </div>
            
            <div class="footer">
                <p>Stay on track with your learning goals!</p>
                <p>Need help? Contact us at <a href="mailto:info@skillmart.com" class="support-link">info@skillmart.com</a></p>
                <p style="margin-top: 15px; font-size: 12px; color: #838894;">This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = assignmentPendingReminder;
