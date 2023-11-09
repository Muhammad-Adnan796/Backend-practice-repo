const express = require('express');
const usersController = require('../controllers/usersController');
const route = express.Router();

  //  For get data
  route.get("/", usersController.get);
  //  For get data by id
  route.get("/:id", usersController.getById);
  
  // For Post data to the api
  route.post("/", usersController.add);
  // For put data to the api
  route.put("/:id", usersController.editById);
  // for delete data
  route.delete("/:id", usersController.del);

  module.exports = route;