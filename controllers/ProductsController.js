const SendResponse = require("../helpers/helpers");
const ProductsModel = require("../models/ProductsModel");

const productsController = {
  add: async (req, res) => {
    const {
      title,
      price,
      description,
      images,
      creationAt,
      updatedAt,
      category: {
        id,
        name,
        image,
        creationAt: timeCreationAt,
        updatedAt: timeUpdatedAt,
      },
    } = req.body;
    try {
      const newProduct = new ProductsModel({
        title,
        price,
        description,
        images,
        category: {
          id,
          name,
          image,
        },
      });
      if (!title || !price || !description) {
        return res
          .status(400)
          .send(
            SendResponse(
              false,
              "Validation Error: Title,Price,Description fields are required"
            )
          );
      }
      const products = await newProduct.save();
      res
        .status(200)
        .send(SendResponse(true, "Product added successfully", products));
    } catch (error) {
      res.status(500).send(SendResponse(false, "Error adding data"));
    }
  },
  get: async (req, res) => {
    try {
      const {pageNo,pageSize} = req.query;
      console.log(pageNo,pageSize);
      const skipCount = (pageNo-1) * pageSize
      const products = await ProductsModel.find({}).limit(pageSize).skip(skipCount);
      if (products.length > 0) {
        res
          .status(200)
          .send(SendResponse(true, "Products fetched successfully", products));
      } else {
        res.status(404).send(SendResponse(true, "No data found", null));
      }
    } catch (error) {
      res.status(500).send(SendResponse(false, "Error fetching products"));
    }
  },
  getById: async (req, res) => {
    const productId = req.params.id;
    try {
      const product = await ProductsModel.findById(productId);

      if (product) {
        res.status(200).send(SendResponse(true, "Product found", product));
      } else {
        res.status(404).send(SendResponse(true, "No Product found", null));
      }
    } catch (error) {
      res.status(500).send(SendResponse(false, "Error fetching product"));
    }
  },
  editById: async (req, res) => {
    const productId = req.params.id;
    const {
      title,
      price,
      description,
      images,
      category: { id, name, image },
    } = req.body;
    try {
      const product = await ProductsModel.findById(productId);
      if (product) {
        product.title = title;
        product.price = price;
        product.description = description;
        product.images = images;
        product.category.id = id;
        product.category.name = name;
        product.category.image = image;

        const updatedProduct = await product.save();
        res
          .status(200)
          .send(
            SendResponse(true, "Product updated successfully", updatedProduct)
          );
      } else {
        res
          .status(404)
          .send(SendResponse(true, "No product found with the given ID", null));
      }
    } catch (error) {
      res.status(500).send(SendResponse(false, "Error updating product"));
    }
  },
  del: async (req, res) => {
    const { id } = req.params;
    try {
      const deletedProduct = await ProductsModel.findByIdAndDelete(id);
      if (deletedProduct) {
        res
          .status(200)
          .send(SendResponse(true, "Product deleted successfully", id));
      } else {
        res
          .status(404)
          .send(SendResponse(true, "No product found with the given ID", null));
      }
    } catch (error) {
      res.status(500).send(SendResponse(false, "Error deleting user"));
    }
  },
};

module.exports = productsController;
