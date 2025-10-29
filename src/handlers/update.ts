import prisma from "../db";

// Get all updates
export const getUpdates = async (req, res) => {
  const products = await prisma.product.findMany({
    where: {
      belongsToId: req.user.id,
    },
    include: {
      updates: true,
    },
  });

  const updates = products.reduce((allUpdates, product) => {
    return [...allUpdates, ...product.updates];
  }, []);

  res.json({ data: updates });
};

// Get a single update
export const getUpdate = async (req, res) => {
  const { id } = req.params;
  const update = await prisma.update.findUnique({
    where: {
      id,
    },
    include: {
      product: true,
    },
  });

  if (update?.product?.belongsToId !== req.user.id) {
    return res.status(401).json({ message: "Unauthorized to view this update" });
  }

  res.json({ data: update });
};

// Create an update
export const createUpdate = async (req, res) => {
  const { productId, title, body } = req.body;
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

  const updateToUpdate = await prisma.update.findUnique({
    where: {
      id,
    },
    include: {
      product: true,
    },
  });

  if (updateToUpdate?.product?.belongsToId !== req.user.id) {
    return res.status(401).json({ message: "Unauthorized to update this update" });
  }

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

  const updateToDelete = await prisma.update.findUnique({
    where: {
      id,
    },
    include: {
      product: true,
    },
  });

  if (updateToDelete?.product?.belongsToId !== req.user.id) {
    return res.status(401).json({ message: "Unauthorized to delete this update" });
  }

  await prisma.update.delete({
    where: {
      id,
    },
  });

  res.json({ message: "Update deleted successfully" });
};
