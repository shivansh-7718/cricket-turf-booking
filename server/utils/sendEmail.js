import { Resend } from 'resend';

let resendClient = null;

const getResendClient = () => {
  if (!resendClient) {
    const key = process.env.RESEND_API_KEY;

    if (!key) {
      throw new Error('RESEND_API_KEY is missing at runtime');
    }

    resendClient = new Resend(key);
  }

  return resendClient;
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const resend = getResendClient();

    await resend.emails.send({
      from: 'Cricket Turf Booking <onboarding@resend.dev>',
      to,
      subject,
      html,
    });

    console.log('📧 Email queued successfully for:', to);
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
  }
};

export default sendEmail;
