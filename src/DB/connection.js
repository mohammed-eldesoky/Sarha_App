import mongoose from "mongoose";

export const connectDB = async () => {
mongoose.connect(process.env.DB_URL)
.then(() => {
  console.log("MongoDB connected successfully");

})
.catch((error) => {
  console.error("MongoDB connection failed:", error);
});

}