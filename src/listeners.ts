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
    sendMessage('email', {
      to: user.email,
      template: 'orderConfirmation',
      data: {
        user,
        order,
      },
    });
  }
});

eventEmitter.on('user.created', (user) => {
  sendMessage('email', {
    to: user.email,
    template: 'welcome',
    data: {
      user,
    },
  });
});

eventEmitter.on('order.shipped', async (order) => {
  const user = await prisma.user.findUnique({
    where: {
      id: order.userId,
    },
  });

  if (user) {
    sendMessage('email', {
      to: user.email,
      template: 'orderShipped',
      data: {
        user,
        order,
      },
    });
  }
});

eventEmitter.on('order.delivered', async (order) => {
  const user = await prisma.user.findUnique({
    where: {
      id: order.userId,
    },
  });

  if (user) {
    sendMessage('email', {
      to: user.email,
      template: 'orderDelivered',
      data: {
        user,
        order,
      },
    });
  }
});

eventEmitter.on('order.paid', async (order) => {
  const user = await prisma.user.findUnique({
    where: {
      id: order.userId,
    },
  });

  if (user) {
    sendMessage('email', {
      to: user.email,
      template: 'orderPaid',
      data: {
        user,
        order,
      },
    });
  }
});

eventEmitter.on('user.forgotPassword', ({ user, resetToken }) => {
  sendMessage('email', {
    to: user.email,
    template: 'passwordReset',
    data: {
      user,
      resetToken,
    },
  });
});
