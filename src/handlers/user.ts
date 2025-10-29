import prisma from "../db";
import { comparePassword, createJWT, hashPassword } from "../modules/auth";

export const createNewUser = async (req, res) => {
  const user = await prisma.user.create({
    data: {
      username: req.body.username,
    password: await hashPassword(req.body.password),
    },
  });
  const token = createJWT(user);
  res.json({ token });
};

// Get the current user's profile
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
      address: true,
    },
  });

  res.json({ data: user });
};

// Update the current user's profile
export const updateUser = async (req, res) => {
  const { firstName, lastName, address } = req.body;
  const user = await prisma.user.update({
    where: {
      id: req.user.id,
    },
    data: {
      firstName,
      lastName,
      address,
    },
  });

  res.json({ data: user });
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
