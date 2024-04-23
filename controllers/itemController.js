const Item = require("../models/item");
const Category = require("../models/category");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.index = asyncHandler(async (req, res, next) => {
  const [itemCount, categoryCount] = await Promise.all([
    Item.countDocuments({}).exec(),
    Category.countDocuments({}).exec(),
  ]);

  res.render("index", {
    title: "Inventory Application",
    item_count: itemCount,
    category_count: categoryCount,
  });
});

// Display list of all items.
exports.item_list = asyncHandler(async (req, res, next) => {
  const allItems = await Item.find().sort({ name: 1 }).exec();
  res.render("item_list", {
    title: "Item List",
    item_list: allItems,
  });
});

// Display detail page for a specific item.
exports.item_detail = asyncHandler(async (req, res, next) => {
  const itemData = await Item.findById(req.params.id).populate("category").exec();
  if (itemData === null) {
    // No results.
    const err = new Error("Book not found");
    err.status = 404;
    return next(err);
  }
  res.render("item_details", {
    title: "Item Details",
    item: itemData,
  });
});

// Display item create form on GET.
exports.item_create_get = asyncHandler(async (req, res, next) => {
  const categories = await Category.find().sort({ name: 1 }).exec();

  res.render("item_form", {
    title: "Create Item",
    category_list: categories,
    item: undefined,
    errors: undefined,
  })
});

// Handle item create on POST.
exports.item_create_post = [
  // Validate and sanitize fields.
  body("name", "Name must not be empty.")
    .trim()
    .isLength({ min: 3, max: 40 })
    .escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 3, max: 100 })
    .escape(),
  body("category", "Category must be specified.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price must be between $1 - $1 000 000.")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 1 })
    .isInt({ allow_leading_zeroes: false, min: 1, max: 1000000 })
    .escape(),
  body("number_in_stock", "Max capacity is 1 000 000")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 1 })
    .isInt({ allow_leading_zeroes: false, min: 1, max: 1000000 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped and trimmed data.
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      number_in_stock: req.body.number_in_stock,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      const categories = await Category.find().sort({ name: 1 }).exec();
      res.render("item_form", {
        title: "Create Item",
        category_list: categories,
        item: item,
        errors: errors.array(),
      })
    } else {
      // Data from form is valid. Save item.
      await item.save();
      res.redirect(item.url);
    }
  }),
];

// Display item delete form on GET.
exports.item_delete_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: item delete GET");
});

// Handle item delete on POST.
exports.item_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: item delete POST");
});

// Display item update form on GET.
exports.item_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: item update GET");
});

// Handle item update on POST.
exports.item_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: item update POST");
});
