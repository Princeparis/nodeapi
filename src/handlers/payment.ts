import axios from 'axios';
import crypto from 'crypto';
import prisma from '../db';
import eventEmitter from '../modules/events';

const paystack = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  },
});

export const initiatePayment = async (req, res) => {
  const { orderId } = req.body;
  const user = req.user;

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
      userId: user.id,
    },
  });

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  try {
    const response = await paystack.post('/transaction/initialize', {
      email: user.username, // Assuming username is the email
      amount: order.total * 100, // Paystack expects amount in kobo
      reference: `${order.id}-${Date.now()}`,
    });

    const { authorization_url, reference } = response.data.data;

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentReference: reference },
    });

    res.json({ data: { authorization_url } });
  } catch (error) {
    console.error('Paystack initialization error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to initialize payment' });
  }
};

export const handlePaystackWebhook = async (req, res) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const hash = crypto.createHmac('sha512', secret).update(req.body).digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.sendStatus(401);
  }

  const event = JSON.parse(req.body.toString());

  if (event.event === 'charge.success') {
    const { reference } = event.data;
    const order = await prisma.order.update({
      where: { paymentReference: reference },
      data: { status: 'PAID' },
    });

    eventEmitter.emit('order.paid', order);
  }

  res.sendStatus(200);
};
