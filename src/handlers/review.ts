import prisma from '../db';

export const createReview = async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;
  const user = req.user;

  const review = await prisma.review.create({
    data: {
      rating,
      comment,
      userId: user.id,
      productId,
    },
  });

  res.json({ data: review });
};

export const getReviewsForProduct = async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const reviews = await prisma.review.findMany({
    where: {
      productId,
    },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
    include: {
      user: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  const totalReviews = await prisma.review.count({
    where: {
      productId,
    },
  });

  res.json({
    data: reviews,
    totalPages: Math.ceil(totalReviews / Number(limit)),
    currentPage: Number(page),
  });
};
