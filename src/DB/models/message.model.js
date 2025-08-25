import { model, Schema } from "mongoose";

//schema
const schema = new Schema(
  {
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required:true
    },
    content: {
      type: String,
      minlength: 5,
      maxlength: 1000,
      required: function(){
        if(this.attachments.length >0){
return false
        }
        return true
      },
    }, //optional if attachments
    attachments: [{ secure_url: String, public_id: String }],
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

  },
 
  { timestamps: true }
);

//model

export const Message = model("Message", schema);
