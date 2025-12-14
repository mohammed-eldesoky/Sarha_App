import { Schema, model } from 'mongoose';

//user schema

const schema = new Schema({
firstName:{
    type: String,
    required: true,
    trim: true,
    lowercase: true
},
lastName:{
    type: String,
    required: true,
    trim: true,
    lowercase: true
},
email:{
    type: String,
    required: function(){
        if(this.phoneNumber){
            return false; // If phoneNumber is provided, email is not required
        }
        return true;
    },    //function return value
    unique: true,
    trim: true,
    lowercase: true
},
password:{
    type: String,
    required: function(){
        if(this.userAgent=="google"){
          return false
        }
        return true;
    },

},
phoneNumber:{
    type: String,
    required:function (){
        if(this.email){
            return false; // If email is provided, phoneNumber is not required
        }
        return true;
    },
    unique:true,
     sparse: true,
},
isVerified:{
    type:Boolean,
    default:false
},
dob:{
   type:Date 
},
otp:{
    type:Number,
},
otpExpiration:{
    type:Date,
},
userAgent:{
    type:String,
    enum:["local","google"],
    default:"local"
},
//case cloud
profilePic:{
  secure_url:String,
  puplic_id: String
},
refreshToken: { type: String },


failedAttempts: {
  type: Number,
  default: 0,
},
banUntil: {
  type: Date,
},
credentialUpdateAt:{
    type:Date,
    default:Date.now() // 
},
deletedAt: {
    type: Date,
},
nickName:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
}
},
    {timestamps: true,toObject:{virtuals:true},toJSON:{virtuals:true}});

schema.virtual('fullName').get(function(){  //getter
    return `${this.firstName} ${this.lastName}`
});

schema.virtual('fullName').set(function(value){   //setter
    const [firstName, lastName] = value.split(' ');
    this.firstName = firstName;
    this.lastName = lastName;
})

// clculate the age 

schema.virtual('age').get(function(){
   return new Date().getFullYear() -new Date(this.dob).getFullYear()
})

schema.virtual('messages', {
    ref: 'Message',
    localField: '_id',
    foreignField: 'receiver',
});

export const User =model('User',schema)
