import express from "express";
import getProduct from "../controllers/products.controller.js";
import { postSeed } from "../controllers/seed.controller.js";

const router = express.Router();

router.get("/products", getProduct);
router.post("/seed", postSeed);

export default router;