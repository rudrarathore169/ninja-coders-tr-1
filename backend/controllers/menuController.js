import MenuItem from '../models/MenuItem.js';
import MenuCategory from '../models/MenuCategory.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { paginateArray, sortArray, filterArray } from '../utils/helperUtils.js';
import { getFileUrl, deleteFile } from '../config/upload.js';

/**
 * Menu Management Controller
 * Handles menu categories and items management
 */

// ==================== MENU CATEGORIES ====================

/**
 * Get all menu categories
 * GET /api/menu/categories
 */
export const getCategories = asyncHandler(async (req, res) => {
  const { active, sortBy = 'displayOrder', sortOrder = 'asc' } = req.query;

  // Build query
  const query = {};
  if (active !== undefined) {
    query.active = active === 'true';
  }

  // Get categories
  let categories = await MenuCategory.find(query).sort({ displayOrder: 1, name: 1 });

  // Apply sorting if specified
  if (sortBy !== 'displayOrder') {
    categories = sortArray(categories, sortBy, sortOrder);
  }

  const categoriesResponse = categories.map(category => ({
    id: category._id,
    name: category.name,
    displayOrder: category.displayOrder,
    active: category.active,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt
  }));

  res.status(200).json({
    success: true,
    message: 'Categories retrieved successfully',
    data: {
      categories: categoriesResponse
    }
  });
});

/**
 * Get category by ID
 * GET /api/menu/categories/:id
 */
export const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await MenuCategory.findById(id);
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  const categoryResponse = {
    id: category._id,
    name: category.name,
    displayOrder: category.displayOrder,
    active: category.active,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt
  };

  res.status(200).json({
    success: true,
    message: 'Category retrieved successfully',
    data: {
      category: categoryResponse
    }
  });
});

/**
 * Create new category (Admin only)
 * POST /api/menu/categories
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { name, displayOrder } = req.body;

  // Check if category already exists
  const existingCategory = await MenuCategory.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (existingCategory) {
    return res.status(400).json({
      success: false,
      message: 'Category with this name already exists'
    });
  }

  // Create new category
  const category = new MenuCategory({
    name: name.trim(),
    displayOrder: displayOrder || 0
  });

  await category.save();

  const categoryResponse = {
    id: category._id,
    name: category.name,
    displayOrder: category.displayOrder,
    active: category.active,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt
  };

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: {
      category: categoryResponse
    }
  });
});

/**
 * Update category (Admin only)
 * PUT /api/menu/categories/:id
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, displayOrder, active } = req.body;

  const category = await MenuCategory.findById(id);
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  // Check if name is being changed and if it already exists
  if (name && name !== category.name) {
    const existingCategory = await MenuCategory.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: id }
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
  }

  // Update category
  if (name) category.name = name.trim();
  if (displayOrder !== undefined) category.displayOrder = displayOrder;
  if (active !== undefined) category.active = active;

  await category.save();

  const categoryResponse = {
    id: category._id,
    name: category.name,
    displayOrder: category.displayOrder,
    active: category.active,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt
  };

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: {
      category: categoryResponse
    }
  });
});

/**
 * Delete category (Admin only)
 * DELETE /api/menu/categories/:id
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await MenuCategory.findById(id);
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  // Check if category has menu items
  const menuItemsCount = await MenuItem.countDocuments({ categoryId: id });
  if (menuItemsCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete category. It contains ${menuItemsCount} menu item(s). Please move or delete the items first.`
    });
  }

  await MenuCategory.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully'
  });
});

// ==================== MENU ITEMS ====================

/**
 * Get all menu items
 * GET /api/menu/items
 */
export const getMenuItems = asyncHandler(async (req, res) => {
  const { 
    categoryId, 
    available, 
    search, 
    tags, 
    page = 1, 
    limit = 10, 
    sortBy = 'name', 
    sortOrder = 'asc',
    minPrice,
    maxPrice
  } = req.query;

  // Build query
  const query = {};
  
  if (categoryId) {
    query.categoryId = categoryId;
  }
  
  if (available !== undefined) {
    query.availability = available === 'true';
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }
  
  if (tags) {
    const tagArray = tags.split(',').map(tag => tag.trim());
    query.tags = { $in: tagArray };
  }
  
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get menu items with category information
  const menuItems = await MenuItem.find(query)
    .populate('categoryId', 'name displayOrder active')
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count
  const total = await MenuItem.countDocuments(query);

  // Format response
  const menuItemsResponse = menuItems.map(item => ({
    id: item._id,
    name: item.name,
    description: item.description,
    price: item.price,
    category: {
      id: item.categoryId._id,
      name: item.categoryId.name,
      displayOrder: item.categoryId.displayOrder,
      active: item.categoryId.active
    },
    availability: item.availability,
    tags: item.tags,
    popularity: item.popularity,
    imageUrl: item.imageUrl,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  }));

  res.status(200).json({
    success: true,
    message: 'Menu items retrieved successfully',
    data: {
      menuItems: menuItemsResponse,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    }
  });
});

/**
 * Get menu item by ID
 * GET /api/menu/items/:id
 */
export const getMenuItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const menuItem = await MenuItem.findById(id).populate('categoryId', 'name displayOrder active');
  if (!menuItem) {
    return res.status(404).json({
      success: false,
      message: 'Menu item not found'
    });
  }

  const menuItemResponse = {
    id: menuItem._id,
    name: menuItem.name,
    description: menuItem.description,
    price: menuItem.price,
    category: {
      id: menuItem.categoryId._id,
      name: menuItem.categoryId.name,
      displayOrder: menuItem.categoryId.displayOrder,
      active: menuItem.categoryId.active
    },
    availability: menuItem.availability,
    tags: menuItem.tags,
    popularity: menuItem.popularity,
    imageUrl: menuItem.imageUrl,
    createdAt: menuItem.createdAt,
    updatedAt: menuItem.updatedAt
  };

  res.status(200).json({
    success: true,
    message: 'Menu item retrieved successfully',
    data: {
      menuItem: menuItemResponse
    }
  });
});

/**
 * Create new menu item (Admin only)
 * POST /api/menu/items
 */
export const createMenuItem = asyncHandler(async (req, res) => {
  const { name, description, price, categoryId, availability = true, tags = [] } = req.body;

  // Verify category exists
  const category = await MenuCategory.findById(categoryId);
  if (!category) {
    return res.status(400).json({
      success: false,
      message: 'Category not found'
    });
  }

  // Check if menu item already exists in this category
  const existingMenuItem = await MenuItem.findOne({ 
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    categoryId 
  });
  if (existingMenuItem) {
    return res.status(400).json({
      success: false,
      message: 'Menu item with this name already exists in this category'
    });
  }

  // Create new menu item
  const menuItem = new MenuItem({
    name: name.trim(),
    description: description.trim(),
    price: parseFloat(price),
    categoryId,
    availability,
    tags: Array.isArray(tags) ? tags.map(tag => tag.trim()) : []
  });

  await menuItem.save();

  // Populate category information
  await menuItem.populate('categoryId', 'name displayOrder active');

  const menuItemResponse = {
    id: menuItem._id,
    name: menuItem.name,
    description: menuItem.description,
    price: menuItem.price,
    category: {
      id: menuItem.categoryId._id,
      name: menuItem.categoryId.name,
      displayOrder: menuItem.categoryId.displayOrder,
      active: menuItem.categoryId.active
    },
    availability: menuItem.availability,
    tags: menuItem.tags,
    popularity: menuItem.popularity,
    imageUrl: menuItem.imageUrl,
    createdAt: menuItem.createdAt,
    updatedAt: menuItem.updatedAt
  };

  res.status(201).json({
    success: true,
    message: 'Menu item created successfully',
    data: {
      menuItem: menuItemResponse
    }
  });
});

/**
 * Update menu item (Admin only)
 * PUT /api/menu/items/:id
 */
export const updateMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, categoryId, availability, tags } = req.body;

  const menuItem = await MenuItem.findById(id);
  if (!menuItem) {
    return res.status(404).json({
      success: false,
      message: 'Menu item not found'
    });
  }

  // Verify category exists if being changed
  if (categoryId && categoryId !== menuItem.categoryId.toString()) {
    const category = await MenuCategory.findById(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }
  }

  // Check if name is being changed and if it already exists in the category
  if (name && name !== menuItem.name) {
    const existingMenuItem = await MenuItem.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      categoryId: categoryId || menuItem.categoryId,
      _id: { $ne: id }
    });
    
    if (existingMenuItem) {
      return res.status(400).json({
        success: false,
        message: 'Menu item with this name already exists in this category'
      });
    }
  }

  // Update menu item
  if (name) menuItem.name = name.trim();
  if (description) menuItem.description = description.trim();
  if (price !== undefined) menuItem.price = parseFloat(price);
  if (categoryId) menuItem.categoryId = categoryId;
  if (availability !== undefined) menuItem.availability = availability;
  if (tags !== undefined) menuItem.tags = Array.isArray(tags) ? tags.map(tag => tag.trim()) : [];

  await menuItem.save();

  // Populate category information
  await menuItem.populate('categoryId', 'name displayOrder active');

  const menuItemResponse = {
    id: menuItem._id,
    name: menuItem.name,
    description: menuItem.description,
    price: menuItem.price,
    category: {
      id: menuItem.categoryId._id,
      name: menuItem.categoryId.name,
      displayOrder: menuItem.categoryId.displayOrder,
      active: menuItem.categoryId.active
    },
    availability: menuItem.availability,
    tags: menuItem.tags,
    popularity: menuItem.popularity,
    createdAt: menuItem.createdAt,
    updatedAt: menuItem.updatedAt
  };

  res.status(200).json({
    success: true,
    message: 'Menu item updated successfully',
    data: {
      menuItem: menuItemResponse
    }
  });
});

/**
 * Delete menu item (Admin only)
 * DELETE /api/menu/items/:id
 */
export const deleteMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const menuItem = await MenuItem.findById(id);
  if (!menuItem) {
    return res.status(404).json({
      success: false,
      message: 'Menu item not found'
    });
  }

  await MenuItem.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Menu item deleted successfully'
  });
});

/**
 * Update menu item availability (Admin only)
 * PATCH /api/menu/items/:id/availability
 */
export const updateMenuItemAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { availability } = req.body;

  const menuItem = await MenuItem.findById(id);
  if (!menuItem) {
    return res.status(404).json({
      success: false,
      message: 'Menu item not found'
    });
  }

  menuItem.availability = availability;
  await menuItem.save();

  res.status(200).json({
    success: true,
    message: `Menu item availability updated to ${availability ? 'available' : 'unavailable'}`,
    data: {
      menuItem: {
        id: menuItem._id,
        name: menuItem.name,
        availability: menuItem.availability
      }
    }
  });
});

/**
 * Update menu item popularity (Admin only)
 * PATCH /api/menu/items/:id/popularity
 */
export const updateMenuItemPopularity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { popularity } = req.body;

  const menuItem = await MenuItem.findById(id);
  if (!menuItem) {
    return res.status(404).json({
      success: false,
      message: 'Menu item not found'
    });
  }

  menuItem.popularity = parseInt(popularity) || 0;
  await menuItem.save();

  res.status(200).json({
    success: true,
    message: 'Menu item popularity updated successfully',
    data: {
      menuItem: {
        id: menuItem._id,
        name: menuItem.name,
        popularity: menuItem.popularity
      }
    }
  });
});

/**
 * Get menu statistics (Admin only)
 * GET /api/menu/stats
 */
export const getMenuStats = asyncHandler(async (req, res) => {
  // Get category statistics
  const totalCategories = await MenuCategory.countDocuments();
  const activeCategories = await MenuCategory.countDocuments({ active: true });

  // Get menu item statistics
  const totalMenuItems = await MenuItem.countDocuments();
  const availableMenuItems = await MenuItem.countDocuments({ availability: true });
  const unavailableMenuItems = await MenuItem.countDocuments({ availability: false });

  // Get popular items
  const popularItems = await MenuItem.find({ popularity: { $gt: 0 } })
    .sort({ popularity: -1 })
    .limit(10)
    .select('name popularity price')
    .populate('categoryId', 'name');

  // Get items by category
  const itemsByCategory = await MenuItem.aggregate([
    {
      $lookup: {
        from: 'menucategories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'category'
      }
    },
    {
      $group: {
        _id: '$categoryId',
        categoryName: { $first: '$category.name' },
        itemCount: { $sum: 1 },
        availableCount: {
          $sum: { $cond: ['$availability', 1, 0] }
        }
      }
    },
    {
      $sort: { itemCount: -1 }
    }
  ]);

  res.status(200).json({
    success: true,
    message: 'Menu statistics retrieved successfully',
    data: {
      stats: {
        categories: {
          total: totalCategories,
          active: activeCategories,
          inactive: totalCategories - activeCategories
        },
        menuItems: {
          total: totalMenuItems,
          available: availableMenuItems,
          unavailable: unavailableMenuItems
        },
        popularItems: popularItems.map(item => ({
          id: item._id,
          name: item.name,
          popularity: item.popularity,
          price: item.price,
          category: item.categoryId.name
        })),
        itemsByCategory: itemsByCategory.map(cat => ({
          categoryId: cat._id,
          categoryName: cat.categoryName[0],
          totalItems: cat.itemCount,
          availableItems: cat.availableCount,
          unavailableItems: cat.itemCount - cat.availableCount
        }))
      }
    }
  });
});

/**
 * Upload menu item image (Admin only)
 * POST /api/menu/items/:id/image
 */
export const uploadMenuItemImage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No image file provided'
    });
  }

  const menuItem = await MenuItem.findById(id);
  if (!menuItem) {
    return res.status(404).json({
      success: false,
      message: 'Menu item not found'
    });
  }

  // Delete old image if exists
  if (menuItem.imagePath) {
    try {
      await deleteFile(menuItem.imagePath);
    } catch (error) {
      console.error('Error deleting old image:', error);
    }
  }

  // Update menu item with new image path
  menuItem.imagePath = req.file.path;
  menuItem.imageUrl = getFileUrl(req.file.path);
  await menuItem.save();

  res.status(200).json({
    success: true,
    message: 'Menu item image uploaded successfully',
    data: {
      menuItem: {
        id: menuItem._id,
        name: menuItem.name,
        imagePath: menuItem.imagePath,
        imageUrl: menuItem.imageUrl
      }
    }
  });
});

/**
 * Delete menu item image (Admin only)
 * DELETE /api/menu/items/:id/image
 */
export const deleteMenuItemImage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const menuItem = await MenuItem.findById(id);
  if (!menuItem) {
    return res.status(404).json({
      success: false,
      message: 'Menu item not found'
    });
  }

  if (!menuItem.imagePath) {
    return res.status(400).json({
      success: false,
      message: 'Menu item has no image to delete'
    });
  }

  // Delete image file
  try {
    await deleteFile(menuItem.imagePath);
  } catch (error) {
    console.error('Error deleting image file:', error);
  }

  // Update menu item
  menuItem.imagePath = undefined;
  menuItem.imageUrl = undefined;
  await menuItem.save();

  res.status(200).json({
    success: true,
    message: 'Menu item image deleted successfully',
    data: {
      menuItem: {
        id: menuItem._id,
        name: menuItem.name,
        imagePath: null,
        imageUrl: null
      }
    }
  });
});

/**
 * Upload category image (Admin only)
 * POST /api/menu/categories/:id/image
 */
export const uploadCategoryImage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No image file provided'
    });
  }

  const category = await MenuCategory.findById(id);
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  // Delete old image if exists
  if (category.imagePath) {
    try {
      await deleteFile(category.imagePath);
    } catch (error) {
      console.error('Error deleting old image:', error);
    }
  }

  // Update category with new image path
  category.imagePath = req.file.path;
  category.imageUrl = getFileUrl(req.file.path);
  await category.save();

  res.status(200).json({
    success: true,
    message: 'Category image uploaded successfully',
    data: {
      category: {
        id: category._id,
        name: category.name,
        imagePath: category.imagePath,
        imageUrl: category.imageUrl
      }
    }
  });
});

/**
 * Delete category image (Admin only)
 * DELETE /api/menu/categories/:id/image
 */
export const deleteCategoryImage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await MenuCategory.findById(id);
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  if (!category.imagePath) {
    return res.status(400).json({
      success: false,
      message: 'Category has no image to delete'
    });
  }

  // Delete image file
  try {
    await deleteFile(category.imagePath);
  } catch (error) {
    console.error('Error deleting image file:', error);
  }

  // Update category
  category.imagePath = undefined;
  category.imageUrl = undefined;
  await category.save();

  res.status(200).json({
    success: true,
    message: 'Category image deleted successfully',
    data: {
      category: {
        id: category._id,
        name: category.name,
        imagePath: null,
        imageUrl: null
      }
    }
  });
});

export default {
  // Categories
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  
  // Menu Items
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateMenuItemAvailability,
  updateMenuItemPopularity,
  getMenuStats,
  
  // Image Upload
  uploadMenuItemImage,
  deleteMenuItemImage,
  uploadCategoryImage,
  deleteCategoryImage
};