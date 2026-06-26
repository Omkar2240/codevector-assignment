import seed from "../scripts/seed.js";

async function postSeed(req, res) {
  try {
    let { count } = req.body;
    if (count === undefined || count === null) {
      count = req.query.count;
    }

    const parsedCount = parseInt(count, 10);
    if (isNaN(parsedCount) || parsedCount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid count. Count must be a positive integer.",
      });
    }

    console.log(`API Seeding: generating and inserting ${parsedCount} products...`);
    await seed(parsedCount, false);

    return res.status(200).json({
      success: true,
      message: `Successfully seeded ${parsedCount} products.`,
      count: parsedCount,
    });
  } catch (error) {
    console.error("Seeding API error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to seed products",
      error: error.message,
    });
  }
}

export { postSeed };