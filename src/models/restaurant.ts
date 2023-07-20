import mongoose, { Schema, Model } from "mongoose";

const image = new Schema(
  {
    url: { type: String },
    cloudinaryId: { type: String },
    index:Number
  },
  { versionKey: false, timestamps: true }
);


const Restaurant = new Schema(
  {
    usefulId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true
    },
    businessName: {
      type: String,
    },
    ownerName: {
      type: String,
    },
    cuisine: String,
    address: {
      type: String,
    },
    state: String,
    country: String,
  
    mobileNum: String,
    totalRating: Number,
    openTime:String,
    closeTime:String,
    openNow: {
      type: Boolean,
      default: false
    },

    gstinNo: {
      type: String,
    },
    images: [image],                         

    emailId: {
      type: String,
    },
    review: [{

      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        default: '63e4ed944e72b9a8e2939784'
      },
      userName: {
        type: String,
        default: "Zomato"
      },
      opinion: {
        type: String,
        default: "Fancy"
      },
      rating: {
        type: String,
        default: '4.0'
      },
      suggest: {
        type: String,
        default: 'Nothing'
      },
      reviewedAt: {
        type: Date,
        default: new Date()
      },
      images: [{
        imageUrl: String,
        cloudinaryId:String,
        index:Number
      }]


    }],
    team: [{
      teamMember: {
        type: String,
      },
      designation: String,
      image: String
    }],
    latestNews: [{
      image: String,
      businessName:String,
      sellerId:mongoose.Schema.Types.ObjectId,
      restId: mongoose.Schema.Types.ObjectId,
      openNow:Boolean,
      title: String,
      description: String,
      cloudinaryId: String,
      importantDate:String,
      fromDate:String,
      toDate:String,
      createDate: String,
      isDeleted: {
        type: Boolean,
        default: false
      },
      expiryDate: String
    }],

bankAccountNumber:Number,
accountHolderName:String,
ifscCode:String,
bankName:String,
branch:String,
upiId:String

  },
  { versionKey: false, timestamps: true }
);

Restaurant.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const restSchema = mongoose.model("Restaurants", Restaurant);
export default restSchema;
