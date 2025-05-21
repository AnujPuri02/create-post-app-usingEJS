const express = require("express");
const zod = require("zod");
const bcrypt =  require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const {mongo_url,JWT_USER_SECRET}= require("./config")
const {userModel, postModel }= require("./models/db");

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded());
app.set("view engine","ejs");


function isLoggedIn(req,res,next){
   if(req.cookie.token==="")res.redirect("/login");
   else{
      const data = jwt.verify(req.cookie.token,JWT_USER_SECRET);
      req.userId = data.userId;
      next();
   } 
}

app.get("/",(req,res)=>{
   res.render("register");
})

// user can register their account
app.post("/register",async (req,res)=>{
   const {email,name,password , age }= req.body;
   const requiredBody = zod.object({
      name :zod.string(),
      email:zod.email(),
      password:zod.string().min(4).max(8),
      age:zod.number()
   })
   const {success,error} = requiredBody.safeParse(req.body);
   if(error){
      return res.status(400).send({
         msg:"error in validation input !!",
         err:error
      })
   }
   const hashedPass =await  bcrypt.hash(password,3);
   try{
      await userModel.create({
         name,
         email,
         password:hashedPass,
         age
      })
      res.send({
         msg:"you signed up successfully !!"
      })
   }
   catch(err){
      res.send({
         msg:"account already exists !!"
      })
   }

})

// login page 
app.get("/login",(req,res)=>{
   res.render("login");
})

app.post("/login",async (req,res)=>{
   const {email, password} = req.body;
   const requiredBody = zod.object({
      name:zod.string(),
      email:zod.email(),
      password:zod.string().min(3).max(8),
      age:zod.number()
   })
   const {success,error}= requiredBody.safeParse(req.body);
   if(error){
      return res.status(400).send({
         msg:"error while validating the inputs !!",
         err:error
      })
   }
   try{
      const user = userModel.findOne({
         email
      })
      const passwordMatched = await bcrypt.compare(user.password,password);
      if(passwordMatched){
         const token = jwt.sign({
            userId :user._id
         },JWT_USER_SECRET);
         res.cookie("token",token);
         res.redirect("/profile");
         res.send({
            msg:"you logged in !!",
            token
         })
      }
      else{
         res.redirect("/login")
         res.send({
            msg:"wrong password !!"
         })
      }
   }
   catch(err){
      res.redirect("/login");
      res.send({
         msg:"user not found with this email and password !!"
      })
   }
})


app.get("/logout",(req,res)=>{
   res.cookie("token","");
   res.redirect("/login");
})


app.get("/profile",isLoggedIn,async(req,res)=>{
   const user = await userModel.findOne({
      _id:req.userId
   }).populate("posts");

   res.render("profile",{user:user});
})

app.post("/post",isLoggedIn,async (req,res)=>{
   const user = await userModel.findOne({
      _id:req.userId
   })
   const {content} = req.body;
   const posts =await postModel.create({
      user:user._id,
      content
   })

   user.posts.push(posts._id);
   await user.save();
   res.redirect("/profile");

})

app.get("/likes/:postId",isLoggedIn,async (req,res)=>{
   const posts = await postModel.findOne({
      _id:req.params.postId
   }).populate("user");
   if(posts.likes.indexOf(req.userId)===-1){
      posts.likes.push(req.userId);
   }
   else{
      posts.likes.splice(posts.likes.indexOf(req.userId),1);
   }
   await posts.save();
   res.redirect("/profile");

})
connectToMongo();
async function connectToMongo(){
   // await mongoose.connect(mongo_url);
   app.listen(3000,()=>{
      console.log("connecting to server 3000..");
   })
 }