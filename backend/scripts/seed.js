import dotenv from "dotenv";
import { Pool } from "pg";
import { randomUUID } from "crypto";

dotenv.config();

const pool = new Pool(
  process.env.NODE_ENV === "production"
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      }
);

const TOTAL_PRODUCTS = 200_000;
const BATCH_SIZE = 5000;

const categories = [
  "Electronics",
  "Clothing",
  "Books",
  "Sports",
  "Home",
  "Beauty",
  "Toys",
  "Food",
  "Furniture",
  "Automotive",
];

function generateProducts(count) {
  const now = Date.now();

  return Array.from({ length: count }, (_, i) => {
    // random date in last 365 days
    const createdAtMs =
      now - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000);

    // updated_at >= created_at
    const updatedAtMs =
      createdAtMs +
      Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000);

    return {
      id: randomUUID(),
      name: `Product ${i + 1}`,
      category:
        categories[Math.floor(Math.random() * categories.length)],
      price: (Math.random() * 5000 + 100).toFixed(2),
      created_at: new Date(createdAtMs),
      updated_at: new Date(updatedAtMs),
    };
  });
}

async function insertBatch(products) {
  const values = [];
  const placeholders = [];

  products.forEach((product, index) => {
    const offset = index * 6;

    placeholders.push(
      `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`
    );

    values.push(
      product.id,
      product.name,
      product.category,
      product.price,
      product.created_at,
      product.updated_at
    );
  });

  const query = `
    INSERT INTO products
    (id, name, category, price, created_at, updated_at)
    VALUES ${placeholders.join(",")}
  `;

  await pool.query(query, values);
}

async function initializeDatabase() {
  try {
    console.log("Initializing database...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
          id UUID PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          price NUMERIC(10,2) NOT NULL,
          created_at TIMESTAMP NOT NULL,
          updated_at TIMESTAMP NOT NULL
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_products_feed
      ON products (
          category,
          created_at DESC,
          id DESC
      );
    `);

    console.log("✅ Database initialized");
  } catch (error) {
    console.error("Database initialization failed", error);
    throw error;
  }
}

async function seed() {
  try {
    console.time("Seeding");

    const init = await initializeDatabase();  //check if table exists otherwise create

    if(!init){
      console.log("Tables are already exists.")
    }

    console.log("Generating products...");

    const products = generateProducts(TOTAL_PRODUCTS);

    console.log(`Generated ${products.length} products`);

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);

      await insertBatch(batch);

      console.log(
        `Inserted ${i + BATCH_SIZE}/${TOTAL_PRODUCTS}`
      );
    }

    console.timeEnd("Seeding");

    console.log("✅ Seeding completed");
  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
  }
}

seed();