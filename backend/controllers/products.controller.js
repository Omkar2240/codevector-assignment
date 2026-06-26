import getProducts from "../services/product.service.js";

async function getProduct(req, res) {
  try {
    const {
      category,
      limit = 20,
      cursorCreatedAt,
      cursorId,
      snapshotTime,
    } = req.query;

    const result = await getProducts({
      category,
      limit: Number(limit),
      cursorCreatedAt,
      cursorId,
      snapshotTime,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
}

export default getProduct;