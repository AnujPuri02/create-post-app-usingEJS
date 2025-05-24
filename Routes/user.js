const Router = require("express");
const zod = require("zod");
const bcrypt =  require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const path = require("path");



const isLoggedIn = require("../Middlewares/user");
const {mongo_url,JWT_USER_SECRET}= require("../config")
const {userModel}= require("../models/user");
const {postModel} = require("../models/post");
const {uploads} = require("../config");

const userRouter = Router();

userRouter.get("/",(req,res)=>{
   res.render("register");
})

userRouter.get("/profile/uploads",(req,res)=>{
   res.render("profileupload");
})

// store profile pic in database and render it 
userRouter.post("/uploads",isLoggedIn,uploads.single("image"), async(req,res)=>{
   const user = await userModel.findOne({
      _id:req.userId
   });
   user.profilepic= req.file.filename;
   await user.save();
   res.redirect("/profile");
})

// user can register their account
userRouter.post("/register",async (req,res)=>{
   let {email,name,password , age }= req.body;
   age = parseInt(age);
   const requiredBody = zod.object({
      name :zod.string(),
      email:zod.string(),
      password:zod.string().min(4).max(8),
      age:zod.coerce.number()
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
      res.redirect("/login")
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
userRouter.get("/login",(req,res)=>{
   res.render("login");
})

userRouter.post("/login",async (req,res)=>{
   const {email, password} = req.body;
   const requiredBody = zod.object({
      email:zod.string(),
      password:zod.string().min(4).max(8)
   })
   const {success,error}= requiredBody.safeParse(req.body);
   if(error){
      return res.status(400).send({
         msg:"error while validating the inputs !!",
         err:error
      })
   }
   console.log(error);
   
   try{
      const user = await userModel.findOne({
         email
      })
      const passwordMatched = await bcrypt.compare(password,user.password);
      console.log(passwordMatched);
      
      if(passwordMatched){
         const token = jwt.sign({
            userId :user._id
         },JWT_USER_SECRET);
         res.cookie("token",token);
         res.redirect("/profile");
         // res.send({
         //    msg:"you logged in !!",
         //    token
         // })
      }
      else{
         res.redirect("/login")
         // res.send({
         //    msg:"wrong password !!"
         // })
      }
   }
   catch(err){
      console.log("in catch");
      
      res.redirect("/login");
      // res.send({
      //    msg:"user not found with this email and password !!"
      // })
   }
})


userRouter.get("/logout",(req,res)=>{
   res.cookie("token","");
   res.redirect("/login");
})


userRouter.get("/profile",isLoggedIn,async(req,res)=>{
   const user = await userModel.findOne({
      _id:req.userId
   }).populate("posts");
   const allPosts = await postModel.find({

   });

   res.render("profile",{user:user,allposts:allPosts}); 
})

userRouter.post("/post",isLoggedIn,async (req,res)=>{
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

userRouter.get("/like/:postId",isLoggedIn,async (req,res)=>{
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


module.exports = userRouter;

