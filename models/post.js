const mongoose = require("mongoose");

const schema = mongoose.Schema;
const objectId = schema.ObjectId;

const postSchema = new schema({
    content:{
        type:String,
    },
    likes:[{
        type:objectId,
        ref:"user"
    }],
    time:{
        type:Date,
        default:Date.now
    },
    user:{
        type:objectId,
        ref:"user"
    }
})


const postModel = mongoose.model("post",postSchema);
module.exports={
    postModel
}