const express = require("express");
const router = express.Router();
import { upload, uploadM } from "../controllers/upload";
import * as food from "../controllers/food";
import * as account from "../middleware/tokenValidate";
import * as foodDishVal from '../utils/validations/foodDishValidation'

router.post(
  "/food-create",
  
  upload.array("image",5),
    account.tokenValidation,
foodDishVal.foodDishValidate,
  food.addFoodDish
);
router.delete('/delete-food-dish/:dishId', account.tokenValidation,food.deleteFoodDish)

router.patch('/update-food-dish/:dishId',uploadM, account.tokenValidation,food.updateFoodDish)
router.patch('/activate-food-dish/:dishId', account.tokenValidation,food.activateFoodDish)
router.patch('/deactivate-food-dish/:dishId', account.tokenValidation,food.deactivateFoodDish)
router.patch('/operate-on-all-dishes', account.tokenValidation,food.operateAllDishes)
///////// 1. Activate food dish //  
// router.get("/foods", account.isSeller, food.findFood);
// router.get("/food", account.isSeller, food.findFoodFilter);
export default router;
