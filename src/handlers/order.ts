import prisma from "../db";

// Get all orders for a user
export const getOrders = async (req, res) => {
  const orders = await prisma.order.findMany({
    where: {
      userId: req.user.id,
    },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });

  res.json({ data: orders });
};

// Get a single order
export const getOrder = async (req, res) => {
  const { id } = req.params;
  const order = await prisma.order.findUnique({
    where: {
      id,
      userId: req.user.id,
    },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });

  res.json({ data: order });
};

// Create an order
export const createOrder = async (req, res) => {
  const { items } = req.body;

  const orderItemsData = [];
  let total = 0;

  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) {
      return res.status(404).json({ message: `Product with id ${item.productId} not found` });
    }

    let itemPrice = product.price;
    let variantId = item.variantId || null;

    if (variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId, productId: item.productId },
      });
      if (!variant) {
        return res.status(404).json({ message: `Variant with id ${variantId} not found for product ${item.productId}` });
      }
      itemPrice = variant.price;
    }

    total += itemPrice * item.quantity;
    orderItemsData.push({
      quantity: item.quantity,
      price: itemPrice,
      productId: item.productId,
      variantId: variantId,
    });
  }

  if (orderItemsData.length === 0) {
    return res.status(400).json({ message: "Order must contain at least one item." });
  }

  const order = await prisma.order.create({
    data: {
      userId: req.user.id,
      total,
      items: {
        create: orderItemsData,
      },
    },
    include: {
      items: true,
    },
  });

  res.json({ data: order });
};
