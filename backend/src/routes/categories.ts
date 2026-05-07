import { Router } from "express";
import { getAllCategories, getCategoryById } from '../controllers/categories.js'
import { asyncHandler } from "../middleware/asyncHandler.js";
const router = Router()

// GET /api/categories --> getAllCategories
router.get('/', asyncHandler(getAllCategories))

// GET /api/categories/:id --> getCategorieById
router.get('/:id', asyncHandler(getCategoryById))

export default router
