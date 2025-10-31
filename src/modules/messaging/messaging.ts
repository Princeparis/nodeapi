import { sendEmail } from './emailProvider';

export const sendMessage = async (type, payload) => {
  switch (type) {
    case 'email':
      return sendEmail(payload);
    // In the future, we could add other providers here
    // case 'sms':
    //   return sendSms(payload);
    default:
      throw new Error('Unsupported message type');
  }
};
