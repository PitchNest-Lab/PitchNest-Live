import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.ts";
import { createContentReport } from "../controllers/reportController.ts";

const router = Router();

router.post("/", authMiddleware, createContentReport);

export default router;
