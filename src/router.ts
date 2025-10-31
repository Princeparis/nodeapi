import { Router } from 'express';
import { body } from 'express-validator';
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
} from './handlers/product';
import {
  createOrder,
  getOrder,
  getOrders,
  updateOrderStatus,
} from './handlers/order';
import {
  createUpdate,
  deleteUpdate,
  getUpdate,
  getUpdates,
  updateUpdate,
} from './handlers/update';
import {
  createUpdatePoint,
  deleteUpdatePoint,
  getUpdatePoint,
  getUpdatePoints,
  updateUpdatePoint,
} from './handlers/updatepoint';
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
} from './handlers/cart';
import { initiatePayment } from './handlers/payment';
import { createReview, getReviewsForProduct } from './handlers/review';
import { createApiKey, deleteApiKey, getApiKeys } from './handlers/apiKey';
import { handleInputErrors } from './modules/middleware';
import { adminOnly } from './modules/auth';
import { getCurrentUser, updateUser } from './handlers/user';

const router = Router();

// User
router.get('/user', getCurrentUser);
router.put(
  '/user',
  body('firstName').optional().isString(),
  body('lastName').optional().isString(),
  body('addresses').optional().isArray(),
  body('defaultAddress').optional().isString(),
  handleInputErrors,
  updateUser
);

// Product
router.get('/product', getProducts);
router.get('/product/:id', getProduct);
router.post(
  '/product',
  body('name').isString(),
  body('description').isString(),
  body('price').isFloat(),
  body('category').isString(),
  handleInputErrors,
  adminOnly,
  createProduct
);
router.put(
  '/product/:id',
  body('name').optional().isString(),
  body('description').optional().isString(),
  body('price').optional().isFloat(),
  body('category').optional().isString(),
  handleInputErrors,
  adminOnly,
  updateProduct
);
router.delete('/product/:id', adminOnly, deleteProduct);

// Product Variant
router.post(
  '/product/:productId/variant',
  body('name').isString(),
  body('description').isString(),
  body('price').isFloat(),
  body('attributes').optional().isObject(),
  handleInputErrors,
  adminOnly,
  createProductVariant
);
router.put(
  '/variant/:variantId',
  body('name').optional().isString(),
  body('description').optional().isString(),
  body('price').optional().isFloat(),
  body('attributes').optional().isObject(),
  handleInputErrors,
  adminOnly,
  updateProductVariant
);
router.delete('/variant/:variantId', adminOnly, deleteProductVariant);

// Order
router.get('/order', getOrders);
router.get('/order/:id', getOrder);
router.post(
  '/order',
  body('items').isArray(),
  body('items.*.productId').isString(),
  body('items.*.quantity').isInt(),
  handleInputErrors,
  createOrder
);
router.put(
  '/order/:id/status',
  body('status').isIn(['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  handleInputErrors,
  adminOnly,
  updateOrderStatus
);

// Update
router.get('/update', getUpdates);
router.get('/update/:id', getUpdate);
router.post(
  '/update',
  body('productId').isString(),
  body('title').isString(),
  body('body').isString(),
  handleInputErrors,
  adminOnly,
  createUpdate
);
router.put(
  '/update/:id',
  body('title').optional().isString(),
  body('body').optional().isString(),
  body('status').optional().isIn(['IN_PROGRESS', 'SHIPPED', 'DEPRECATED']),
  body('version').optional().isString(),
  handleInputErrors,
  adminOnly,
  updateUpdate
);
router.delete('/update/:id', adminOnly, deleteUpdate);

// Update Point
router.get('/updatepoint', getUpdatePoints);
router.get('/updatepoint/:id', getUpdatePoint);
router.post(
  '/updatepoint',
  body('updateId').isString(),
  body('name').isString(),
  body('description').isString(),
  handleInputErrors,
  adminOnly,
  createUpdatePoint
);
router.put(
  '/updatepoint/:id',
  body('name').optional().isString(),
  body('description').optional().isString(),
  handleInputErrors,
  adminOnly,
  updateUpdatePoint
);
router.delete('/updatepoint/:id', adminOnly, deleteUpdatePoint);

// Cart
router.get('/cart', getCart);
router.post(
  '/cart',
  body('productId').isString(),
  body('variantId').optional().isString(),
  body('quantity').isInt({ gt: 0 }),
  handleInputErrors,
  addItemToCart
);
router.put(
  '/cart/:itemId',
  body('quantity').isInt(),
  handleInputErrors,
  updateCartItem
);
router.delete('/cart/:itemId', removeItemFromCart);

// Payment
router.post('/payment/initiate', body('orderId').isString(), handleInputErrors, initiatePayment);

// Review
router.get('/product/:productId/reviews', getReviewsForProduct);
router.post(
  '/product/:productId/reviews',
  body('rating').isInt({ gt: 0, lt: 6 }),
  body('comment').isString(),
  handleInputErrors,
  createReview
);

// API Keys
router.get('/keys', getApiKeys);
router.post('/keys', body('name').isString(), handleInputErrors, createApiKey);
router.delete('/keys/:id', deleteApiKey);

export default router;
