import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);

const getTemplate = (template, payload) => {
  const templatePath = path.join(__dirname, 'templates', `${template}.html`);
  let html = fs.readFileSync(templatePath, 'utf-8');

  for (const key in payload) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, payload[key]);
  }

  switch (template) {
    case 'orderConfirmation':
      return {
        subject: 'Order Confirmation',
        html,
      };
    case 'welcome':
      return {
        subject: 'Welcome to our platform!',
        html,
      };
    case 'passwordReset':
      return {
        subject: 'Password Reset Request',
        html,
      };
    case 'orderPaid':
      return {
        subject: 'Payment Confirmation',
        html,
      };
    case 'orderShipped':
      return {
        subject: 'Your order has been shipped',
        html,
      };
    case 'orderDelivered':
      return {
        subject: 'Your order has been delivered',
        html,
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
