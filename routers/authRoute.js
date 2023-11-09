const express = require("express");
const AuthController = require("../controllers/authController");
const route = express.Router();


/* //  For get data
route.get("/", AuthController.get);
//  For get data by id
route.get("/:id", AuthController.getById); */

// For Post data to the api
route.post("/signup", AuthController.signUp);
route.post("/signin", AuthController.signIn);
/* // For put data to the api
route.put("/:id", AuthController.editById);
// for delete data
route.delete("/:id", AuthController.del); */

module.exports = route;