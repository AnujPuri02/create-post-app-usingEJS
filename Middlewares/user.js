
const jwt = require("jsonwebtoken");
const {JWT_USER_SECRET}= require("../config");

function isLoggedIn(req,res,next){
   if(req.cookies.token==="")res.redirect("/login");
   else{
      const data = jwt.verify(req.cookies.token,JWT_USER_SECRET);
      req.userId = data.userId;
      next();
   } 
}


module.exports = isLoggedIn;