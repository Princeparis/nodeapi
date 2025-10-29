import eventEmitter from './modules/events';
import { sendMessage } from './modules/messaging/messaging';
import prisma from './db';

eventEmitter.on('order.created', async (order) => {
  const user = await prisma.user.findUnique({
    where: {
      id: order.userId,
    },
  });

  if (user) {
    // TODO: Replace user.username with a dedicated email field
    sendMessage('email', {
      to: user.username,
      template: 'orderConfirmation',
      data: {
        user,
        order,
      },
    });
  }
});

eventEmitter.on('user.created', (user) => {
  // TODO: Replace user.username with a dedicated email field
  sendMessage('email', {
    to: user.username,
    template: 'welcome',
    data: {
      user,
    },
  });
});

eventEmitter.on('order.paid', async (order) => {
  const user = await prisma.user.findUnique({
    where: {
      id: order.userId,
    },
  });

  if (user) {
    // TODO: Replace user.username with a dedicated email field
    sendMessage('email', {
      to: user.username,
      template: 'orderPaid',
      data: {
        user,
        order,
      },
    });
  }
});

eventEmitter.on('user.forgotPassword', ({ user, resetToken }) => {
  // TODO: Replace user.username with a dedicated email field
  sendMessage('email', {
    to: user.username,
    template: 'passwordReset',
    data: {
      user,
      resetToken,
    },
  });
});
