const express = require("express");
const router = express.Router();
import { upload, uploadM } from "../controllers/upload";
import * as rest from "../controllers/restaurants";
import * as validate from "../utils/validations/restValidate";
import * as account from "../middleware/tokenValidate";
router.post(
  "/restaurants/create", upload.array("image", 5), account.tokenValidation, validate.restCreateValidation, rest.createRest, (err: any, req: any, res: any, next: any) => {
    res.status(404).json({
      success: false,
      message: "Some error found",
      error: err.message
    })
  })

router.get("/restaurants", rest.getRests);
router.patch("/restaurants-business-details-update",uploadM, account.tokenValidation,validate.updateBusinessDetailsValidation, rest.updateBusinessDetails);
router.patch('/delete-photos-of-restaurant/:pid', account.tokenValidation, rest.deletePhotosOfRestaurant)//not tested

//// Not done --- need supervision



router.delete("/restaurants-delete", account.tokenValidation, rest.deleteRest);

router.post('/add-category-by-restaurant', upload.single('image'), account.tokenValidation, rest.addCategoryByRestaurant, (err: any, req: any, res: any, next: any) => {
  res.status(404).json({
    success: false,
    message: "Some error found",
    error: err.message
  })
})

//////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.patch('/add-news', upload.single('image'), account.tokenValidation, rest.addLatestNews, (err: any, req: any, res: any, next: any) => {
  res.status(404).json({
    success: false,
    message: "Some error found",
    error: err.message
  })
})


 router.patch('/delete-news/:nid', account.tokenValidation, rest.deleteMyNews)
   router.patch('/update-news/:nid', upload.single('image'), account.tokenValidation, rest.updateMyNews)
 router.get('/get-my-news', account.tokenValidation, rest.getMyNews )

/////  1. open and close restaurant       and also if restaurant logs-out inappropriately        //////////



/////// Bankdetails//////////
router.patch('/enter-bank-details', account.tokenValidation,rest.enterBankDetails)   
router.patch('/update-bank-details', account.tokenValidation,rest.updateBankDetails)    ///Not tested
router.get('/get-dishes-with-pagination', account.tokenValidation,rest.getMyDishesWithPagination) //not tested
router.get('/open-restaurant', account.tokenValidation,rest.openRestaurant)  
router.patch('/close-restaurant', account.tokenValidation, rest.closeRestaurant) 
router.post('/get-dish-on-search', account.tokenValidation, rest.searchFoodDish)  //not tested
router.get('/get-dishes-pagination', account.tokenValidation,rest.getMyDishesWithPagination)

router.post('/search-food-dish', account.tokenValidation,rest.searchFoodDish)
//router.patch('/add-to-today-special/:dishId', account.tokenValidation,rest.addToTS)

//////////////////////////////////////////////////////////////Best offer/////////////////////////////////////////////////////////////////////////////////

router.post('/add-best-offer', upload.single('image'), account.tokenValidation,rest.addNewBestOffer)
router.get('/get-my-offers', account.tokenValidation, rest.getAllMyBestOffers)
router.get('/get-dishes-not-under-any-my-offer', account.tokenValidation,rest.getDishesNotUnderAnyOffer)
router.patch('/add-dish-to-offer/:oid/:dishId', account.tokenValidation,rest.addDishToBestOffer)
router.get('/get-dishes-of-that-offer/:oid',  account.tokenValidation,rest.getDishesOfThatoffer) //not tested
router.patch('/edit-best-offer', account.tokenValidation,rest.editBestOffer)//not tested
router.patch('/delete-dish-from-offer/:dishId', account.tokenValidation,rest.deleteDishFromBestOffer )//not tested
router.patch('/delete-best-offer/:oid',account.tokenValidation,rest.deleteBestOffer ) //not tested

router.patch('/deActivate-all-dishes-best-offer/:oid', account.tokenValidation,rest.deActivateAllDishesFromOffer)//not tested
router.patch('/activate-all-dishes-best-offer/:oid', account.tokenValidation, rest.activateAllDishesFromOffer)//not tested
router.patch('/update-details-popup-best-offer', account.tokenValidation,rest.updateDetailsPopupForDishesInOffer)//not tested
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////Today special screen //////////////////////////////////////////////////////////////////////////////////
router.patch('/add-dish-to-today-special', account.tokenValidation,rest.addDishToTodaySpecial) //not tested
router.patch('/delete-dish-from-today-special', account.tokenValidation, rest.deleteDIshFromTodaySpecial)  // not tested
router.get('/today-special-dishes', account.tokenValidation,rest.getTodaySpeciaDishes)  // not tested
export default router;
