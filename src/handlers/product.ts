import prisma from "../db";

// Get all products with filtering, sorting, and pagination
export const getProducts = async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc', search = '', category = '' } = req.query;

  const where = {
    belongsToId: req.user.id,
    ...(search && { name: { contains: search, mode: 'insensitive' } }),
    ...(category && { category: { equals: category, mode: 'insensitive' } }),
  };

  try {
    const products = await prisma.product.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { [sortBy as string]: sortOrder },
    });

    const totalProducts = await prisma.product.count({ where });

    res.json({
      data: products,
      totalPages: Math.ceil(totalProducts / Number(limit)),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
};

// Get a single product
export const getProduct = async (req, res) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({
    where: {
      id_belongsToId: {
        id,
        belongsToId: req.user.id,
      },
    },
    include: {
      variants: true,
    },
  });

  res.json({ data: product });
};

// Create a product
export const createProduct = async (req, res) => {
  const { name, description, price, category } = req.body;
  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      category,
      belongsToId: req.user.id,
    },
  });

  res.json({ data: product });
};

// Update a product
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category } = req.body;
  const product = await prisma.product.update({
    where: {
      id_belongsToId: {
        id,
        belongsToId: req.user.id,
      },
    },
    data: {
      name,
      description,
      price,
      category,
    },
  });

  res.json({ data: product });
};

// Delete a product
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  await prisma.product.delete({
    where: {
      id_belongsToId: {
        id,
        belongsToId: req.user.id,
      },
    },
  });

  res.json({ message: 'Product deleted successfully' });
};

// Create a product variant
export const createProductVariant = async (req, res) => {
  const { productId } = req.params;

  const product = await prisma.product.findUnique({
    where: {
      id_belongsToId: {
        id: productId,
        belongsToId: req.user.id,
      },
    },
  });

  if (!product) {
    return res.status(404).json({ message: "Product not found or you don't have access to it" });
  }

  const { name, description, price, attributes } = req.body;
  const variant = await prisma.productVariant.create({
    data: {
      name,
      description,
      price,
      attributes,
      productId,
    },
  });

  res.json({ data: variant });
};

// Update a product variant
export const updateProductVariant = async (req, res) => {
  const { variantId } = req.params;

  const variantToUpdate = await prisma.productVariant.findUnique({
    where: {
      id: variantId,
    },
    include: {
      product: true,
    },
  });

  if (variantToUpdate?.product?.belongsToId !== req.user.id) {
    return res.status(401).json({ message: "Unauthorized to update this variant" });
  }

  const { name, description, price, attributes } = req.body;
  const variant = await prisma.productVariant.update({
    where: {
      id: variantId,
    },
    data: {
      name,
      description,
      price,
      attributes,
    },
  });

  res.json({ data: variant });
};

// Delete a product variant
export const deleteProductVariant = async (req, res) => {
  const { variantId } = req.params;

  const variantToDelete = await prisma.productVariant.findUnique({
    where: {
      id: variantId,
    },
    include: {
      product: true,
    },
  });

  if (variantToDelete?.product?.belongsToId !== req.user.id) {
    return res.status(401).json({ message: "Unauthorized to delete this variant" });
  }

  await prisma.productVariant.delete({
    where: {
      id: variantId,
    },
  });

  res.json({ message: 'Variant deleted successfully' });
};
