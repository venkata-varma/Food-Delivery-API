import mongoose from "mongoose";

export const connectDB = async (url: any) => {
  mongoose.set("strictQuery", false);
  return await mongoose
    .connect(url)
    .then(() => console.log("Connected to the database"))
    .catch((err) => console.log(err));
};
