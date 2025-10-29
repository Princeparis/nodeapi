import prisma from "../db";

// Get the user's cart
export const getCart = async (req, res) => {
  const cart = await prisma.cart.findUnique({
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

  res.json({ data: cart });
};

// Add an item to the cart
export const addItemToCart = async (req, res) => {
  const { productId, variantId, quantity } = req.body;

  let cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: req.user.id },
    });
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
      variantId,
    },
  });

  if (existingItem) {
    const updatedItem = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
    return res.json({ data: updatedItem });
  }

  const newItem = await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      variantId,
      quantity,
    },
  });

  res.json({ data: newItem });
};

// Update an item in the cart
export const updateCartItem = async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });

  if (item?.cart?.userId !== req.user.id) {
    return res.status(401).json({ message: "Unauthorized to update this item" });
  }

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
    return res.json({ message: "Item removed from cart" });
  }

  const updatedItem = await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });

  res.json({ data: updatedItem });
};

// Remove an item from the cart
export const removeItemFromCart = async (req, res) => {
  const { itemId } = req.params;

  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });

  if (item?.cart?.userId !== req.user.id) {
    return res.status(401).json({ message: "Unauthorized to remove this item" });
  }

  await prisma.cartItem.delete({ where: { id: itemId } });

  res.json({ message: "Item removed from cart" });
};
