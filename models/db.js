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
            ref:"postSchema"
        }
    ]
})

const postSchema = new schema({
    content:{
        type:String,
    },
    likes:[{
        type:objectId,
        ref:"userSchema"
    }],
    time:{
        type:Date,
        default:Date.now
    },
    user:{
        type:objectId,
        ref:"userSchema"
    }
})

const userModel = mongoose.model("user",userSchema);
const postModel = mongoose.model("post",postSchema);

module.exports={
    userModel,
    postModel
}