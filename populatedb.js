#! /usr/bin/env node

console.log(
  'This script populates some test categories and items to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Category = require("./models/category");
const Item = require("./models/item");

const categories = [];
const items = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  await createCategories();
  await createItems();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

// We pass the index to the ...Create functions so that, for example,
// genre[0] will always be the Fantasy genre, regardless of the order
// in which the elements of promise.all's argument complete.
async function categoryCreate(index, name, description) {
  const category = new Category({ name: name, description: description });
  await category.save();
  categories[index] = category;
  console.log(`Added category: ${name}`);
}

async function itemCreate(index, name, description, category, price, number_in_stock) {
  const authordetail = { name: name, description: description, category: category };
  if (price != false) authordetail.price = price;
  if (number_in_stock != false) authordetail.number_in_stock = number_in_stock;

  const item = new Item(authordetail);

  await item.save();
  items[index] = item;
  console.log(`Added item: ${name}`);
}

async function createCategories() {
  console.log("Adding categories");
  await Promise.all([
    categoryCreate(0, "Mobile Devices", "Stay connected with our cutting-edge smartphones, featuring advanced features and sleek designs."),
    categoryCreate(1, "Laptops", "Discover the perfect blend of power and portability with our top-notch laptops."),
    categoryCreate(2, "Televisions (TVs)", "Get quality entertainment without breaking the bank with our budget-friendly options."),
    categoryCreate(3, "Wearable Fitness Trackers", "Monitor your health and stay active with our fitness bands."),
    categoryCreate(4, "Computers (Desktops)", "Streamline your workspace with our sleek all-in-one desktops."),
  ]);
}

async function createItems() {
  console.log("Adding items");
  await Promise.all([
    // Mobile Devices
    itemCreate(0, "Apple iPhone 13", "A high-end mobile phone with advanced features.", categories[0], 999, 50),
    itemCreate(0, "Samsung Galaxy Tab S7", "A portable touchscreen device for browsing, gaming, and productivity.", categories[0], 649, 30),
    itemCreate(0, "Apple Watch Series 7", "A wearable device that tracks health and provides notifications.", categories[0], 399, 20),

    // Laptops
    itemCreate(1, "Dell XPS 13", "A sleek ultrabook with powerful performance.", categories[1], 1199, 15),
    itemCreate(1, "MacBook Air M1", "Apple's lightweight laptop with impressive battery life.", categories[1], 999, 10),
    itemCreate(1, "Lenovo ThinkPad X1 Carbon", "A business-oriented laptop known for durability.", categories[1], 1499, 8),

    // Televisions (TVs)
    itemCreate(2, "Sony Bravia OLED A90J", "A 4K OLED TV with stunning picture quality.", categories[2], 2799, 5),
    itemCreate(2, "Samsung QLED Q80A", "A 4K QLED TV with vibrant colors and excellent contrast.", categories[2], 1499, 12),
    itemCreate(2, "LG NanoCell 85 Series", "A budget-friendly 4K TV with good performance.", categories[2], 899, 20),

    // Wearable Fitness Trackers
    itemCreate(3, "Fitbit Charge 4", "A fitness band that monitors steps, heart rate, and sleep.", categories[3], 149, 40),
    itemCreate(3, "Garmin Vivosmart 4", "A slim activity tracker with stress tracking features.", categories[3], 129, 25),
    itemCreate(3, "Xiaomi Mi Band 6", "An affordable fitness tracker with a color display.", categories[3], 49, 60),

    // Computers (Desktops)
    itemCreate(4, "HP Pavilion Gaming Desktop", "A gaming PC with powerful graphics.", categories[4], 899, 10),
    itemCreate(4, "Apple iMac (24-inch, M1)", "An all-in-one desktop with Apple's M1 chip.", categories[4], 1299, 8),
    itemCreate(4, "Lenovo IdeaCentre 5", "A mid-range desktop for everyday tasks.", categories[4], 599, 15),
  ]);
}