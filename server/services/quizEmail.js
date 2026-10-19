import nodemailer from 'nodemailer';

const getTransporter = () => {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
};

export const notifyStudentsOfQuiz = async (students, quiz) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.error('Quiz email notifications were not sent: SMTP settings are missing.');
    return { configured: false, sent: 0, failed: students.length };
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const deadline = new Date(quiz.expiresAt).toLocaleString();
  const results = await Promise.allSettled(students.map(student => transporter.sendMail({
    from,
    to: student.email,
    subject: `New quiz: ${quiz.title}`,
    text: [
      `Hello ${student.name},`,
      '',
      `A new quiz, "${quiz.title}", is available on the Student Assignment Tracker.`,
      `You have three days to complete it. The deadline is ${deadline}.`,
      '',
      'Log in to your student dashboard to take the quiz.',
    ].join('\n'),
  })));

  const sent = results.filter(result => result.status === 'fulfilled').length;
  const failed = results.length - sent;
  if (failed) {
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Quiz notification failed for ${students[index].email}:`, result.reason);
      }
    });
  }

  return { configured: true, sent, failed };
};
