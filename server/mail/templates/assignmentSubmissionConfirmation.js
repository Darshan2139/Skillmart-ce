const assignmentSubmissionConfirmation = (submission, studentName, assignment) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Assignment Submission Confirmation</title>
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
                background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
                color: #ffffff;
                padding: 25px;
                border-radius: 12px;
                text-align: center;
                margin-bottom: 30px;
                box-shadow: 0 4px 6px rgba(66, 153, 225, 0.3);
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 700;
            }
            .content {
                margin-bottom: 30px;
            }
            .submission-details {
                background-color: #f8fafc;
                padding: 20px;
                border-radius: 10px;
                border-left: 4px solid #4299e1;
                margin: 20px 0;
                border: 1px solid #e2e8f0;
            }
            .submission-details h3 {
                margin-top: 0;
                color: #2d3748;
                font-size: 18px;
                font-weight: 600;
            }
            .submission-details p {
                margin: 8px 0;
                color: #4a5568;
            }
            .success-banner {
                background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
                color: #ffffff;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                font-weight: bold;
                font-size: 18px;
                margin: 20px 0;
                box-shadow: 0 4px 6px rgba(72, 187, 120, 0.3);
            }
            .submission-info {
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                color: #2d3748;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
            }
            .submission-info h3 {
                color: #2d3748;
                font-size: 16px;
                font-weight: 600;
                margin-top: 0;
            }
            .submission-text {
                background-color: #ffffff;
                border: 1px solid #e2e8f0;
                color: #4a5568;
                padding: 15px;
                border-radius: 8px;
                margin: 10px 0;
                white-space: pre-wrap;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                max-height: 200px;
                overflow-y: auto;
            }
            .attachments {
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                color: #2d3748;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
            }
            .attachments h3 {
                color: #2d3748;
                font-size: 16px;
                font-weight: 600;
                margin-top: 0;
            }
            .attachment-item {
                background-color: #ffffff;
                border: 1px solid #e2e8f0;
                padding: 15px;
                border-radius: 8px;
                margin: 10px 0;
                display: flex;
                align-items: center;
                gap: 10px;
                transition: box-shadow 0.2s;
            }
            .attachment-item:hover {
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .attachment-icon {
                font-size: 24px;
            }
            .attachment-link {
                color: #4299e1;
                text-decoration: none;
                font-weight: 500;
            }
            .attachment-link:hover {
                text-decoration: underline;
                color: #3182ce;
            }
            .attempt-info {
                background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
                color: #ffffff;
                padding: 15px;
                border-radius: 10px;
                text-align: center;
                font-weight: bold;
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
            .no-attachments {
                color: #718096;
                font-style: italic;
                text-align: center;
                padding: 20px;
            }
            .content p {
                color: #4a5568;
                margin: 12px 0;
            }
            .content ul {
                color: #4a5568;
                margin: 12px 0;
                padding-left: 20px;
            }
            .content li {
                margin: 8px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Assignment Submitted Successfully!</h1>
            </div>
            
            <div class="content">
                <p>Dear <strong>${studentName}</strong>,</p>
                
                <div class="success-banner">
                    🎉 Your ${assignment.type.toLowerCase()} has been submitted successfully!
                </div>
                
                <div class="submission-details">
                    <h3>📝 Submission Details</h3>
                    <p><strong>Assignment:</strong> ${assignment.title}</p>
                    <p><strong>Course:</strong> ${assignment.course?.courseName || 'N/A'}</p>
                    <p><strong>Section:</strong> ${assignment.section?.sectionName || 'N/A'}</p>
                    <p><strong>Submitted on:</strong> ${new Date(submission.submittedAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</p>
                    <p><strong>Attempt Number:</strong> ${submission.attemptNumber}</p>
                    ${submission.score !== undefined ? `<p><strong>Score:</strong> ${submission.score}/${submission.maxScore}</p>` : ''}
                </div>
                
                ${submission.submissionText ? `
                <div class="submission-info">
                    <h3>📄 Your Submission Text:</h3>
                    <div class="submission-text">${submission.submissionText}</div>
                </div>
                ` : ''}
                
                <div class="attachments">
                    <h3>📎 Attached Files:</h3>
                    ${submission.attachments && submission.attachments.length > 0 ? 
                        submission.attachments.map(attachment => `
                            <div class="attachment-item">
                                <div class="attachment-icon">${attachment.fileName.toLowerCase().endsWith('.pdf') ? '📄' : '📝'}</div>
                                <div>
                                    <div class="attachment-link" href="${attachment.fileUrl}" target="_blank">
                                        ${attachment.fileName}
                                    </div>
                                    <div style="font-size: 12px; color: #AFB2BF; margin-top: 5px;">
                                        Click to view/download
                                    </div>
                                </div>
                            </div>
                        `).join('') : 
                        '<div class="no-attachments">No files were attached to this submission</div>'
                    }
                </div>
                
                <div class="attempt-info">
                    📊 Attempt ${submission.attemptNumber} of 3
                    ${submission.attemptNumber < 3 ? 
                        '<br><small>You can make ' + (3 - submission.attemptNumber) + ' more attempts if needed</small>' : 
                        '<br><small>This was your final attempt</small>'
                    }
                </div>
                
                <p><strong>What happens next?</strong></p>
                <ul>
                    <li>Your instructor will review your submission</li>
                    <li>You'll receive an email notification once it's graded</li>
                    <li>Check your dashboard for updates on your progress</li>
                </ul>
                
                <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/student/assignments" class="cta-button">
                        View All Assignments
                    </a>
                </div>
            </div>
            
            <div class="footer">
                <p>Best regards,<br>The SkillMart Team</p>
                <p>This is an automated confirmation email. Please do not reply to this email.</p>
                <p>If you have any questions, please contact your instructor or our support team.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = assignmentSubmissionConfirmation;
