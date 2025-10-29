import express from "express";
import router from "./router";
import morgan from "morgan";
import cors from "cors";
import { protect } from "./modules/auth";
import {
  createNewUser,
  signIn,
  forgotPassword,
  resetPassword,
} from "./handlers/user";
import { handlePaystackWebhook } from "./handlers/payment";
import { body } from "express-validator";
import { handleInputErrors } from "./modules/middleware";

const app = express();

app.use(cors());
app.use(morgan("dev"));

app.post("/paystack/webhook", express.raw({ type: 'application/json' }), handlePaystackWebhook);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  console.log("Hello from Express 101");
  res.status(200);
  res.json({ message: "Hello man" });
});

app.use("/api", protect, router);

app.post(
  "/user",
  body("username").isString(),
  body("password").isString(),
  handleInputErrors,
  createNewUser
);
app.post(
  "/login",
  body("username").isString(),
  body("password").isString(),
  handleInputErrors,
  signIn
);

app.post(
  "/forgot-password",
  body("username").isString(),
  handleInputErrors,
  forgotPassword
);

app.post(
  "/reset-password",
  body("resetToken").isString(),
  body("password").isString(),
  handleInputErrors,
  resetPassword
);

export default app;
