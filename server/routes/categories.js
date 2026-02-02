import express from 'express';
import Category from '../models/Category.js';
import { auth, authorize } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all active categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/categories
// @desc    Create a category
// @access  Private (Admin)
router.post('/', auth, authorize('admin'), [
  body('name').trim().notEmpty().withMessage('Name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { name, icon, color } = req.body;
    
    let category = await Category.findOne({ name });
    if (category) return res.status(400).json({ success: false, message: 'Category already exists' });

    category = new Category({ name, icon, color });
    await category.save();

    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Remove a category (soft delete or hard delete)
// @access  Private (Admin)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    
    res.json({ success: true, message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
