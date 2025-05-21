const mongoose = require("mongoose");

const schema = mongoose.Schema;
const objectId = schema.ObjectId;

const userSchema = new schema({
    name:String,
    email:{
        type:String,
        unique:true
    },
    password : String,
    age :Number,
    posts:[
        {
            type:objectId,
            ref:"post"
        }
    ]
})



const userModel = mongoose.model("user",userSchema);

module.exports={
    userModel
}