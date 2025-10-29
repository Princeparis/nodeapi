import prisma from "../db";

// Get all update points
export const getUpdatePoints = async (req, res) => {
  const updates = await prisma.update.findMany({
    where: {
      product: {
        belongsToId: req.user.id,
      },
    },
    include: {
      updatePoints: true,
    },
  });

  const updatePoints = updates.reduce((allUpdatePoints, update) => {
    return [...allUpdatePoints, ...update.updatePoints];
  }, []);

  res.json({ data: updatePoints });
};

// Get a single update point
export const getUpdatePoint = async (req, res) => {
  const { id } = req.params;
  const updatePoint = await prisma.updatePoint.findUnique({
    where: {
      id,
    },
    include: {
      update: {
        include: {
          product: true,
        },
      },
    },
  });

  if (updatePoint?.update?.product?.belongsToId !== req.user.id) {
    return res.status(401).json({ message: "Unauthorized to view this update point" });
  }

  res.json({ data: updatePoint });
};

// Create an update point
export const createUpdatePoint = async (req, res) => {
  const { updateId, name, description } = req.body;
  const update = await prisma.update.findUnique({
    where: {
      id: updateId,
    },
    include: {
      product: true,
    },
  });

  if (update?.product?.belongsToId !== req.user.id) {
    return res.status(401).json({ message: "Unauthorized to create an update point for this update" });
  }

  const updatePoint = await prisma.updatePoint.create({
    data: {
      name,
      description,
      update: {
        connect: {
          id: update.id,
        },
      },
    },
  });

  res.json({ data: updatePoint });
};

// Update an update point
export const updateUpdatePoint = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const updatePointToUpdate = await prisma.updatePoint.findUnique({
    where: {
      id,
    },
    include: {
      update: {
        include: {
          product: true,
        },
      },
    },
  });

  if (updatePointToUpdate?.update?.product?.belongsToId !== req.user.id) {
    return res.status(401).json({ message: "Unauthorized to update this update point" });
  }

  const updatedUpdatePoint = await prisma.updatePoint.update({
    where: {
      id,
    },
    data: {
      name,
      description,
    },
  });

  res.json({ data: updatedUpdatePoint });
};

// Delete an update point
export const deleteUpdatePoint = async (req, res) => {
  const { id } = req.params;

  const updatePointToDelete = await prisma.updatePoint.findUnique({
    where: {
      id,
    },
    include: {
      update: {
        include: {
          product: true,
        },
      },
    },
  });

  if (updatePointToDelete?.update?.product?.belongsToId !== req.user.id) {
    return res.status(401).json({ message: "Unauthorized to delete this update point" });
  }

  await prisma.updatePoint.delete({
    where: {
      id,
    },
  });

  res.json({ message: "Update point deleted successfully" });
};
