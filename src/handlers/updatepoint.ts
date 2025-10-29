import prisma from "../db";

// Get all update points
export const getUpdatePoints = async (req, res) => {
  const updatePoints = await prisma.updatePoint.findMany();
  res.json({ data: updatePoints });
};

// Get a single update point
export const getUpdatePoint = async (req, res) => {
  const { id } = req.params;
  const updatePoint = await prisma.updatePoint.findUnique({
    where: {
      id,
    },
  });

  res.json({ data: updatePoint });
};

// Create an update point
export const createUpdatePoint = async (req, res) => {
  const { updateId, name, description } = req.body;
  const update = await prisma.update.findUnique({
    where: {
      id: updateId,
    },
  });

  if (!update) {
    return res.status(404).json({ message: "Update not found" });
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
  await prisma.updatePoint.delete({
    where: {
      id,
    },
  });

  res.json({ message: "Update point deleted successfully" });
};
