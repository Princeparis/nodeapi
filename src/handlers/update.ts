import prisma from "../db";

// Get all updates
export const getUpdates = async (req, res) => {
  const updates = await prisma.update.findMany();
  res.json({ data: updates });
};

// Get a single update
export const getUpdate = async (req, res) => {
  const { id } = req.params;
  const update = await prisma.update.findUnique({
    where: {
      id,
    },
  });

  res.json({ data: update });
};

// Create an update
export const createUpdate = async (req, res) => {
  const { productId, title, body } = req.body;
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const update = await prisma.update.create({
    data: {
      title,
      body,
      product: {
        connect: {
          id: product.id,
        },
      },
    },
  });

  res.json({ data: update });
};

// Update an update
export const updateUpdate = async (req, res) => {
  const { id } = req.params;
  const { title, body, status, version } = req.body;
  const updatedUpdate = await prisma.update.update({
    where: {
      id,
    },
    data: {
      title,
      body,
      status,
      version,
    },
  });

  res.json({ data: updatedUpdate });
};

// Delete an update
export const deleteUpdate = async (req, res) => {
  const { id } = req.params;
  await prisma.update.delete({
    where: {
      id,
    },
  });

  res.json({ message: "Update deleted successfully" });
};
