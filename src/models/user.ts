import mongoose, { Schema, Model } from "mongoose";

const User = new Schema(
  {
    name: {
      type: String,
    },
    mobileNum: {
      type: String,
    },
    emailId: {
      type: String,
    },
    password: {
      type: String,
    },
    confirmPassword: {
      type: String,
    },
    state: {
      type: String,
      enum: {
        values: [
          "Andhra Pradesh",
          "Arunachal Pradesh",
          "Assam",
          "Bihar",
          "Chhattisgarh",
          "Goa",
          "Gujarat",
          "Haryana",
          "Himachal Pradesh",
          "Jammu and Kashmir",
          "Jharkhand",
          "Karnataka",
          "Kerala",
          "Madhya Pradesh",
          "Maharashtra",
          "Manipur",
          "Meghalaya",
          "Mizoram",
          "Nagaland",
          "Odisha",
          "Punjab",
          "Rajasthan",
          "Sikkim",
          "Tamil Nadu",
          "Telangana",
          "Tripura",
          "Uttar Pradesh",
          "West Bengal",
        ],
      },
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      distance: {
        type: Number,
      },
      coordinates: []},
    country: String,
    address: String,

    role: {
      type: Number,
      enum: {
        values: [0, 1, 2], //0-seller, 1 - customer  2-Admin
      },
    },
    favDishes: [{
      dishId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food"
      },
      lastOrderDate: Date
    }],
    favRestaurants: [{
      restId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurants"
      },
    }],

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurants'
    },
    otp: {
      type: Number,
    },
    otpForPasswordChange: Number,

    image: {
      type: String,
    },
    cloudinaryId: {
      type: String,
    },
    welome50Applied: {
      type: Boolean,
      default: false
    }
  },
  { versionKey: false, timestamps: true }
);

User.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id,
      delete ret.password,
      delete ret.confirmPassword,
      delete ret.otp;
  },
});
User.index({location:"2dsphere"})
const userSchema = mongoose.model("Users", User);
export default userSchema;
