import mongoose, { Schema, model } from 'mongoose'


const bestOffersSchema = new Schema({
    restId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurants"
    },
    offer: [{
        headLine: String,
        description: String,
  
        active: {
            type: Boolean,
            default: false
        },
        image: String,
        cloudinaryId: String
    }],

},
)

const bestOffersModel = model('bestOffers', bestOffersSchema)
export default bestOffersModel

