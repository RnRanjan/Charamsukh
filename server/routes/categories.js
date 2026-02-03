import express from 'express';
import mongoose from 'mongoose';
import Category from '../models/Category.js';
import { auth, authorize } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all active categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Check database connectivity
    if (mongoose.connection.readyState !== 1) {
      console.log('❌ Database not connected for categories');
      return res.status(503).json({
        success: false,
        message: 'Database not connected'
      });
    }
    
    console.log('🏷️ Fetching all active categories...');
    const categories = await Category.find({ isActive: true });
    console.log(`🏷️ Fetched ${categories.length} active categories`);
    
    res.json({ success: true, categories });
  } catch (error) {
    console.error('❌ Error fetching categories:', error.message, error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   POST /api/categories
// @desc    Create a category
// @access  Private (Admin)
router.post('/', auth, authorize('admin'), [
  body('name').trim().notEmpty().withMessage('Name is required')
], async (req, res) => {
  try {
    // Check database connectivity
    if (mongoose.connection.readyState !== 1) {
      console.log('❌ Database not connected for category creation');
      return res.status(503).json({
        success: false,
        message: 'Database not connected'
      });
    }
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Category creation validation errors:', errors.array());
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, icon = 'fa-book', color = 'bg-primary-600' } = req.body;
    
    console.log(`🏷️ Creating category: ${name}`);
    
    let category = await Category.findOne({ name });
    if (category) {
      console.log(`❌ Category already exists: ${name}`);
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    category = new Category({ name, icon, color });
    await category.save();
    
    console.log(`✅ Category created successfully: ${category._id}`);

    res.status(201).json({ success: true, category });
  } catch (error) {
    console.error('❌ Error creating category:', error.message, error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Remove a category (hard delete)
// @access  Private (Admin)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    // Check database connectivity
    if (mongoose.connection.readyState !== 1) {
      console.log('❌ Database not connected for category deletion');
      return res.status(503).json({
        success: false,
        message: 'Database not connected'
      });
    }
    
    console.log(`🗑️ Deleting category: ${req.params.id}`);
    
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      console.log(`❌ Category not found for deletion: ${req.params.id}`);
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    console.log(`✅ Category deleted successfully: ${category._id}`);
    
    res.json({ success: true, message: 'Category removed' });
  } catch (error) {
    console.error('❌ Error deleting category:', error.message, error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private (Admin)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    // Check database connectivity
    if (mongoose.connection.readyState !== 1) {
      console.log('❌ Database not connected for category update');
      return res.status(503).json({
        success: false,
        message: 'Database not connected'
      });
    }
    
    const { name, icon, color } = req.body;
    
    console.log(`✏️ Updating category: ${req.params.id}`);
    
    // Validate that at least one field is provided
    if (!name && !icon && !color) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one field (name, icon, or color) must be provided for update' 
      });
    }
    
    const updateFields = {};
    if (name) updateFields.name = name;
    if (icon) updateFields.icon = icon;
    if (color) updateFields.color = color;
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      console.log(`❌ Category not found for update: ${req.params.id}`);
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    console.log(`✅ Category updated successfully: ${category._id}`);
    
    res.json({ success: true, category });
  } catch (error) {
    console.error('❌ Error updating category:', error.message, error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

export default router;
