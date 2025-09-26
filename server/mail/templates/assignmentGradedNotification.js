const assignmentGradedNotification = (assignment, studentName, grade, maxMarks, feedback, instructorName) => {
    const percentage = ((grade / maxMarks) * 100).toFixed(1);
    const isPassing = grade >= (maxMarks * 0.6); // 60% passing threshold
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Assignment Graded</title>
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
                background: ${isPassing ? 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' : 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)'};
                color: #ffffff;
                padding: 25px;
                border-radius: 12px;
                text-align: center;
                margin-bottom: 30px;
                box-shadow: 0 4px 6px rgba(72, 187, 120, 0.3);
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
                color: #4a5568;
            }
            .grade-display {
                background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
                color: #ffffff;
                padding: 30px;
                border-radius: 15px;
                text-align: center;
                margin: 25px 0;
                box-shadow: 0 4px 6px rgba(66, 153, 225, 0.3);
            }
            .grade-score {
                font-size: 48px;
                font-weight: 700;
                margin: 10px 0;
                color: #ffffff;
            }
            .grade-percentage {
                font-size: 24px;
                font-weight: 600;
                margin: 10px 0;
                color: #ffffff;
            }
            .grade-status {
                font-size: 18px;
                font-weight: 600;
                margin: 15px 0;
                color: #ffffff;
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
            .feedback-section {
                background-color: #f8fafc;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                border: 1px solid #e2e8f0;
            }
            .feedback-section h3 {
                margin-top: 0;
                color: #2d3748;
                font-size: 16px;
                font-weight: 600;
            }
            .feedback-content {
                background-color: #ffffff;
                padding: 15px;
                border-radius: 8px;
                margin: 10px 0;
                color: #4a5568;
                font-style: italic;
                border-left: 3px solid #4299e1;
                border: 1px solid #e2e8f0;
            }
            .instructor-info {
                background-color: #f8fafc;
                padding: 15px;
                border-radius: 8px;
                margin: 15px 0;
                text-align: center;
                color: #4a5568;
                border: 1px solid #e2e8f0;
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
            .performance-badge {
                display: inline-block;
                background: ${isPassing ? 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' : 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)'};
                color: #ffffff;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: 700;
                font-size: 14px;
                margin: 10px 5px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .next-steps {
                background-color: #f8fafc;
                color: #2d3748;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                border: 1px solid #e2e8f0;
            }
            .next-steps h3 {
                color: #2d3748;
                font-size: 16px;
                font-weight: 600;
                margin-top: 0;
            }
            .step-item {
                display: flex;
                align-items: center;
                margin: 10px 0;
                color: #4a5568;
            }
            .step-icon {
                margin-right: 10px;
                color: #4299e1;
                font-size: 18px;
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
                .grade-score {
                    font-size: 36px;
                }
                .grade-percentage {
                    font-size: 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img class="logo" src="https://res.cloudinary.com/doxdwenor/image/upload/v1745792110/SkillMartmail_tjswxr.png" alt="SkillMart Logo">
                <h1>${isPassing ? '🎉 Great Job!' : '📝 Keep Improving!'}</h1>
                <p class="subtitle">Your ${assignment.type.toLowerCase()} has been graded</p>
            </div>
            
            <div class="content">
                <div class="greeting">
                    <p>Dear <strong>${studentName}</strong>,</p>
                </div>
                
                <div class="grade-display">
                    <h3 style="margin-top: 0; color: #000814;">Your Grade</h3>
                    <div class="grade-score">${grade}/${maxMarks}</div>
                    <div class="grade-percentage">${percentage}%</div>
                    <div class="grade-status">
                        <span class="performance-badge">
                            ${isPassing ? '✅ Passed' : '📚 Needs Improvement'}
                        </span>
                    </div>
                </div>
                
                <div class="assignment-details">
                    <h3>📋 Assignment Details</h3>
                    <p><strong>Title:</strong> ${assignment.title}</p>
                    <p><strong>Course:</strong> ${assignment.course?.courseName || 'N/A'}</p>
                    <p><strong>Section:</strong> ${assignment.section?.sectionName || 'N/A'}</p>
                    <p><strong>Type:</strong> ${assignment.type}</p>
                    <p><strong>Max Marks:</strong> ${maxMarks}</p>
                    <p><strong>Your Score:</strong> ${grade}</p>
                </div>
                
                ${feedback ? `
                <div class="feedback-section">
                    <h3>💬 Instructor Feedback</h3>
                    <div class="feedback-content">
                        "${feedback}"
                    </div>
                </div>
                ` : ''}
                
                <div class="instructor-info">
                    <p style="margin: 0; color: #ECF5FF;">
                        <strong>Graded by:</strong> ${instructorName}
                    </p>
                    <p style="margin: 5px 0 0 0; color: #AFB2BF; font-size: 12px;">
                        Graded on ${new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
                
                <div class="next-steps">
                    <h3 style="margin-top: 0; color: #FFD60A; text-align: center;">
                        ${isPassing ? '🚀 What\'s Next?' : '📚 How to Improve?'}
                    </h3>
                    ${isPassing ? `
                    <div class="step-item">
                        <span class="step-icon">🎯</span>
                        <span>Continue with your excellent work!</span>
                    </div>
                    <div class="step-item">
                        <span class="step-icon">📚</span>
                        <span>Move on to the next assignment</span>
                    </div>
                    <div class="step-item">
                        <span class="step-icon">🏆</span>
                        <span>Keep up the great performance</span>
                    </div>
                    ` : `
                    <div class="step-item">
                        <span class="step-icon">📖</span>
                        <span>Review the assignment requirements</span>
                    </div>
                    <div class="step-item">
                        <span class="step-icon">💡</span>
                        <span>Consider the instructor feedback</span>
                    </div>
                    <div class="step-item">
                        <span class="step-icon">🔄</span>
                        <span>Apply learnings to future assignments</span>
                    </div>
                    `}
                </div>
                
                <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/student/assignments" class="cta-button">
                        📊 View All Assignments
                    </a>
                </div>
            </div>
            
            <div class="footer">
                <p>${isPassing ? 'Congratulations on your achievement!' : 'Every assignment is a learning opportunity!'}</p>
                <p>Need help? Contact us at <a href="mailto:info@skillmart.com" class="support-link">info@skillmart.com</a></p>
                <p style="margin-top: 15px; font-size: 12px; color: #838894;">This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = assignmentGradedNotification;
