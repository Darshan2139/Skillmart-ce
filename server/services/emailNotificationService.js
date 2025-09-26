const mailSender = require('../utils/mailSender');
const assignmentDueReminder = require('../mail/templates/assignmentDueReminder');
const assignmentPendingReminder = require('../mail/templates/assignmentPendingReminder');
const assignmentGradedNotification = require('../mail/templates/assignmentGradedNotification');
const newAssignmentNotification = require('../mail/templates/newAssignmentNotification');
const assignmentSubmissionConfirmation = require('../mail/templates/assignmentSubmissionConfirmation');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const User = require('../models/User');

class EmailNotificationService {
    // Send pending assignment reminder emails (3 days, 1 week, 2 weeks before due)
    static async sendPendingReminders() {
        try {
            console.log('Starting pending assignment reminder check...');
            
            const now = new Date();
            const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
            const oneWeekFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
            const twoWeeksFromNow = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000));
            
            // Find assignments due in 3 days
            const assignments3Days = await Assignment.find({
                dueDate: {
                    $gte: new Date(threeDaysFromNow.getTime() - (12 * 60 * 60 * 1000)), // 12 hours before 3 days
                    $lte: new Date(threeDaysFromNow.getTime() + (12 * 60 * 60 * 1000))  // 12 hours after 3 days
                }
            })
            .populate('course', 'courseName studentsEnroled')
            .populate('section', 'sectionName')
            .populate('createdBy', 'firstName lastName');
            
            // Find assignments due in 1 week
            const assignments1Week = await Assignment.find({
                dueDate: {
                    $gte: new Date(oneWeekFromNow.getTime() - (12 * 60 * 60 * 1000)), // 12 hours before 1 week
                    $lte: new Date(oneWeekFromNow.getTime() + (12 * 60 * 60 * 1000))  // 12 hours after 1 week
                }
            })
            .populate('course', 'courseName studentsEnroled')
            .populate('section', 'sectionName')
            .populate('createdBy', 'firstName lastName');
            
            // Find assignments due in 2 weeks
            const assignments2Weeks = await Assignment.find({
                dueDate: {
                    $gte: new Date(twoWeeksFromNow.getTime() - (12 * 60 * 60 * 1000)), // 12 hours before 2 weeks
                    $lte: new Date(twoWeeksFromNow.getTime() + (12 * 60 * 60 * 1000))  // 12 hours after 2 weeks
                }
            })
            .populate('course', 'courseName studentsEnroled')
            .populate('section', 'sectionName')
            .populate('createdBy', 'firstName lastName');
            
            console.log(`Found ${assignments3Days.length} assignments due in 3 days`);
            console.log(`Found ${assignments1Week.length} assignments due in 1 week`);
            console.log(`Found ${assignments2Weeks.length} assignments due in 2 weeks`);
            
            // Send 3-day reminders
            await this.sendRemindersForAssignments(assignments3Days, 3);
            
            // Send 1-week reminders
            await this.sendRemindersForAssignments(assignments1Week, 7);
            
            // Send 2-week reminders
            await this.sendRemindersForAssignments(assignments2Weeks, 14);
            
            console.log('Pending assignment reminder check completed');
        } catch (error) {
            console.error('Error in sendPendingReminders:', error);
        }
    }
    
    // Helper method to send reminders for a list of assignments
    static async sendRemindersForAssignments(assignments, daysRemaining) {
        for (const assignment of assignments) {
            try {
                // Get all enrolled students for this course
                const course = await Course.findById(assignment.course._id).populate('studentsEnroled', 'email firstName lastName');
                
                if (!course || !course.studentsEnroled) {
                    console.log(`No students found for course ${assignment.course.courseName}`);
                    continue;
                }
                
                console.log(`Sending ${daysRemaining}-day reminders for assignment: ${assignment.title} to ${course.studentsEnroled.length} students`);
                
                // Send email to each enrolled student
                for (const student of course.studentsEnroled) {
                    try {
                        const emailBody = assignmentPendingReminder(assignment, student.firstName, daysRemaining);
                        await mailSender(
                            student.email,
                            `📝 ${assignment.type} Pending (${daysRemaining} days): ${assignment.title}`,
                            emailBody
                        );
                        console.log(`${daysRemaining}-day reminder sent to: ${student.email}`);
                    } catch (emailError) {
                        console.error(`Failed to send ${daysRemaining}-day reminder to ${student.email}:`, emailError.message);
                    }
                }
            } catch (assignmentError) {
                console.error(`Error processing assignment ${assignment.title}:`, assignmentError.message);
            }
        }
    }
    
    // Send due date reminder emails (24 hours before due)
    static async sendDueDateReminders() {
        try {
            console.log('Starting due date reminder check...');
            
            // Find assignments due in the next 24 hours
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(23, 59, 59, 999);
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const assignments = await Assignment.find({
                dueDate: {
                    $gte: today,
                    $lte: tomorrow
                }
            })
            .populate('course', 'courseName studentsEnroled')
            .populate('section', 'sectionName')
            .populate('createdBy', 'firstName lastName');
            
            console.log(`Found ${assignments.length} assignments due in next 24 hours`);
            
            for (const assignment of assignments) {
                try {
                    // Get all enrolled students for this course
                    const course = await Course.findById(assignment.course._id).populate('studentsEnroled', 'email firstName lastName');
                    
                    if (!course || !course.studentsEnroled) {
                        console.log(`No students found for course ${assignment.course.courseName}`);
                        continue;
                    }
                    
                    console.log(`Sending due reminders for assignment: ${assignment.title} to ${course.studentsEnroled.length} students`);
                    
                    // Send email to each enrolled student
                    for (const student of course.studentsEnroled) {
                        try {
                            const emailBody = assignmentDueReminder(assignment, student.firstName);
                            await mailSender(
                                student.email,
                                `⏰ Assignment Due Soon: ${assignment.title}`,
                                emailBody
                            );
                            console.log(`Due reminder sent to: ${student.email}`);
                        } catch (emailError) {
                            console.error(`Failed to send due reminder to ${student.email}:`, emailError.message);
                        }
                    }
                } catch (assignmentError) {
                    console.error(`Error processing assignment ${assignment.title}:`, assignmentError.message);
                }
            }
            
            console.log('Due date reminder check completed');
        } catch (error) {
            console.error('Error in sendDueDateReminders:', error);
        }
    }
    
    // Send assignment graded notification email
    static async sendAssignmentGradedNotification(submissionId, grade, feedback, instructorName) {
        try {
            console.log(`Sending graded notification for submission: ${submissionId}`);
            
            const AssignmentSubmission = require('../models/AssignmentSubmission');
            
            const submission = await AssignmentSubmission.findById(submissionId)
                .populate('assignment', 'title type maxMarks course section')
                .populate('student', 'email firstName lastName')
                .populate('course', 'courseName');
            
            if (!submission) {
                console.log('Submission not found');
                return;
            }
            
            if (!submission.student || !submission.student.email) {
                console.log('Student email not found for submission');
                return;
            }
            
            console.log(`Sending graded notification to: ${submission.student.email}`);
            
            const emailBody = assignmentGradedNotification(
                submission.assignment,
                submission.student.firstName,
                grade,
                submission.assignment.maxMarks,
                feedback,
                instructorName
            );
            
            await mailSender(
                submission.student.email,
                `📊 ${submission.assignment.type} Graded: ${submission.assignment.title}`,
                emailBody
            );
            
            console.log(`Graded notification sent to: ${submission.student.email}`);
            console.log('Assignment graded notification completed');
        } catch (error) {
            console.error('Error in sendAssignmentGradedNotification:', error);
        }
    }
    
    // Send new assignment notification emails
    static async sendNewAssignmentNotification(assignmentId) {
        try {
            console.log(`Sending new assignment notification for: ${assignmentId}`);
            
            const assignment = await Assignment.findById(assignmentId)
                .populate('course', 'courseName studentsEnroled')
                .populate('section', 'sectionName')
                .populate('createdBy', 'firstName lastName');
            
            if (!assignment) {
                console.log('Assignment not found');
                return;
            }
            
            // Get all enrolled students for this course
            const course = await Course.findById(assignment.course._id).populate('studentsEnroled', 'email firstName lastName');
            
            if (!course || !course.studentsEnroled) {
                console.log(`No students found for course ${assignment.course.courseName}`);
                return;
            }
            
            console.log(`Sending new assignment notification to ${course.studentsEnroled.length} students`);
            
            // Send email to each enrolled student
            for (const student of course.studentsEnroled) {
                try {
                    const emailBody = newAssignmentNotification(assignment, student.firstName);
                    await mailSender(
                        student.email,
                        `🎯 New ${assignment.type} Available: ${assignment.title}`,
                        emailBody
                    );
                    console.log(`New assignment notification sent to: ${student.email}`);
                } catch (emailError) {
                    console.error(`Failed to send new assignment notification to ${student.email}:`, emailError.message);
                }
            }
            
            console.log('New assignment notification completed');
        } catch (error) {
            console.error('Error in sendNewAssignmentNotification:', error);
        }
    }
    
    // Send assignment submission confirmation email
    static async sendAssignmentSubmissionConfirmation(submissionId) {
        try {
            console.log(`Sending submission confirmation for: ${submissionId}`);
            
            const AssignmentSubmission = require('../models/AssignmentSubmission');
            
            const submission = await AssignmentSubmission.findById(submissionId)
                .populate('assignment', 'title type maxMarks course section')
                .populate('student', 'email firstName lastName')
                .populate('course', 'courseName');
            
            if (!submission) {
                console.log('Submission not found');
                return;
            }
            
            if (!submission.student || !submission.student.email) {
                console.log('Student email not found for submission');
                return;
            }
            
            console.log(`Sending submission confirmation to: ${submission.student.email}`);
            
            const emailBody = assignmentSubmissionConfirmation(
                submission,
                submission.student.firstName,
                submission.assignment
            );
            
            await mailSender(
                submission.student.email,
                `✅ ${submission.assignment.type} Submitted: ${submission.assignment.title}`,
                emailBody
            );
            
            console.log(`Submission confirmation sent to: ${submission.student.email}`);
            console.log('Assignment submission confirmation completed');
        } catch (error) {
            console.error('Error in sendAssignmentSubmissionConfirmation:', error);
        }
    }
    
    // Schedule all email reminders
    static scheduleAllReminders() {
        // Run immediately on startup
        this.sendPendingReminders();
        this.sendDueDateReminders();
        
        // Schedule pending reminders to run daily at 9 AM
        const schedulePendingReminders = () => {
            const now = new Date();
            const nextRun = new Date(now);
            nextRun.setHours(9, 0, 0, 0);
            if (nextRun <= now) {
                nextRun.setDate(nextRun.getDate() + 1);
            }
            const timeUntilNext = nextRun.getTime() - now.getTime();
            
            setTimeout(() => {
                this.sendPendingReminders();
                // Schedule next run
                schedulePendingReminders();
            }, timeUntilNext);
        };
        
        // Schedule due date reminders to run every 6 hours
        setInterval(() => {
            this.sendDueDateReminders();
        }, 6 * 60 * 60 * 1000); // 6 hours in milliseconds
        
        // Start the pending reminders scheduler
        schedulePendingReminders();
        
        console.log('Email reminder scheduler started:');
        console.log('- Pending reminders: Daily at 9 AM');
        console.log('- Due date reminders: Every 6 hours');
    }
}

module.exports = EmailNotificationService;
