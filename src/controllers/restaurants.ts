import { Request, Response, NextFunction } from "express";
import foodSchema from "../models/food";
import { ResolvePathType } from "mongoose/types/inferschematype";


import categorySchema from "../models/category";
import restSchema from "../models/restaurant";
import bestOffersModel from "../models/bestOffers";

let cloud = require("../utils/cloudinary");

export const createRest = async (req: Request, res: Response) => {
  try {

    if (req.body.user) {
      return res.status(404).json({
        message: "Not allowed here"
      })
    }

    const findRest: any = await restSchema.findOne({ $or: [{ emailId: req.body.emailId }, { mobileNum: req.body.mobileNum }, {businessName:req.body.businessName}] });
    if (findRest) {
      return res.status(404).json({ message: "Such restaurant  with details Already exists" })
    }
    if (req.body.emailId !== req.body.seller.emailId || req.body.mobileNum !== req.body.seller.mobileNum) {
      return res.status(404).json({ message: "Mobile num and email are not same as seller " })
    }

    const rest: any = await restSchema.create({

      usefulId: req.body.seller._id,
      ...req.body
    })
    var image: any = [];
    if (req.files) {
      let img = JSON.parse(JSON.stringify(req.files));
      for (let i = 0; i < img.length; i++) {
        let result = await cloud.uploader.upload(img[i].path);
        image.push({
          url: result.secure_url,
          cloudinaryId: result.public_id,
          index: i
        });
      }
    }
    rest.images = image
    await rest.save()
    req.body.seller.restaurantId = rest._id
    await req.body.seller.save()
    res.status(200).json({ message: "Restaurant added", rest });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const updateBusinessDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body.user) {
      return res.status(404).json({
        success: false,
        message: "You are not seller. You are not allowed to this "
      })
    }
    if (req.body.seller) {
      var reqimages: any = req.files
      const rest: any = await restSchema.findOne({ usefulId: req.body.seller && req.body.seller._id })
      const { businessName, ownerName, cuisine }: any = req.body

      
      for (let i = 0; i < 5; i++) {
        if (
          reqimages[`image${i}`] &&
          reqimages[`image${i}`][0].fieldname === `image${i}`
        ) {
          const result = await cloud.uploader.upload(
            reqimages[`image${i}`][0].path
          );
          let data =await rest.images.find((val: any) => val.index === i);
          data.url = result.secure_url;
          data.cloudinaryId = result.public_id;
        }
      }

      rest.businessName = businessName
      rest.ownerName = ownerName
      rest.cuisine = cuisine


      await rest.save()
      res.status(200).json({
        success:true,
        rest
      })

    }
  } catch (Err: any) {
    return res.status(400).json({ message: Err.message });
  }
}

export const deletePhotosOfRestaurant = async (req: Request, res: Response, next: NextFunction) => {
  try {

    if (req.body.user) {
      return res.status(404).json({
        message: "Not allowed here"
      })
    }
    const { pid }: any = req.params
    const rest: any = await restSchema.findOne({ usefulId: req.body.seller && req.body.seller._id })
    const inde: any = rest.images.find((imi: any) => imi._id.toString() === pid)
    inde.url = null
    inde.cloudinaryId = null
    await rest.save()
    res.status(200).json({
      success: true,
      rest
    })
  } catch (Err: any) {
    return res.status(400).json({ message: Err.message })
  }
}

export const getRests = async (req: Request, res: Response) => {
  try {
    const rests = await restSchema.find({});
    return res.status(200).json({ restaurants: rests });
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};


export const deleteRest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const findRestToDel: any = await restSchema.deleteOne({
      _id: id,
    });
    if (findRestToDel.deletedCount > 0) {
      return res.status(200).json({ message: "Restaurant deleted!" });
    } else {
      return res.status(404).json({ message: "Restaurant not found!" });
    }
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

export const addCategoryByRestaurant = async (req: Request, res: Response, next: NextFunction) => {
  try {

    if (req.body.user) {
      return res.status(404).json({
        message: "Not allowed here"
      })
    }
    if (req.body.addNewCategory) {
      if (req.file) {
        let result = await cloud.uploader.upload(req.file.path);
        var dimage = result.secure_url;
        var dcid = result.public_id;
      }
      const cat: any = await categorySchema.create({
        title: req.body.addNewCategory,
        image: dimage
      })
      res.status(200).json({
        success: true,
        cat
      })
    }
  } catch (err: any) {
    res.status(404).json({
      success: false,
      message: err.message
    })
  }
}


/////////////////////////ADD LATEST NEWS /////////////////////////////////////////////////////////////////////////////
export const addLatestNews = async (req: Request, res: Response) => {
  try {

    if (req.body.user) {
      return res.status(404).json({
        message: "Not allowed here"
      })
    }
    if (req.file) {
      let result = await cloud.uploader.upload(req.file.path);
      var dimage = result.secure_url;
      var dcid = result.public_id;
    }
    if (req.body.from === req.body.to) {
      var id: any = req.body.to
    } else {
      var id = null
    }
    if (!req.body.title || !req.body.description || !req.body.expiryDate) {
      return res.status(400).json({
        message: "Enter all mandatory details"
      })
    }
    const rest: any = await restSchema.findOne({ usefulId: req.body.seller && req.body.seller._id })
    const news: any = {
      title: req.body.title,
      description: req.body.description,
      importantDate: id,
      fromDate: req.body.from,
      toDate: req.body.to,
      createDate: new Date().toLocaleString('eN-In'),
      expiryDate: req.body.expiryDate,
      image: dimage,
      cloudinaryId: dcid,
      businessName: rest.businessName,
      sellerId: rest.usefulId,
      openNow: rest.openNow,
      restId: rest._id
    }

    rest.latestNews = rest.latestNews.concat(news)
    await rest.save()
    res.status(200).json({
      rest
    })


  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })

  }
}

export const updateMyNews = async (req: Request, res: Response) => {
  try {
    if (req.body.user) {
      return res.status(404).json({
        message: "Not allowed here"
      })
    }
    const rest: any = await restSchema.findOne({ usefulId: req.body.seller && req.body.seller._id })
    const news: any = await rest.latestNews.find((okNews: any) => okNews._id.toString() === req.params.nid)
    if (req.file) {
      let result = await cloud.uploader.upload(req.file.path);
      var dimage = result.secure_url;
      var dcid = result.public_id;
    }
    if (req.body.fromDate === req.body.toDate) {
      var id: any = req.body.toDate
    } else {
      var id = null
    }
    news.title = req.body.title
    news.description = req.body.description
    news.fromDate = req.body.fromDate
    news.importantDate = id
    news.toDate = req.body.toDate
    news.expiryDate = req.body.expiryDate
    news.image = dimage
    news.cloudinaryId = dcid
    news.createDate = new Date().toLocaleString('eN-In')

    await rest.save()
    res.status(200).json({
      success: true,
      rest
    })

  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message
    })
  }
}



export const deleteMyNews = async (req: Request, res: Response) => {
  try {
    if (req.body.userr) {
      return res.status(404).json({
        message: "Not allowed here"
      })
    }
    const rest: any = await restSchema.findOne({ usefulId: req.body.seller && req.body.seller._id })
    const news: any = await rest.latestNews.findIndex((okNews: any) => okNews._id.toString() === req.params.nid)
    rest.latestNews.splice(news, 1)
    await rest.save()
    res.status(200).json({
      success: true,
      rest
    })

  } catch (Err: any) {
    res.status(400).json({
      success: false,
      message: Err.message
    })
  }
}

export const getMyNews = async (req: Request, res: Response) => {
  try {
    if (req.body.userr) {
      return res.status(404).json({
        message: "Not allowed here"
      })
    }
    const rest: any = await restSchema.findOne({ usefulId: req.body.seller && req.body.seller._id })
    const todate: any = new Date().toLocaleString('eN-In').slice(0, 9)
    var filtered: any = rest.latestNews.filter((news: any) => todate <= news.expiryDate)
    res.status(200).send(filtered.sort(
      (p1: any, p2: any) =>
        (p1.createDate > p2.createDate) ? 1 : (p1.createDate < p2.createDate) ? -1 : 0));





  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message
    })
  }
}

export const getRestaurantByRestIdInParams = async (req: Request, res: Response) => { }

export const enterBankDetails = async (req: Request, res: Response) => {
  try {

    if (req.body.userr) {
      return res.status(404).json({
        message: "Not allowed here"
      })
    }
    if (!req.body.upiId.includes('@')) {
      return res.status(400).json({
        message: "ENter valid UPI Id "
      })
    }
    const rest: any = await restSchema.findOneAndUpdate({ usefulId: req.body.seller && req.body.seller._id }, {
      $set: {
        bankAccountNumber: req.body.accountNumber,
        accountHolderName: req.body.accountHolderName,
        ifscCode: req.body.ifsc,
        bankName: req.body.bankName,
        branch: req.body.branch,
        upiId: req.body.upiId
      }
    }, { new: true, runValidators: true })
    res.status(200).json({
      rest
    })

  } catch (err: any) {
    res.status(404).json({
      success: false,
      message: err.message
    })

  }
}
export const updateBankDetails = async (req: Request, res: Response) => {
  try {

    if (req.body.userr) {
      return res.status(404).json({
        message: "Not allowed here"
      })
    }
    const rest: any = await restSchema.findOneAndUpdate({ usefulId: req.body.seller && req.body.seller._id }, {
      $set: {
        bankAccountNumber: req.body.accountNumber,
        accountHolderName: req.body.accountHolderName,
        ifscCode: req.body.ifsc,
        bankName: req.body.bankName,
        branch: req.body.branch,
        upiId: req.body.upiId
      }
    }, { new: true, runValidators: true })
    res.status(200).json({
      rest
    })

  } catch (err: any) {
    res.status(404).json({
      success: false,
      message: err.message
    })

  }
}

export const openRestaurant = async (req: Request, res: Response) => {
  try {

    if (req.body.userr) {
      return res.status(404).json({
        message: "Not allowed here"
      })
    }
    if (req.body.seller) {
      const openRest: any = await restSchema.findOneAndUpdate({ usefulId: req.body.seller && req.body.seller._id }, { $set: { openNow: true } }, { new: true, runValidators: true })
      res.status(200).json({
        success: true,
        message: "Yoou will be redirected to dishes screen"
      })
    }
  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })


  }
}

export const closeRestaurant = async (req: Request, res: Response) => {
  try {

    if (req.body.userr) {
      return res.status(404).json({
        message: "Not allowed here"
      })
    }
    if (req.body.close) {
      const foods: any = await foodSchema.updateMany({ sellerId: req.body.seller && req.body.seller._id }, { $set: { active: "inactive", restaurantStatus: false, bestOfferStatus: false } }, { new: true, runValidators: true })
      const rest: any = await restSchema.findOneAndUpdate({ usefulId: req.body.seller && req.body.seller._id }, { $set: { openNow: false } }, { new: true, runValidators: true })
      const foos: any = await foodSchema.find({ sellerId: req.body.seller && req.body.seller._id }, '_id dishName active restaurantStatus sellerId restaurantId')
      const offers: any = await bestOffersModel.findOne({ restId: req.body.seller && req.body.seller._id })
      offers.offer.forEach((of: any) => {
        of.active = false
      })
      await offers.save()
      res.status(200).json({
        success: true,
        rest,
        foos,
        offers
      })
    }
  } catch (err: any) {
    res.status(404).json({
      success: false,
      message: err.message
    })
  }
}

export const getMyDishesWithPagination = async (req: Request, res: Response) => {
  try {

    if (req.body.userr) {
      return res.status(404).json({
        message: "Not allowed here"
      })
    }
    let page = Number(req.query.page) || 1
    let limit = Number(req.query.limit) || 3
    const sort: any = req.query.sort
    const asc: any = req.query.asc || -1
    const dsc = req.query.dsc || 1
    const skip = (page - 1) * limit
    const foodDishes: any = await foodSchema.find({ sellerId: req.body.seller && req.body.seller._id }).skip(skip).limit(limit)
    res.status(200).json({
      foodDishes
    })
    // sort({[sort]:asc})
  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }
}

export const searchFoodDish = async (req: Request, res: Response) => {
  try {

    if (req.body.userr) {
      return res.status(404).json({
        message: "Not allowed here"
      })
    }
    const dish: any = await foodSchema.find({ $and: [{ sellerId: req.body.seller && req.body.seller._id }, { dishName: { $regex: `${req.body.searchDish}`, $options: 'i' } }] })
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


// export const addToTS = async (req: Request, res: Response, next: NextFunction) => {
//   try {

//     const dish: any = await foodSchema.findOne({ $and: [{ _id: req.params.dishId }, { sellerId: req.body.seller && req.body.seller._id }] })
//     dish.todaySpecial = req.body.todaySpecial
//     await dish.save()
//     res.status(200).json({
//       success: true,
//       dish
//     })

//   } catch (err: any) {
//     res.status(404).json({             //// this functionality is removed
//       success: false,
//       message: err.message
//     })
//   }
// }

export const addNewBestOffer = async (req: Request, res: Response) => {
  try {

    if (req.body.userr) {
      return res.status(404).json({
        message: "Not allowed here"
      })
    }
    if (req.file) {
      let result = await cloud.uploader.upload(req.file.path);
      var dimage = result.secure_url;
      var dcid = result.public_id;
    }
    const offerArray: any = {
      headLine: req.body.headLine,
      description: req.body.description,

      image: dimage,
      cloudinaryId: dcid
    }
    const bo: any = await bestOffersModel.create({
      restId: req.body.seller._id
    })
    bo.offer = bo.offer.concat(offerArray)
    await bo.save()
    res.status(200).json({
      success: true,
      bo
    })

  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }
}

export const getDishesNotUnderAnyOffer = async (req: Request, res: Response) => {
  try {

    if (req.body.userr) {
      return res.status(404).json({
        message: "Not allowed here"
      })
    }
    const foods: any = await foodSchema.find({ $and: [{ underAnyBestOffer: false }, { active: "active" }, { restaurantStatus: true }, { sellerId: req.body.seller && req.body.seller._id }] })
    res.status(200).json({
      success: true,
      foods
    })

  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }
}
export const getAllMyBestOffers = async (req: Request, res: Response) => {
  try {

    if (req.body.userr) {
      return res.status(404).json({
        message: "Not allowed here"
      })
    }
    const offers: any = await bestOffersModel.findOne({ restId: req.body.seller && req.body.seller._id })

    res.status(200).json({
      offers
    })
  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }
}
export const addDishToBestOffer = async (req: Request, res: Response) => {
  try {

    if (req.body.userr) {
      return res.status(404).json({
        message: "Not allowed here"
      })
    }
    const offerHello: any = await bestOffersModel.findOne({ restId: req.body.seller && req.body.seller._id })

    const reqoffer: any = await offerHello.offer.find((an: any) => an._id.toString() === req.params.oid)
    const reqOfferId: any = reqoffer._id
    const reqOfferName: any = reqoffer.headLine

    const updFd: any = await foodSchema.findOneAndUpdate({ _id: req.params.dishId }, { $set: { offerPrice: req.body.offerPrice, smallOfferPrice: req.body.smallOfferPrice, mediumOfferPrice: req.body.mediumOfferPrice, largeOfferPrice: req.body.largeOfferPrice, underAnyBestOffer: true, bestOfferId: reqOfferId, bestOfferName: reqOfferName, bestOfferStatus: true } }, { new: true, runValidators: true })
    reqoffer.active = true
    await offerHello.save()
    res.status(200).json({
      updFd,
      reqoffer
    })

  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }
}

export const getDishesOfThatoffer = async (req: Request, res: Response) => {
  try {

    if (req.body.userr) {
      return res.status(404).json({
        message: "Not allowed here"
      })
    }
    const fds: any = await foodSchema.find({ $and: [{ sellerId: req.body.seller && req.body.seller._id }, { bestOfferId: req.params.oid }] })
    res.status(200).json({
      fds
    })
  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }
}

export const editBestOffer = async (req: Request, res: Response) => {
  try {

    if (req.body.userr) {
      return res.status(404).json({
        message: "Not allowed here"
      })
    }
    const myoffers: any = await bestOffersModel.findOne({ restId: req.body.seller && req.body.seller._id })
    if (req.file) {
      let result = await cloud.uploader.upload(req.file.path);
      var dimage = result.secure_url;
      var dcid = result.public_id;
    }

    const reqoffer: any = await myoffers.offer.find((an: any) => an._id.toString() === req.params.oid)

    reqoffer.headLine = req.body.headLine,
      reqoffer.description = req.body.description,
      reqoffer.image = dimage,
      reqoffer.cloudinaryId = dcid
    await myoffers.save()
    res.status(200).json({
      myoffers
    })

  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }
}
export const deleteDishFromBestOffer = async (req: Request, res: Response) => {
  try {

    if (req.body.userr) {
      return res.status(404).json({
        message: "Not allowed here"
      })
    }
    if (req.body.deleteDishFromOffer) {
      var dish: any = await foodSchema.findOneAndUpdate({ _id: req.params.dishId }, { $set: { underAnyBestOffer: false, bestOfferId: null, bestOfferStatus: false, bestOfferName: null, offerPrice: null, smallOfferPrice: null, mediumOfferPrice: null, largeOfferPrice: null } }, { new: true, runValidators: true })
    }
    res.status(200).json({
      dish
    })


  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }
}

export const deleteBestOffer = async (req: Request, res: Response) => {
  try {

    if (req.body.userr) {
      return res.status(404).json({
        message: "Not allowed here"
      })
    }
    if (req.body.deleteBestOffer) {
      const myOffer: any = await bestOffersModel.findOne({ restId: req.body.seller && req.body.seller._id })
      var myBoy: any = await myOffer.offer.findIndex((off: any) => off._id.toString() === req.params.oid)
      var myBo: any = await myOffer.offer.find((off: any) => off._id.toString() === req.params.oid)
      myOffer.offer.splice(myBo, 1)
      const fds: any = await foodSchema.updateMany({ $and: [{ underAnyBestOffer: true, bestOfferId: myBoy._id }] }, { $set: { underAnyBestOffer: false, bestOfferId: null, bestOfferStatus: false, bestOfferName: null, offerPrice: null, smallOfferPrice: null, mediumOfferPrice: null, largeOfferPrice: null } }, { new: true, runValidators: true })
      await myOffer.save()

    } if (req.body.cancel) {
      res.status(200).json({
        message: "Delete option is not selected,SO, everything is normal"
      })
    }
  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }
}

export const deActivateAllDishesFromOffer = async (req: Request, res: Response) => {
  try {

    if (req.body.userr) {
      return res.status(404).json({
        message: "Not allowed here"
      })
    }
    if (req.body.deactivateAllDishes) {
      const fds: any = await foodSchema.updateMany({ bestOfferId: req.params.oid }, { $set: { bestOfferStatus: false } }, { new: true, runValidators: true })
      const offers: any = await bestOffersModel.findOne({ restId: req.body.seller && req.body.seller._id })
      const gh: any = await offers.offer.find((ok: any) => ok._id.toString() === req.params.oid)
      gh.active = false
      await offers.save()
      res.status(200).json({
        success: true,
        fds,
        message: "Tomorrow, After logging in and activating dish, normal price will be displayed"
      })
    }

  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }
}

export const activateAllDishesFromOffer = async (req: Request, res: Response) => {
  try {

    if (req.body.userr) {
      return res.status(404).json({
        message: "Not allowed here"
      })
    }

    if (req.body.activate) {
      const fds: any = await foodSchema.updateMany({ bestOfferId: req.params.oid }, { $set: { bestOfferStatus: true } }, { new: true, runValidators: true })
      const offers: any = await bestOffersModel.findOne({ restId: req.body.seller && req.body.seller._id })
      const gh: any = await offers.offer.find((ok: any) => ok._id.toString() === req.params.oid)
      gh.active = true
      await offers.save()

      res.status(200).json({
        success: true,
        fds,
        message: "Offer is active, offer price is active"
      })
    }


  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }
}

export const updateDetailsPopupForDishesInOffer = async (req: Request, res: Response) => {
  try {

    if (req.body.userr) {
      return res.status(404).json({
        message: "Not allowed here"
      })
    }
    var status: any
    if (req.body.enable) {
      status = true
    } else if (req.body.disable) {
      status = false
    }
    const fd: any = await foodSchema.findOneAndUpdate({ bestOfferId: req.params.oid }, { $set: { offerPrice: req.body.offerPrice, bestOfferStatus: status } }, { new: true, runValidators: true })
    const offers: any = await bestOffersModel.findOne({ restId: req.body.seller && req.body.seller._id })
    const gh: any = await offers.offer.find((ok: any) => ok._id.toString() === req.params.oid)
    gh.active = status
    await offers.save()
    res.status(200).json({
      fd,
      gh
    })

  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }
}

//////////////////////// Today special screen //////////////////////////////////

export const addDishToTodaySpecial = async (req: Request, res: Response) => {
  try {

    if (req.body.userr) {
      return res.status(404).json({
        message: "Not allowed here"
      })
    }
    const dish: any = await foodSchema.findOneAndUpdate({ $and: [{ _id: req.params.dishId }, { sellerId: req.body.seller && req.body.seller._id }] }, { $set: { todaySpecial: true, todaySpecialPrice: req.body.todaySpecialPrice } }, { new: true, runValidators: true })
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

///////////////////// Not clear whether to state the above API also for Updating also//////////////
export const updateDetailsPopupOfTodaySpecialDishes = async (req: Request, res: Response) => {
  try {

    if (req.body.userr) {
      return res.status(404).json({
        message: "Not allowed here"
      })
    }
    const dish: any = await foodSchema.findByIdAndUpdate(req.params.dishId, { $set: { todaySpecialPrice: req.body.todaySpecialPrice } }, { new: true, runValidators: true })
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
//////////////////////////////////////////////////////////////////////////////////////////////////////////

export const deleteDIshFromTodaySpecial = async (req: Request, res: Response) => {
  try {

    if (req.body.userr) {
      return res.status(404).json({
        message: "Not allowed here"
      })
    }
    const deleteDishFromTS: any = await foodSchema.findOneAndUpdate({ $and: [{ _id: req.params.dishId }, { sellerId: req.body.seller && req.body.seller._id }] }, { $set: { todaySpecial: false, todaySpecialPrice: null } }, { new: true, runValidators: true })
    res.status(200).json({
      success: true,
      deleteDishFromTS
    })
  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }

}

export const getTodaySpeciaDishes = async (req: Request, res: Response) => {
  try {

    if (req.body.userr) {
      return res.status(404).json({
        message: "Not allowed here"
      })
    }
    const todatSpecialDishes = await foodSchema.find({ $and: [{ todaySpecial: true }, { sellerId: req.body.seller && req.body.seller._id }] })

    res.status(200).json({
      success: true,
      todatSpecialDishes
    })

  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }
}