import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const comparePassword = (password, hash) => {
  return bcrypt.compare(password, hash);
};

export const hashedPassword = (password) => {
  return bcrypt.hash(password, 10);
};
export const createJWT = (user) => {
  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET
  );
  return token;
};

export const protect = (req, res, next) => {
  const bearer = req.headers.authorization;
  if (!bearer) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const [, token] = bearer.split(" ");
  if (!token) {
    return res.status(401).json({ message: "invalid token" });
  }
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Not verified" });
  }
};
