const express=require('express');
const app=express();
const mongoose=require("mongoose");
require('dotenv').config()
const port=process.env.PORT
var cors = require('cors');
app.use(cors());
//for handling json 
app.use(express.json());
//for post request 
app.use(express.urlencoded({extended:true}))

//mongo DB Connection 
const connectDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
       
      console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  };
connectDB();

// listening to the port 
app.listen('5000',(req,res)=>{ 
 console.log(`SERVER RUNNING ON http://localhost:${5000}/`);
});

app.use('/api',require('./routes/student'));
