const assignmentDueReminder = (assignment, studentName) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Assignment Due Reminder</title>
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
                background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
                color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                margin-bottom: 30px;
                box-shadow: 0 4px 6px rgba(229, 62, 62, 0.3);
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 700;
            }
            .content {
                margin-bottom: 30px;
            }
            .assignment-details {
                background-color: #f8fafc;
                color: #2d3748;
                padding: 20px;
                border-radius: 10px;
                border-left: 4px solid #ed8936;
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
            .due-date {
                background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
                color: #ffffff;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                font-weight: bold;
                font-size: 18px;
                margin: 20px 0;
                box-shadow: 0 4px 6px rgba(237, 137, 54, 0.3);
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
            .warning {
                background-color: #fed7d7;
                border: 1px solid #feb2b2;
                color: #c53030;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .content p {
                color: #4a5568;
                margin: 12px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📚 Assignment Due Reminder</h1>
            </div>
            
            <div class="content">
                <p>Dear <strong>${studentName}</strong>,</p>
                
                <p>This is a friendly reminder that you have an assignment due very soon!</p>
                
                <div class="assignment-details">
                    <h3>${assignment.title}</h3>
                    <p><strong>Course:</strong> ${assignment.course?.courseName || 'N/A'}</p>
                    <p><strong>Section:</strong> ${assignment.section?.sectionName || 'N/A'}</p>
                    <p><strong>Type:</strong> ${assignment.type}</p>
                    <p><strong>Max Marks:</strong> ${assignment.maxMarks}</p>
                    <p><strong>Description:</strong> ${assignment.description}</p>
                </div>
                
                <div class="due-date">
                    ⏰ Due Date: ${new Date(assignment.dueDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
                
                <div class="warning">
                    <strong>⚠️ Important:</strong> This assignment is due in less than 24 hours. Please make sure to submit it on time to avoid any penalties.
                </div>
                
                <p>Please log in to your SkillMart account to complete and submit your assignment.</p>
                
                <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/student/assignments" class="cta-button">
                        View Assignment
                    </a>
                </div>
            </div>
            
            <div class="footer">
                <p>Best regards,<br>The SkillMart Team</p>
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = assignmentDueReminder;
