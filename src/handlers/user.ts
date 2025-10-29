import crypto from "crypto";
import prisma from "../db";
import { comparePassword, createJWT, hashPassword } from "../modules/auth";
import eventEmitter from "../modules/events";

export const createNewUser = async (req, res) => {
  const user = await prisma.user.create({
    data: {
      username: req.body.username,
      email: req.body.email,
      password: await hashPassword(req.body.password),
      addresses: [],
    },
  });

  eventEmitter.emit("user.created", user);

  const token = createJWT(user);
  res.json({ token });
};

export const signIn = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      username: req.body.username,
    },
  });

  const invalidCredentialsResponse = () => {
    res.status(401);
    res.json({ message: "Invalid username or password" });
  };

  if (!user) {
    // Perform a dummy password comparison to prevent timing attacks
    await comparePassword("dummyPassword", "dummyHash");
    return invalidCredentialsResponse();
  }

  const isValid = await comparePassword(req.body.password, user.password);
  if (!isValid) {
    return invalidCredentialsResponse();
  }
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

export const getCurrentUser = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      addresses: true,
      defaultAddress: true,
    },
  });

  res.json({ data: user });
};

export const updateUser = async (req, res) => {
  const { firstName, lastName, addresses, defaultAddress } = req.body;
  const user = await prisma.user.update({
    where: {
      id: req.user.id,
    },
    data: {
      firstName,
      lastName,
      addresses,
      defaultAddress,
    },
  });

  res.json({ data: user });
};
