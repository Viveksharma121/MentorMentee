//user model

//require mongoose
const mongoose=require("mongoose");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const Schema = mongoose.Schema;



//schema me email hi dall rahe 
//as username and password are by default pluggedin passport
const UserSchema= new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    credits: {
        type: Number,
        default: 0
    }
});

//plugg in username and password
UserSchema.plugin(passportLocalMongoose);



const User= mongoose.model("User", UserSchema);
module.exports=User;