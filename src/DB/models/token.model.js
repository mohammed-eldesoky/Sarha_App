

import { model, Schema } from "mongoose";

const schema =new Schema({

token:String,

user:{
type:Schema.Types.ObjectId,
ref:"User",
},

type:{
    type:String,
    enum:["access","refresh"],
},
   expiresAt: {
      type: Date,
   
    },

},{timestamps:true});


export const Token =model("Token",schema)
