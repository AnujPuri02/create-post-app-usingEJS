const express = require("express");
const zod = require("zod");
const bcrypt =  require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const path = require("path");

const {mongo_url,JWT_USER_SECRET}= require("./config")
const {userModel}= require("./models/user");
const {postModel} = require("./models/post");
const {uploads} = require("./config");

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded());
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"/public")));


function isLoggedIn(req,res,next){
   if(req.cookies.token==="")res.redirect("/login");
   else{
      const data = jwt.verify(req.cookies.token,JWT_USER_SECRET);
      req.userId = data.userId;
      next();
   } 
}

app.get("/",(req,res)=>{
   res.render("register");
})

// profile uploads page 
app.get("/profile/uploads",(req,res)=>{
   res.render("profileupload");
})

// store profile pic in database and render it 
app.post("/uploads",isLoggedIn,uploads.single("image"), async(req,res)=>{
   const user = await userModel.findOne({
      _id:req.userId
   });
   user.profilepic= req.file.filename;
   await user.save();
   res.redirect("/profile");
})

// user can register their account
app.post("/register",async (req,res)=>{
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
app.get("/login",(req,res)=>{
   res.render("login");
})

app.post("/login",async (req,res)=>{
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


app.get("/logout",(req,res)=>{
   res.cookie("token","");
   res.redirect("/login");
})


app.get("/profile",isLoggedIn,async(req,res)=>{
   const user = await userModel.findOne({
      _id:req.userId
   }).populate("posts");
   const allPosts = await postModel.find({

   });

   res.render("profile",{user:user,allposts:allPosts}); 
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

app.get("/like/:postId",isLoggedIn,async (req,res)=>{
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
   await mongoose.connect(mongo_url);
   app.listen(3000,()=>{
      console.log("connecting to server 3000..");
   })
 }