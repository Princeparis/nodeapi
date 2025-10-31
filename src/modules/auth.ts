import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "../db";
import crypto from 'crypto';

export const comparePassword = (password, hash) => {
  return bcrypt.compare(password, hash);
};

export const hashPassword = (password) => {
  return bcrypt.hash(password, 10);
};

export const createJWT = (user) => {
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET
  );
  return token;
};

export const protect = async (req, res, next) => {
  const bearer = req.headers.authorization;
  const apiKey = req.headers['x-api-key'];

  if (bearer) {
    const [, token] = bearer.split(" ");
    if (!token) {
      return res.status(401).json({ message: "Invalid token" });
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: payload.id },
      });

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized" });
    }
  }

  if (apiKey) {
    const apiKeys = await prisma.apiKey.findMany({
      include: { user: true },
    });

    for (const key of apiKeys) {
      const isValid = await comparePassword(apiKey, key.keyHash);
      if (isValid) {
        await prisma.apiKey.update({
          where: { id: key.id },
          data: { lastUsedAt: new Date() },
        });
        req.user = key.user;
        return next();
      }
    }

    return res.status(401).json({ message: "Invalid API key" });
  }

  return res.status(401).json({ message: "No authentication token or API key provided" });
};

export const adminOnly = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }
  next();
};
