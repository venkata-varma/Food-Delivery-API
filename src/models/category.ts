import mongoose, { Schema, Model } from "mongoose";

const Category = new Schema(
  {
    image: {
      type: String,
    },
    cloudinaryId: {
      type: String,
    },
    title: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);

Category.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const categorySchema = mongoose.model("category", Category);
export default categorySchema;
