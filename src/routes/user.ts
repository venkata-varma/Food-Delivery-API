const express = require("express");
const router = express.Router();
import * as auth from "../controllers/auth";
import * as validates from "../utils/validations/userValidate";
import * as hello from '../middleware/tokenValidate'
import { upload, uploadM, uploadT } from "../controllers/upload";


router.post("/register", validates.userValidationRegister, auth.register);
router.post("/verify", auth.otpVerify);
router.post("/login", validates.userValidationLogin, auth.login);
router.post("/forgot-password", auth.forgotPassword);
router.post('/otp-verify-for-forgot-password-change/:id', auth.otpVerifyForForgotPass)
router.post("/change-password", hello.tokenValidation, auth.changePasswordRadio);

router.patch("/update-profile", upload.single("image"), hello.tokenValidation,validates.updateProfileValidation, auth.updateProfileRadio, (err: any, req: any, res: any, next: any) => {
    res.status(404).json({
        success: false,
        message: "Some error found",
        error: err.message
    })
});

router.patch('/otp-change-mobile-radio', hello.tokenValidation,validates.mobileNumValidation,  auth.otpForChangeMobileRadio)
router.patch('/otp-verify-change-mobile-radio', hello.tokenValidation, auth.otpVerifyChangeMobile)

router.delete("/delete-my-profile", hello.tokenValidation, auth.deleteProfile);

//router.get('/get-dishes-of-that-restaurant/:restId', hello.tokenValidation, auth.getDishesOfRestaurant)
router.get('/get-reviews-of-restaurant/:restId', hello.tokenValidation, auth.getReviewsForRestaurant)
router.post('/post-review-restaurant/:restId',upload.array('image', 3), hello.tokenValidation, auth.userPostReviewForRest)

router.patch('/update-my-review-to-restaurant/:restId',uploadT, hello.tokenValidation,auth.updateMyReviewToARest)

router.post('/add-review-to-food-dish/:dishId',uploadM,  hello.tokenValidation, auth.reviewFoodDish)
router.get('/get-fav-dishes', hello.tokenValidation, auth.getMyFavDishes)
router.post('/add-restaurant-to-fav', hello.tokenValidation, auth.addRestaurantToFav)
router.get('/get-my-fav-restaurants', hello.tokenValidation, auth.getMyFavRestaurants)
//router.get('/get-all-latest-news', hello.tokenValidation, auth.getAllLatestNews)
router.post('/add-foodDishes-to-fav-order-time', hello.tokenValidation,auth.addDishesToFavAtOrder)   ///Not testted
router.post('/add-foodDishes-to-fav', hello.tokenValidation,auth.addFoodDishToFav)  //Not tested
router.get('/get-latest-news', hello.tokenValidation, auth.getLatestNews)
router.post('/user-get-location-button', hello.tokenValidation, auth.usersLocation)
export default router;
