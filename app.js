/* const fs = require("fs");
const path = require("path");
const http = require("http");

const arr = ["Adnan", "Hasnain"];
const courses = [
  { name: "Adnan", age: 22, email: "adnan@gmail.com" },
  { name: "Hasnain", age: 18, email: "hasnain@gmail.com" },
  { name: "yousuf", age: 25, email: "yousuf@gmail.com" },
];

const server = http.createServer((req, res) => {
  if (req.url == "/course") {
    if(req.method == "GET"){
        console.log("/ Request");
        res.write(JSON.stringify(courses));
      }
    }
  res.end();
});

server.listen(3000); */

/* Express JS Working */

/* This code is sir basits class

const express = require("express");
require("dotenv").config();
const App = express();
const usersroute = require("./routers/userroute");
App.use(express.json());

App.use('/users',usersroute);

App.listen(process.env.PORT, () => {
  console.log(
    `Server is running //http:localhost:${process.env.PORT}/users/id`
  );
}); */

require("dotenv").config();
const express = require("express");
const userRoute = require("./routers/userroute");
const authRoute = require("./routers/authRoute");
const productsRoute = require("./routers/productsRoute");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(express.json());
app.use(cors())
app.use(bodyParser.json())

const port = process.env.PORT || 8000;

/* ........users api......... */
app.use("/users", userRoute);
/* ........authroute api......... */
app.use("/authuser",authRoute);


/* ........products api......... */
app.use("/products", productsRoute);



mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server successfully running on PORT ${port}`);
    });
  })
  .catch((error) => {
    console.log("Database Connection Error", error);
  });






// This code is sheriyans coding school channle

// Middleware => middleware ek aisa function he jo kisi bhi route se pahle chalta he,
// jiska matlb ap ka route chalne se pahle agar ap koi km karana chahte ho to middleware ka use kya ja sakta he

// route pe chalne se pahle print karo chala on console
// route chalne se pahle route pe hits counter ki value badhao

/* const express = require("express");

const app = express();
app.set("view engine","ejs");

// req (paramter) => req paramter me user ka data hota he jase koi user request karta he server per to wo req k paramter se hogi 
// res (paramter) => res paramter me wo data jo server per beja jata he res k zarye bejte hen

app.use((req,res,next)=>{
  console.log("Hello from middleware")

  // next() => jb hamara middleware chalta he to request jam hojati he or route tak nhi pohnch paati
  //           to is lye us request ko age badhane k lye matlb next route per jane k lye ham next function use karte hen
  next();
})

app.use((req,res,next)=>{
  console.log("Hello from middleware 2")
  next();
})

app.get("/",(req,res)=>{
  res.render("index",{age:22});
})

// app.get("/profile/:username",(req,res)=>{
//   res.send(`Hey hello from profile ${req.params.username}`)
// })

app.listen(3000);
 */
