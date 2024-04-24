const Category = require("../models/category");
const Item = require("../models/item");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all categorys.
exports.category_list = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find().sort({ name: 1 }).exec();
  res.render("category_list", {
    title: "Category List",
    category_list: allCategories,
  });
});

// Display detail page for a specific category.
exports.category_detail = asyncHandler(async (req, res, next) => {
  const [categoryData, itemsInCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }, "name number_in_stock price").exec(),
  ])

  res.render("category_details", {
    title: "Category Details",
    category: categoryData,
    category_items: itemsInCategory,
  });
});

// Display category create form on GET.
exports.category_create_get = asyncHandler(async (req, res, next) => {
  res.render("category_form", {
    title: "Create New Category",
    category: undefined,
    errors: undefined,
  })
});

// Handle category create on POST.
exports.category_create_post = [
  // Validate and sanitize fields.
  body("name", "Name must not be empty.")
    .trim()
    .isLength({ min: 3, max: 40 })
    .escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 3, max: 100 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Category object with escaped and trimmed data.
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      res.render("category_form", {
        title: "Create category",
        category: category,
        errors: errors.array(),
      })
    } else {
      // Data from form is valid. Save item.
      // Check if Category with same name already exists.
      const categoryExists = await Category.findOne({ name: req.body.name }).exec();
      if (categoryExists) {
        // Category exists, redirect to its detail page.
        res.redirect(categoryExists.url);
      } else {
        await category.save();
        res.redirect(category.url);
      }
    }
  }),
];

// Display category delete form on GET.
exports.category_delete_get = asyncHandler(async (req, res, next) => {
  const [categoryData, itemsInCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }, "name number_in_stock price").exec(),
  ])

  res.render("category_delete", {
    title: "Delete the category:",
    category: categoryData,
    category_items: itemsInCategory,
  });
});

// Handle category delete on POST.
exports.category_delete_post = asyncHandler(async (req, res, next) => {
  const [categoryData, itemsInCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }, "name number_in_stock price").exec(),
  ])

  if (categoryData === null) {
    // No results.
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  if (itemsInCategory.length > 0) {
    res.render("category_delete", {
      title: "Delete the category:",
      category: categoryData,
      category_items: itemsInCategory,
    });
  } else {
    await Category.findByIdAndDelete(req.body.categoryid);
    res.redirect("/categories");
  }
});

// Display category update form on GET.
exports.category_update_get = asyncHandler(async (req, res, next) => {
  const categoryData = await Category.findById(req.params.id).exec();

  res.render("category_form", {
    title: "Update category",
    category: categoryData,
    errors: undefined,
  });
});

// Handle category update on POST.
exports.category_update_post = [
  // Validate and sanitize fields.
  body("name", "Name must not be empty.")
    .trim()
    .isLength({ min: 3, max: 40 })
    .escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 3, max: 100 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Category object with escaped and trimmed data.
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      res.render("category_form", {
        title: "Update category",
        category: category,
        errors: errors.array(),
      })
    } else {
      // Data from form is valid. Update item.
      // Check if Category with same name already exists.
      const categoryExists = await Category.findOne({ name: req.body.name }).exec();
      if (categoryExists && categoryExists._id.toString() !== category._id.toString()) {
        // Category exists, redirect to its detail page.
        res.redirect(categoryExists.url);
      } else {
        await Category.findByIdAndUpdate(req.params.id, category);
        res.redirect(category.url);
      }
    }
  }),
];
