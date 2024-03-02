const User = require('../model/User');

module.exports.register=async(req,res)=>{
    try{
    const {username,email,password}=req.body;
    const user=new User({
        email,username
    })
    //passport has this funcationality 
    //where it has a function called register(variable,password) which 
    //saves the user in the db
    const registeredUser=await User.register(user,password);

    //abb user jab register karta he should be able to use features
    //par it asking for login 
    //therefore theres a methoad called "req.login" which login in the user in the session
   
    }
    catch(err)
    {
        console.log(err);
    }
  
}
module.exports.login=(req,res)=>{
    console.log("SUCESS USER IS VERIFIED")
}