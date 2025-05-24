const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");



const {mongo_url,JWT_USER_SECRET}= require("./config")
const userRouter = require("./Routes/user");

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded());
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"/public")));


app.use(userRouter);



connectToMongo();
async function connectToMongo(){
   await mongoose.connect(mongo_url);
   app.listen(3000,()=>{
      console.log("connecting to server 3000..");
   })
 }