import { Router } from "express";
import { body } from "express-validator";
import { createOrder, getOrder, getOrders } from "./handlers/order";
import { handleInputErrors } from "./modules/middleware";

const router = Router();

//router for product
router.get("/product", (req, res) => {
  res.json({ message: "hello" });
});
router.get("/product/:id", () => {});
router.put("/product/:id", () => {});
router.delete("/product/:id", () => {});
router.post("/product", () => {});

//router for updates
router.get("/update", () => {});
router.get("/update/:id", () => {});
router.put("/update/:id", () => {});
router.delete("/update/:id", () => {});
router.post("/update", () => {});

// router for update points
router.get("/updatepoint", () => {});
router.get("/updatepoint/:id", () => {});
router.put("/updatepoint/:id", () => {});
router.delete("/updatepoint/:id", () => {});
router.post("/updatepoint", () => {});

// Order
router.get('/order', getOrders);
router.get('/order/:id', getOrder);
router.post(
  '/order',
  body('items').isArray(),
  body('items.*.productId').isString(),
  body('items.*.quantity').isInt(),
  body('items.*.price').isFloat(),
  handleInputErrors,
  createOrder
);

export default router;
