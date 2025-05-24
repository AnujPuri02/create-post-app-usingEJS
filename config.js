require("dotenv").config();
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");


const mongo_url = process.env.mongo_url;
const JWT_USER_SECRET= process.env.JWT_USER_SECRET;


// storage 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads');
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(12,(err,name)=>{
        const fn = name.toString("hex")+path.extname(file.originalname);
        cb(null,fn);
    })
  }
})

const uploads = multer({ storage: storage })


module.exports={
    mongo_url,
    JWT_USER_SECRET,
    uploads
}