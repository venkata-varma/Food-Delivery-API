import { NextFunction, Request, Response } from "express";
import foodSchema from "../models/food";
let cloud = require("../utils/cloudinary");
import userSchema from '../models/user'
import restSchema from "../models/restaurant";
import categorySchema from "../models/category";


export const addFoodDish = async (req: Request, res: Response) => {
  try {
    const seller: any = await userSchema.findOne({ _id: req.body.seller._id })
    const rest: any = await restSchema.findOne({ usefulId: req.body.seller._id })
    // res.json({
    //   sellerId:seller._id,
    //   restId:rest._id,
    //   useFulId:rest.usefulId
    // })
    const catI: any = await categorySchema.findOne({ title: req.body.category })
    const alreadyDish: any = await foodSchema.findOne({ $and: [{ sellerId: req.body.seller && req.body.seller._id }, { dishName: req.body.dishName }] })
    if (alreadyDish) {
      return res.status(400).json({
        success: false,
        message: "Dish already exists"
      })
    }
    const fd: any = await foodSchema.create({
      dishName: req.body.dishName,
      category: req.body.category,
      categoryId: catI._id,
      cuisine: req.body.cuisine,
      weight: req.body.weight,
      veg: req.body.veg,
      price: req.body.price,
      smallPrice: req.body.smallPrice,
      mediumPrice: req.body.mediumPrice,
      largePrice: req.body.largePrice,
      restaurantId: rest._id,
      sellerId: seller._id,
      restaurantName: rest.businessName,
      restaurantStatus: rest.openNow,
      description: req.body.description,

      currency: req.body.currency
    })
    var image: any = [];
    if (req.files) {
      let img: any = JSON.parse(JSON.stringify(req.files));
      for (let i = 0; i < img.length; i++) {
        let result = await cloud.uploader.upload(img[i].path);
        image.push({
          url: result.secure_url,
          cloudinaryId: result.public_id,
          index: i
        });
      }
    }
    fd.images = image
    await fd.save()

    res.status(200).json({
      success: true,
      fd
    })
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const deleteFoodDish = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const foodDish: any = await foodSchema.findOneAndDelete({ $and: [{ _id: req.params.dishId }, { sellerId: req.body.seller._id }] })
    res.status(200).json({
      success: true,
      foodDish
    })

  } catch (err: any) {
    return res.status(400).json({ message: err.message })
  }
}




export const findFood = async (req: Request, res: Response) => {
  try {
    const getFood = await foodSchema.find({});
    if (!getFood) {
      throw "No foods found";
    }
    return res.status(200).json({ total: getFood.length, data: getFood });
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

export const findFoodFilter = async (req: Request, res: Response) => {
  try {
    let queryObj: any = {};
    let type: any = req.query.type;
    if (type) {
      queryObj.foodCat = type;
    }
    const getFood = foodSchema.find(queryObj);
    let result = await getFood;
    if (!result) {
      throw "No foods found";
    }
    return res.status(200).json({ total: result.length, data: result });
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

//not tested
export const updateFoodDish = async (req: Request, res: Response) => {
  try {
    if (req.body.user) {
      return res.status(404).json({
        success: false,
        message: "You are not seller. You are not allowed to this "
      })
    }
    const rest: any = await restSchema.findOne({ _id: req.body.seller && req.body.seller._id })
    const dishLany = await foodSchema.findOne({ $and: [{ _id: req.params.dishId }, { sellerId: req.body.seller && req.body.seller._id }] })
    if (req.body.seller) {
      var reqimages: any = req.files

      for (let i = 0; i < 5; i++) {
        if (
          reqimages[`image${i}`] && reqimages[`image${i}`][0].fieldname === `image${i}`   ) {
          const result = await cloud.uploader.upload(
            reqimages[`image${i}`][0].path
          );
          let data = await dishLany.images.find((val: any) => val.index === i);
          data.url = result.secure_url;
          data.cloudinaryId = result.public_id;
        }
      }
}

await dishLany.save()
    var dish: any
    var updRest: any
    if(req.body.dishName){
       const foodCat = await foodSchema.findOne({ $and: [{dishName:req.body.dishName }, { sellerId: req.body.seller && req.body.seller._id }] })
       if(foodCat){
        return res.status(400).json({
          success:false,
          message:"DIsh name already exists among your dishes"
        })
       }
    }
    if (req.body.defaultStatus === 'active') {
      dish = await foodSchema.findOneAndUpdate({ _id: req.params.dishId }, { $set: { ...req.body, active: 'active', restaurantStatus: true } }, { new: true, runValidators: true })

      updRest = await restSchema.findOneAndUpdate({ usefulId: req.body.seller._id }, { $set: { openNow: true } }, { new: true, runValidators: true })

    } else if (req.body.defaultStatus === 'inactive') {
      dish = await foodSchema.findOneAndUpdate({ _id: req.params.dishId }, { $set: { ...req.body, active: 'inactive', restaurantStatus: false } }, { new: true, runValidators: true })

      updRest = await restSchema.findOneAndUpdate({ usefulId: req.body.seller._id }, { $set: { openNow: false } }, { new: true, runValidators: true })

    }
    res.status(200).json({
      success: true,
      dish,
      updRest
    })


  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }
}
//not tested
export const activateFoodDish = async (req: Request, res: Response) => {
  try {
    const dish: any = await foodSchema.findOneAndUpdate({ _id: req.params.dishId }, { $set: { restaurantStatus: true, active: 'active' } }, { new: true, runValidators: true })
    const rest: any = await restSchema.findOneAndUpdate({ usefulId: req.body.seller && req.body.seller._id }, { $set: { openNow: true } }, { new: true, runValidators: true })
    res.status(200).json({
      success: true,
      dish,
      rest
    })

  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }
}

//not tested
export const deactivateFoodDish = async (req: Request, res: Response) => {
  try {
    const dish: any = await foodSchema.findOneAndUpdate({ _id: req.params.dishId }, { $set: { active: 'inactive' } }, { new: true, runValidators: true })
    res.status(200).json({
      success: true,
      dish
    })



  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }
}

export const operateAllDishes = async (req: Request, res: Response) => {
  try {
    if (req.body.activateAll) {
      if (req.body.yes) {
        const actAll: any = await foodSchema.updateMany({ sellerId: req.body.seller && req.body.seller._id }, { $set: { active: 'active', restaurantStatus: true } }, { new: true, runValidators: true })
        const restActi: any = await restSchema.findOneAndUpdate({ usefulId: req.body.seller && req.body.seller._id }, { $set: { openNow: true } }, { new: true, runValidators: true })
        const all: any = await foodSchema.find({ sellerId: req.body.seller && req.body.seller._id }, 'active _id sellerId restaurantId dishName restaurantStatus')
        res.status(200).json({
          success: true,
          all,
          restActi
        })
      }
    } else if (req.body.deActivateAll) {
      if (req.body.yes) {
        const actAll: any = await foodSchema.updateMany({ sellerId: req.body.seller && req.body.seller._id }, { $set: { active: 'inactive', restaurantStatus: false } }, { new: true, runValidators: true })
        const restActi: any = await restSchema.findOneAndUpdate({ usefulId: req.body.seller && req.body.seller._id }, { $set: { openNow: false } }, { new: true, runValidators: true })
        const all: any = await foodSchema.find({ sellerId: req.body.seller && req.body.seller._id }, 'active _id sellerId restaurantId dishName restaurantStatus')
        res.status(200).json({
          success: true,
          all,
          restActi
        })
      }
    }

  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }
}


