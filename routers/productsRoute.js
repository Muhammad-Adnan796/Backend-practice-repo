const express = require("express");
const productsController = require("../controllers/ProductsController");
const route = express.Router();

/* ..........get.......... */

route.get("/",productsController.get);

/* ..........getById.......... */

route.get("/:id",productsController.getById);

/* ..........post.......... */

route.post("/",productsController.add);

/* ..........put.......... */

route.put("/:id",productsController.editById);

/* ..........delete.......... */

route.delete("/:id",productsController.del);

module.exports = route;