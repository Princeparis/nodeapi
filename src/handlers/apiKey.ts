import crypto from 'crypto';
import prisma from '../db';
import { hashPassword } from '../modules/auth';

export const createApiKey = async (req, res) => {
  const { name } = req.body;
  const user = req.user;

  const apiKey = `sk_${crypto.randomBytes(32).toString('hex')}`;
  const keyHash = await hashPassword(apiKey);

  const newKey = await prisma.apiKey.create({
    data: {
      name,
      keyHash,
      userId: user.id,
    },
  });

  res.json({ data: { ...newKey, apiKey } }); // Return the plaintext key only once
};

export const getApiKeys = async (req, res) => {
  const user = req.user;
  const apiKeys = await prisma.apiKey.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      lastUsedAt: true,
    },
  });

  res.json({ data: apiKeys });
};

export const deleteApiKey = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  await prisma.apiKey.delete({
    where: {
      id,
      userId: user.id,
    },
  });

  res.json({ message: 'API key deleted successfully' });
};
