const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  id: Number,
  name: String,
  image: String,
  creationAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const productsSchema = new mongoose.Schema({
  id: Number,
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  images: {
    type:[String]
  },
  creationAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  category: categorySchema,
});

const ProductsModel = mongoose.model("Products", productsSchema);

module.exports = ProductsModel;
