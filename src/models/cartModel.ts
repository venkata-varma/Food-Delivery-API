import mongoose from 'mongoose'

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    userName: String,
    dishes: [{
        
        dishId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Food'
        },
        quantity: Number,
        price: Number,
        currency: String,
        dishName: String,
        addSuggestion: String,

        indexId: String
    }],

    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurants'
    },
    restaurantName: String,
    

    totalCartPrice: Number,
    currency: String
},
    { timestamps: true }
)

const cartModel = mongoose.model('cartModel', cartSchema)
export default cartModel
