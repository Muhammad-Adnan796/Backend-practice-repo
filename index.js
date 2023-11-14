import express from "express";
import mongoose from "mongoose";
const app = express();

mongoose
  .connect(
    "mongodb+srv://Muhammad-Adnan:adnan8123796@cluster0.tr3bvug.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(4000,()=>{
        console.log(`Database is connected and Server is running on localhost://${4000}`)
    });
  }).catch((error)=>{
    console.log(`Mongoose is not connected ${error.message}`);
  });
