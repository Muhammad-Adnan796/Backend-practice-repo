import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Router Imports

import  userRouter from "./routes/user.routes.js";

// routes declaration

app.use("/api/v1/users", userRouter);

export { app };

/* app: ===> In the context of Node.js and Express.js, 
app refers to an instance of the Express application. 
It's the central part where you configure routes, middleware,
 and other functionalities for your web application.
 */

/* use: ===> This is a method in Express.js used to mount middleware. 
 Middleware functions in Express.js have access to the request, response, 
 and the next function in the application's request-response cycle. 
 This method is used to add middleware functions to the middleware stack. 
 */

/*  express.static:  ===> This is a built-in middleware function in Express.js. 
 It serves static files, such as HTML, CSS, images, and JavaScript files,
   from a directory. It takes a directory path as an argument and, 
 when a request is made to the server, 
 looks for the requested file within that directory to serve it.
  */

/* "public": ===> This is the argument passed to express.static. 
 It represents the directory from which the static files will be served. 
 In this case, it's specifying that the server should look for static 
 files in a directory named "public".
  */
