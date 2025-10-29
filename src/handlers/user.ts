import crypto from "crypto";
import prisma from "../db";
import { comparePassword, createJWT, hashPassword } from "../modules/auth";
import eventEmitter from "../modules/events";

export const createNewUser = async (req, res) => {
  const user = await prisma.user.create({
    data: {
      username: req.body.username,
      password: await hashPassword(req.body.password),
    },
  });

  eventEmitter.emit("user.created", user);

  const token = createJWT(user);
  res.json({ token });
};

export const forgotPassword = async (req, res) => {
  const { username } = req.body;
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (!user) {
    // Still send a success-like response to prevent user enumeration
    return res.json({ message: "If a user with that email exists, a password reset link has been sent." });
  }

  const resetToken = crypto.randomBytes(20).toString("hex");
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      passwordResetToken,
      passwordResetExpires,
    },
  });

  eventEmitter.emit("user.forgotPassword", { user, resetToken });

  res.json({ message: "If a user with that email exists, a password reset link has been sent." });
};

export const resetPassword = async (req, res) => {
  const { resetToken, password } = req.body;

  const passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken,
      passwordResetExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  const hashedPassword = await hashPassword(password);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  res.json({ message: "Password reset successful" });
};

export const signIn = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      username: req.body.username,
    },
  });
  if (!user) {
    res.status(401);
    res.json({ message: "Invalid username or password" });
    return;
  }
  
  const isValid = await comparePassword(req.body.password, user.password);
  if (!isValid) {
    res.status(401);
    res.json({ message: "Invalid username or password" });
    return;
  }
  const token = createJWT(user);
  res.json({ token });
};
