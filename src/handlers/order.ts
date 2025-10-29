import prisma from "../db";
import eventEmitter from "../modules/events";

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

export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await prisma.order.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });

  if (status === 'SHIPPED') {
    eventEmitter.emit('order.shipped', order);
  } else if (status === 'DELIVERED') {
    eventEmitter.emit('order.delivered', order);
  }

  res.json({ data: order });
};

// Create an order
export const createOrder = async (req, res) => {
  const { items } = req.body;

  const productIds = items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    include: {
      variants: true,
    },
  });

  const orderItemsData = [];
  let total = 0;

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return res.status(404).json({ message: `Product with id ${item.productId} not found` });
    }

    let itemPrice = product.price;
    let variantId = item.variantId || null;

    if (variantId) {
      const variant = product.variants.find((v) => v.id === variantId);
      if (!variant) {
        return res.status(404).json({ message: `Variant with id ${variantId} not found for product ${item.productId}` });
      }
      if (variant.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for variant ${variant.name}` });
      }
      itemPrice = variant.price;
    } else {
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for product ${product.name}` });
      }
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

  eventEmitter.emit('order.created', order);

  res.json({ data: order });
};
