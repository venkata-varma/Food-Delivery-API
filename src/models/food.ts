import mongoose, { Schema, Model } from "mongoose";

const imageSch = new Schema(
  {
    url: { type: String },
    cloudinaryId: { type: String },
    index: Number
  },
  { versionKey: false, timestamps: true }
);


const Food = new mongoose.Schema({
  dishName: {
    type: String,

  },
  category: {
    type: String,

  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category'
  },
  cuisine: String,
  underAnyBestOffer: {
    type: Boolean,
    default: false
  },

  bestOfferId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'bestOffers',
    default: null

  },
  bestOfferName: {
    type: String,
    default: null
  },
  bestOfferStatus: {
    type: Boolean,
    default: false
  },
  veg: Boolean,
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Restaurants",
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Users"
  },
  restaurantName: String,
  restaurantStatus: Boolean,
  description: {
    type: String,
    required: true,
  },
  price: {
    type: String,
  },
  currency: String,
  offerPrice: String,
  smallPrice: String,
  mediumPrice: String,
  largePrice: String,
  smallOfferPrice: String,
  mediumOfferPrice: String,
  largeOfferPrice: String,
  review: [{
    userName: String,

    userId:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users'
    },
    opinion: String,
    rating: String,
    
    reviewedAt: Date,
    suggest: String,
    images: [{
      imageUrl: String,
      cloudinaryId: String,
      index: Number
    }]
  }],

  avgRating: {
    type: Number,
    required: true,
    default: 0,
  },

  weight: String,

  active: {
    type: String,
    enum: ["active", "inactive"],
    default: "inactive"
  },
  packingCharge: String,
  itsOrders: {
    type: Number,
    default: 0
  },
  todaySpecial: Boolean,
  todaySpecialPrice:String,
  images: [imageSch]

},
  { versionKey: false, timestamps: true }
);

Food.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const foodSchema = mongoose.model("Food", Food);
export default foodSchema;
