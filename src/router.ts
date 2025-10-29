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
import { handleInputErrors } from './modules/middleware';
import { getCurrentUser, updateUser } from './handlers/user';

const router = Router();

// User
router.get('/user', getCurrentUser);
router.put(
  '/user',
  body('firstName').optional().isString(),
  body('lastName').optional().isString(),
  body('address').optional().isString(),
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
  createProduct
);
router.put(
  '/product/:id',
  body('name').optional().isString(),
  body('description').optional().isString(),
  body('price').optional().isFloat(),
  body('category').optional().isString(),
  handleInputErrors,
  updateProduct
);
router.delete('/product/:id', deleteProduct);

// Product Variant
router.post(
  '/product/:productId/variant',
  body('name').isString(),
  body('description').isString(),
  body('price').isFloat(),
  handleInputErrors,
  createProductVariant
);
router.put(
  '/variant/:variantId',
  body('name').optional().isString(),
  body('description').optional().isString(),
  body('price').optional().isFloat(),
  handleInputErrors,
  updateProductVariant
);
router.delete('/variant/:variantId', deleteProductVariant);

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

// Update
router.get('/update', getUpdates);
router.get('/update/:id', getUpdate);
router.post(
  '/update',
  body('productId').isString(),
  body('title').isString(),
  body('body').isString(),
  handleInputErrors,
  createUpdate
);
router.put(
  '/update/:id',
  body('title').optional().isString(),
  body('body').optional().isString(),
  body('status').optional().isIn(['IN_PROGRESS', 'SHIPPED', 'DEPRECATED']),
  body('version').optional().isString(),
  handleInputErrors,
  updateUpdate
);
router.delete('/update/:id', deleteUpdate);

// Update Point
router.get('/updatepoint', getUpdatePoints);
router.get('/updatepoint/:id', getUpdatePoint);
router.post(
  '/updatepoint',
  body('updateId').isString(),
  body('name').isString(),
  body('description').isString(),
  handleInputErrors,
  createUpdatePoint
);
router.put(
  '/updatepoint/:id',
  body('name').optional().isString(),
  body('description').optional().isString(),
  handleInputErrors,
  updateUpdatePoint
);
router.delete('/updatepoint/:id', deleteUpdatePoint);

export default router;
