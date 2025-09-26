# Email Notification Setup Guide

This guide explains how to set up email notifications for assignments and quizzes in SkillMart.

## Features

✅ **Due Date Reminders**: Automatically sends email reminders to students when assignments/quizzes are due within 24 hours
✅ **New Assignment Notifications**: Sends email notifications to all enrolled students when new assignments/quizzes are created
✅ **Scheduled Reminders**: Runs every 6 hours to check for due assignments
✅ **Beautiful Email Templates**: Professional HTML email templates with responsive design

## Environment Variables Required

Add these to your `.env` file in the server directory:

```env
# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

## Email Service Setup

### For Gmail:
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password as `MAIL_PASS`

### For Other Email Services:
Update the `MAIL_HOST` and authentication settings in `server/utils/mailSender.js`:

```javascript
let transporter = nodemailer.createTransporter({
    host: 'your-smtp-host.com',
    port: 587, // or 465 for SSL
    secure: false, // true for SSL
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    }
});
```

## How It Works

### 1. New Assignment/Quiz Notifications
- Triggered when an instructor creates a new assignment or quiz
- Sends email to all students enrolled in the course
- Includes assignment details, due date, and instructions

### 2. Due Date Reminders
- Runs automatically every 6 hours
- Checks for assignments due within the next 24 hours
- Sends reminder emails to enrolled students
- Includes assignment details and urgent warning

### 3. Email Templates
- **Due Reminder**: Red-themed urgent reminder with warning
- **New Assignment**: Green-themed notification with instructions
- Responsive HTML design that works on all devices
- Professional branding with SkillMart colors

## Testing

### Manual Testing
You can manually trigger due date reminders using the admin endpoint:

```bash
POST http://localhost:4000/admin/send-due-reminders
```

### Test Email Templates
The email templates include:
- Assignment/Quiz details
- Course and section information
- Due dates with proper formatting
- Call-to-action buttons
- Professional styling

## File Structure

```
server/
├── services/
│   └── emailNotificationService.js    # Main email service
├── mail/
│   └── templates/
│       ├── assignmentDueReminder.js   # Due date reminder template
│       └── newAssignmentNotification.js # New assignment template
├── utils/
│   └── mailSender.js                  # Email sending utility
└── controllers/
    └── Assignment.js                  # Updated with email notifications
```

## Configuration

### Email Frequency
- Due date reminders: Every 6 hours
- New assignment notifications: Immediately when created

### Email Content
- Personalized with student names
- Includes all relevant assignment details
- Professional HTML formatting
- Mobile-responsive design

### Error Handling
- Email failures don't affect assignment creation
- Detailed logging for debugging
- Graceful error handling for individual email failures

## Troubleshooting

### Common Issues:

1. **Emails not sending**:
   - Check environment variables
   - Verify email service credentials
   - Check server logs for errors

2. **Students not receiving emails**:
   - Verify students are enrolled in the course
   - Check student email addresses are valid
   - Check spam folders

3. **Template issues**:
   - Verify HTML template syntax
   - Check for missing variables
   - Test with sample data

### Debug Mode:
Check server logs for detailed email sending information:
```
Starting due date reminder check...
Found 3 assignments due in next 24 hours
Sending reminders for assignment: Math Quiz to 25 students
Due reminder sent to: student@example.com
```

## Security Notes

- Email credentials are stored in environment variables
- App passwords are used instead of main account passwords
- Email sending is asynchronous and doesn't block the main application
- Failed emails are logged but don't affect system functionality

## Future Enhancements

- Email preferences for students
- Customizable reminder intervals
- Email templates customization
- Bulk email management
- Email delivery tracking
