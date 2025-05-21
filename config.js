require("dotenv").config();

const mongo_url = process.env.mongo_url;
const JWT_USER_SECRET= process.env.JWT_USER_SECRET;


module.exports={
    mongo_url,
    JWT_USER_SECRET
}