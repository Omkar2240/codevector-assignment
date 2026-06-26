import express from "express";
import getProduct from "../controllers/products.controller.js";

const router = express.Router();

router.get("/products", getProduct);

export default router;