import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const getTemplate = (template, payload) => {
  switch (template) {
    case 'orderConfirmation':
      return {
        subject: 'Order Confirmation',
        html: `<p>Thank you for your order, ${payload.user.firstName}!</p><p>Your order ID is ${payload.order.id}.</p>`,
      };
    case 'welcome':
      return {
        subject: 'Welcome to our platform!',
        html: `<p>Hi ${payload.user.firstName},</p><p>Welcome! We are excited to have you on board.</p>`,
      };
    case 'passwordReset':
      return {
        subject: 'Password Reset Request',
        html: `<p>Hi ${payload.user.firstName},</p><p>You requested a password reset. Here is your reset token: ${payload.resetToken}</p><p>If you did not request this, please ignore this email.</p>`,
      };
    case 'orderPaid':
      return {
        subject: 'Payment Confirmation',
        html: `<p>Hi ${payload.user.firstName},</p><p>Your payment for order ${payload.order.id} has been received.</p>`,
      };
    case 'orderShipped':
      return {
        subject: 'Your order has been shipped',
        html: `<p>Hi ${payload.user.firstName},</p><p>Your order ${payload.order.id} has been shipped.</p>`,
      };
    case 'orderDelivered':
      return {
        subject: 'Your order has been delivered',
        html: `<p>Hi ${payload.user.firstName},</p><p>Your order ${payload.order.id} has been delivered.</p>`,
      };
    default:
      throw new Error('Unsupported email template');
  }
};

export const sendEmail = async (payload) => {
  const { to, template, data } = payload;
  const { subject, html } = getTemplate(template, data);

  try {
    const response = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html,
    });
    return response;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};
