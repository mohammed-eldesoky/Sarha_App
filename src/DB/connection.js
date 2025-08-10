import mongoose from "mongoose";

export const connectDB = async () => {
mongoose.connect("mongodb://127.0.0.1:27017/sarha_app")
.then(() => {
  console.log("MongoDB connected successfully");

})
.catch((error) => {
  console.error("MongoDB connection failed:", error);
});

}