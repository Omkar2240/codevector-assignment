// services/products.service.js

import pool from "../db/index.js";

async function getProducts({
  category,
  limit,
  cursorCreatedAt,
  cursorId,
  snapshotTime,
}) {
  // first request gets snapshot time
  const effectiveSnapshot = snapshotTime || new Date().toISOString();

  const values = [];
  const conditions = [];

  // snapshot condition
  values.push(effectiveSnapshot);

  conditions.push(
    `created_at <= $${values.length}`
  );

  // category filter
  if (category) {
    values.push(category);

    conditions.push(
      `category = $${values.length}`
    );
  }

  // cursor pagination
  if (cursorCreatedAt && cursorId) {
    values.push(cursorCreatedAt);
    values.push(cursorId);

    conditions.push(`
      (created_at, id) < ($${values.length - 1}, $${values.length})
    `);
  }

  values.push(limit);

  const query = `
      SELECT
          id,
          name,
          category,
          price,
          created_at,
          updated_at
      FROM products
      WHERE ${conditions.join(" AND ")}
      ORDER BY created_at DESC, id DESC
      LIMIT $${values.length}
  `;

  const { rows } = await pool.query(query, values);

  let nextCursor = null;

  if (rows.length > 0) {
    const last = rows[rows.length - 1];

    nextCursor = {
      createdAt: last.created_at,
      id: last.id,
    };
  }

  return {
    success: true,
    snapshotTime: effectiveSnapshot,
    nextCursor,
    count: rows.length,
    products: rows,
  };
}

export default getProducts;