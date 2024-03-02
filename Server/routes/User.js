//requiring the models
const express=require("express");
const router=express.Router();
const User=require("../model/User");
const passport=require("passport");

//controllers
const user=require("../Controllers/User")
//apis 



router.post("/register",user.register);




router.post("/login",passport.authenticate("local"),user.login),

module.exports=router;