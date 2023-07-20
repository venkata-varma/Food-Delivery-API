// register login user schema forgot password verification otp
require("dotenv").config();
import { Response, Request, NextFunction } from "express";
import * as bcrypt from "bcryptjs";
import userSchema from "../models/user";
import { BCRYPT_SALT_ROUND } from "../utils/config";
const accountSid = process.env.SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
import jwt from "jsonwebtoken";
let cloud = require("../utils/cloudinary");
import { getOtp } from "../utils/otp";
import * as val from '../utils/validation'
import restSchema from "../models/restaurant";
import categorySchema from "../models/category";
import foodSchema from "../models/food";
import cartModel from "../models/cartModel"
///////////////////////////////////////////////////////////////////////////
export const register = async (req: Request, res: Response) => {
  try {
    const { mobileNum, emailId, password, confirmPassword } = req.body;
    var role: any
    if (req.body.seller) {
      role = 0
    } else if (req.body.user) {
      role = 1
    }
    const findUser = await userSchema.findOne({
      $and: [{ role },
      {
        $or: [
          {
            mobileNum,
          },
          {
            emailId,
          },
        ]
      }],



    });
    if (findUser) {
      throw "User already exists";
    }
    if (password.length !== 6) {
      throw "password field must be exactly of 6 characters";
    }
    if (mobileNum.length < 10 || mobileNum.length > 10) {
      throw "mobileNum field must be 10 digits";
    }
    if (password !== confirmPassword) {
      return res.status(404).json({
        success: false,
        message: "Passwords should match"
      })
    }
    let oneTimePass = Math.floor(Math.random() * 9000 + 1000);
    let encryptedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUND);
    let data = await userSchema.create({
      ...req.body,
      role,
      password: encryptedPassword,
      confirmPassword: encryptedPassword,
      otp: oneTimePass,
    });
    await data.save();
    let number = data.mobileNum;
    let message: any = "Hello, expiration time"
    getOtp(oneTimePass, mobileNum, message)
    // client.messages
    //   .create({
    //     body: `Thank you for registering. Here is your OTP: ${oneTimePass}`,
    //     from: "+16696006949",
    //     to: mobileNum, // number
    //   })
    //   .then((message: any) => console.log(message.sid));
    return res.status(200).json({ message: "Registration succesfull!", data });
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

export const otpVerify = async (req: Request, res: Response) => {
  try {
    const { mobileNum, otp } = req.body;
    var role: any
    if (req.body.seller) {
      role = 0
    } else if (req.body.user) {
      role = 1
    }
    const findUser = await userSchema.findOne({
      $and: [
        {
          mobileNum,
        },
        {
          role,
        },
      ]
    });
    if (!findUser) {
      throw "User not found";
    }
    if (findUser.otp !== otp) {
      throw "Incorrect otp";
    }
    if (findUser.otp === otp) {
      const token: any = await jwt.sign({ id: findUser._id }, process.env.key, { expiresIn: '1h' })
      return res.status(200).json({ message: "OTP verified", findUser, token });
    }
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { mobileNum, password } = req.body;
    var role: any
    if (req.body.seller) {
      role = 0
    } else if (req.body.user) {
      role = 1
    }
    const findUser = await userSchema.findOne({
      $and: [
        {
          mobileNum,
        },
        {
          role
        }],

    });
    if (!findUser) {
      throw "No user found";
    }
    let pass: any = findUser.password;
    if (!(await bcrypt.compare(password, pass))) {
      return res.status(400).json({ message: "Incorrect password!" });
    }
    const token = await jwt.sign({ id: findUser._id, }, process.env.key, { expiresIn: "1h" });
    return res
      .status(200)
      .json({ message: "Logged in", meta: { token: token }, user: findUser });
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { mobileNum, seller, user } = req.body;
    var role: any
    if (seller) {
      role = 0
    } else if (user) {
      role = 1
    }
    const findUser = await userSchema.findOne({
      $and: [
        {
          mobileNum,
        },
        {
          role
        }],
    });
    if (!findUser) {
      throw "No user found";
    }
    let oneTimePass = Math.floor(Math.random() * 9000 + 1000);
    let number: any = findUser.mobileNum;
    let message: any = "Hello, expiration time"
    getOtp(oneTimePass, number, message)
    findUser.otpForPasswordChange = oneTimePass
    await findUser.save()
    return res
      .status(200)
      .json({ message: "Logged in", findUser, oneTimePass });
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

export const otpVerifyForForgotPass = async (req: Request, res: Response) => {
  try {
    const user: any = await userSchema.findById(req.params.id)
    console.log(user)
    if (user.otpForPasswordChange !== req.body.otp) {
      return res.status(404).json({
        success: false,
        message: "Wrong otp"
      })
    }

    if (!val.isValidPassword(req.body.newPassword) || !val.isValidPassword(req.body.confirm)) {
      throw "Invalid password"
    }
    if (req.body.newPassword.length !== 6 || req.body.confirm.length !== 6) {
      throw "Passwrd must be 6 in length"
    }
    if (req.body.newPassword !== req.body.confirm) {
      throw "Should match"
    }
    const hash: any = await bcrypt.hash(req.body.confirm, 8)
    user.password = hash
    user.confirmPassword = hash
    await user.save()
    res.status(200).json({ user })


  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }
}

export const changePasswordRadio = async (req: Request, res: Response) => {
  try {

    const { oldPassword, newPassword, confirm }: any = req.body

    var conId: any
    if (req.body.user) {
      conId = req.body.userr._id
    } else if (req.body.seller) {
      conId = req.body.seller._id
    }

    const user: any = await userSchema.findOne({ _id: conId })
    const isMatch: any = await bcrypt.compare(oldPassword, user.confirmPassword)
    if (!isMatch) {
      throw "Wrong password"
    }
    if (!val.isValidPassword(newPassword) || !val.isValidPassword(confirm)) {
      throw "Invalid password"
    }
    if (newPassword.length !== 6 || confirm.length !== 6) {
      throw "Passwrd must be 6 in length"
    }
    if (newPassword !== confirm) {
      throw "Should match"
    }
    const hash: any = await bcrypt.hash(confirm, 8)
    user.password = hash
    user.confirmPassword = hash
    await user.save()
    res.status(200).json({
      success: true,
      user
    })

  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};


export const updateProfileRadio = async (req: Request, res: Response) => {
  try {
    var conId: any
    if (req.body.user) {
      conId = req.body.userr._id
    } else if (req.body.seller) {
      conId = req.body.seller._id
    }


    const findUser: any = await userSchema.findOne({ _id: conId });

    const { name, mobileNum, emailId }: any = req.body

    if (req.file) {
      const result: any = await cloud.uploader.upload(req.file.path);
      var fi: any = result.secure_url;
      var fcid = result.public_id;

    }
    // if (!val.isValidImageLink(fi)) {
    //   return res.status(400).json({
    //     message: "Invalid image link"
    //   })
    // }
    const updaye: any = await userSchema.findByIdAndUpdate(findUser._id, { $set: { name, image: fi, cloudinaryId: fcid, mobileNum, emailId } }, { new: true, runValidators: true })
    if (req.body.seller) {
      const restUpd: any = await restSchema.findOneAndUpdate({ usefulId: req.body.seller._id }, { $set: { mobileNum, emailId } }, { new: true, runValidators: true })
    }
    res.status(200).json({
      success: true,
      updaye
    })


  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

export const otpForChangeMobileRadio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    var conId: any
    if (req.body.user) {
      conId = req.body.userr._id
    } else if (req.body.seller) {
      conId = req.body.seller._id
    }
    const user: any = await userSchema.findOne({ _id: conId })
    if (user.mobileNum === req.body.mobileNum) {
      return res.status(404).json({
        success: false,
        message: "Previous detail cannot be used "
      })
    }

    let oneTimePass = Math.floor(Math.random() * 9000 + 1000);
    let message: any = "Hello, expiration time"
    getOtp(oneTimePass, req.body.mobileNum, message)
    user.otp = oneTimePass
    await user.save()
    res.status(200).json({
      success: true,
      name: user.name,
      otp: user.otp

    })
  } catch (Err: any) {
    return res.status(400).json({ message: Err.message });
  }
}

export const otpVerifyChangeMobile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    var conId: any
    if (req.body.user) {
      conId = req.body.userr._id
    } else if (req.body.seller) {
      conId = req.body.seller._id
    }
    const user: any = await userSchema.findOne({ _id: conId })
    if (user.otp !== req.body.otp) {
      return res.status(400).json({
        message: "Wrong otp"
      })
    }

    res.status(200).json({
      success: true,
      message: "OTP verified.You can place changed number in body. All changes  will be saved on clicking save "
    })

  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
}


export const deleteProfile = async (req: Request, res: Response) => {
  try {
    var conId: any
    if (req.body.user) {
      conId = req.body.userr._id
    } else if (req.body.seller) {
      conId = req.body.seller._id
    }
    const findUser = await userSchema.deleteOne({ _id: conId });
    if (findUser.deletedCount > 0) {
      return res.status(200).json({ message: "Successfully deleted!" });
    }
  } catch (error) { 
    return res.status(400).json({ message: error });
  }
};


 
export const usersLocation = async (req: Request, res: Response) => {
  try {
    if (req.body.seller) {
      return res.status(404).json({
        message: "Only users allowed here"
      })
    }

const loc:any={
  type:"Point",
  coordinates:[ parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
}

const user:any=await userSchema.findOneAndUpdate({_id:req.body.user._id}, {$set:{location:loc, country:req.body.country, address:req.body.address,state:req.body.state }}, {new:true, runValidators:true})
res.status(200).json({
  success:true, 
  user
})
  } catch (Err: any) {
    return res.status(400).json({ message: Err.message });
  }
}













/////////////Need to contemplate  this function when best offer 's functionality arrives /////////////////////////////////



////////////////////////////////////////////////////////////////////////// Update Cart API
export const addToCart = async (req: Request, res: Response) => {
  try {
    var myCart: any = await cartModel.findOne({ userId: req.body.userr && req.body.userr._id })

    if (!myCart) {
      const addtocart: any = await cartModel.create({
        userId: req.body.userr._id,
        restaurantId: req.params.restId,
        restaurantName: req.body.restaurantName,
        userName: req.body.user.name,

      })
      if (req.body.smallPrice || req.body.mediumPrice || req.body.largePrice) {
        var cprice = req.body.smallPrice || req.body.mediumPrice || req.body.largePrice
      }

      const dish: any = {
        dishName: req.body.dishName,

        dishId: req.params.dishId,
        quantity: req.body.quantity,
        price: req.body.price || cprice,
        currency: req.body.currency,
        addSuggestion: req.body.addSuggestion,
        indexId: 0
      }
      addtocart.dishes = addtocart.dishes.concat(dish)
      await addtocart.save()


      await addtocart.save()
      var totalCartAmount: any = 0
      addtocart.dishes.forEach(async (iten: any) => {
        totalCartAmount += iten.price

        addtocart.totalCartPrice = totalCartAmount
      })
      await addtocart.save()
      res.status(200).json({
        success: true,
        addtocart
      })
    }
    else if (myCart) {

      if (myCart.dishes.length === 5) {
        return res.status(200).json({
          success: false,
          message: "Cart is full. Only n for cart.Proceed for order payment. Click on go to cart"
        })
      }


      if (myCart.dishes.length >= 1 && myCart.dishes.length < 5 && myCart.restaurantName === req.body.restaurantName) {

        var okIn: any = myCart.dishes.slice(-1)
        var okIndex: any = okIn[0].indexId
        if (req.body.smallPrice || req.body.mediumPrice || req.body.largePrice) {
          var cprice = req.body.smallPrice || req.body.mediumPrice || req.body.largePrice
        }
        const dish: any = {
          dishName: req.body.dishName,

          dishId: req.params.dishId,
          quantity: req.body.quantity,
          price: req.body.price || cprice,
          currency: req.body.currency,
          addSuggestion: req.body.addSuggestion,
          indexId: Number(okIndex) + 1
        }
        myCart.dishes = myCart.dishes.concat(dish)
        await myCart.save()
        var totalCartAmount: any = 0
        myCart.dishes.forEach((sy: any) => {
          totalCartAmount += sy.price
          myCart.totalCartPrice = totalCartAmount
        })

        await myCart.save()
        res.send(myCart)

      } else if (myCart.dishes.length >= 1 && myCart.dishes.length < 5 && myCart.restaurantName !== req.body.restaurantName) {
        if (req.body.deleteCartItems === false) {
          return res.send("Your cart is safe; One can order dishes of only one rest at one time")
        }
        if (req.body.deleteCartItems === true) {
          const deleteMyCart: any = await cartModel.findOneAndDelete({ userId: req.body.user._id })
          const againMyCart: any = await cartModel.create({
            userId: req.body.user._id,
            restaurantId: req.params.restId,
            restaurantName: req.body.restaurantName,
            userName: req.body.user.name
          })
          if (req.body.smallPrice || req.body.mediumPrice || req.body.largePrice) {
            var cprice = req.body.smallPrice || req.body.mediumPrice || req.body.largePrice
          }

          const dish: any = {
            dishName: req.body.dishName,
            dishId: req.params.dishId,
            quantity: req.body.quantity,
            price: req.body.price || cprice,
            currency: req.body.currency,
            addSuggestion: req.body.addSuggestion,
            indexId: 0

          }
          againMyCart.dishes = againMyCart.dishes.concat(dish)
          await againMyCart.save()


          var totalCartAmount: any = 0
          againMyCart.dishes.forEach((sy: any) => {
            totalCartAmount += sy.price
            againMyCart.totalCartPrice = totalCartAmount
          })

          await againMyCart.save()
          res.status(200).json({
            success: true,
            againMyCart
          })

        }

      }
    }

  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }
}


export const getCartItems = async (req: Request, res: Response) => {
  try {
    const userCartItems: any = await cartModel.findOne({ userId: req.body.userr._id }, 'userName userId restaurantName dishes')
    res.status(200).json({
      success: true,
      userCartItems
    })

  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }
}
export const getPermission = async (req: Request, res: Response) => {
  try {
    if (req.body.deleteCartItems === true) {
      var usersCart: any = await cartModel.findOneAndDelete({ userId: req.body.userr._id })
      await usersCart.save()
      return res.status(200).json({
        message: "cart is totally deleted. You can  only order dishes from one restaurant at one time.Proceed with ordering dishes of this restaurant",
      })
    } else if (req.body.deleteCartItems === false) {
      return res.status(400).json({
        message: "At a time, one can add items of one restaurant only.Your cart is safe. Proceed to order payment"
      })
    }
  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }
}
// // Basically, final cart updating is of front -end work . But this below function is for our understanding///// 
export const updateCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tc: any = await cartModel.findOne({ userId: req.body.userr._id })

    tc.dishes.forEach((ok: any) => {
      if (ok.indexId === req.params.iid) {
        ok.quantity = req.body.quantity,
          ok.price = req.body.price,
          ok.addSuggestion = req.body.addSuggestion
      }
    })
    await tc.save()
    var totalAmount: any = 0
    tc.dishes.forEach((tp: any) => {
      totalAmount += tp.price
      tc.totalCartPrice = totalAmount
    })
    await tc.save()
    res.send(tc)


  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }
}


export const deleteCartItems = async (req: Request, res: Response) => {
  try {
    const thatCart: any = await cartModel.findOne({ userId: req.body.userr._id })
    const { iid }: any = req.params
    if (req.body.deleteItem === true) {
      if (thatCart.dishes.length > 1) {
        const index: any = await thatCart.dishes.findIndex((item: any) => {
          return item.indexId === iid
        })
        thatCart.dishes.splice(index, 1)
        await thatCart.save()
        res.send(thatCart)

      }
    } else if (thatCart.dishes.length === 1) {
      const deleteCart: any = await cartModel.findOneAndDelete({ userId: req.body.userr._id })
      res.status(200).json({
        success: true,
        message: "User deleted totally;Please proced to order again",

      })
    }


    if (req.body.deleteAllItems  === true) {
      const deleteCart: any = await cartModel.findOneAndDelete({ userId: req.body.userr._id })
      res.status(200).json({
        success: true,
        mesage: "User deleted totally;Please proced to order again",

      })
    }

  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }
}
// var options: any
// var exportBracket: any


// export const placeOrder = async (req: Request, res: Response) => {
//   try {
//     const userCart: any = await cartModel.findOne({ userId: req.body.user._id })
//     var reqId: any = userCart.userId
//     if (!req.body.couponName) {

//       options = {
//         amount: Number((userCart.totalCartPrice + req.body.deliveryCharge) * 100),
//         currency: 'INR',
//         userId: reqId
//       }
//       exportBracket = userCart.totalCartPrice + req.body.deliveryCharge
//     } else if (req.body.couponName) {
//       var coupon: any = await couponModel.findOne({ couponName: req.body.couponName })
//       if (coupon.discountInAmount && userCart.totalCartPrice > coupon.minRangeOfOrderValue) {
//         var discountCutInAmount = userCart.totalCartPrice - coupon.discountInAmount
//       } else if (userCart.totalCartPrice < coupon.minRangeOfOrderValue) {
//         res.status(404).json({
//           message: "Cart price is not sufficient"
//         })
//       }


//       if (coupon.discountPercent && userCart.totalCartPrice > coupon.minRangeOfOrderValue) {
//         var dis: any = (userCart.totalCartPrice * coupon.discountPercent) / 100
//         if (!coupon.maxRangeofDiscount) {
//           var disCutInPercen: any = userCart.totalCartPrice - dis
//         } else if (coupon.maxRangeofDiscount && dis > coupon.maxRangeofDiscount) {
//           disCutInPercen = userCart.totalCartPrice - coupon.maxRangeofDiscount
//         } else if (coupon.maxRangeofDiscount && dis < coupon.maxRangeofDiscount) {
//           disCutInPercen = userCart.totalCartPrice - dis
//         }
//       }
//       else {
//         if (userCart.totalCartPrice < coupon.minRangeOfOrderValue) {
//           res.status(404).json({
//             message: "Cart price is not sufficient nhekbjk"
//           })
//         }
//       }
//       if (discountCutInAmount) {
//         options = {
//           amount: Number((discountCutInAmount + req.body.deliveryCharge) * 100),
//           currency: 'INR',
//           userId: reqId
//         }
//         exportBracket = discountCutInAmount + req.body.deliveryCharge
//       }
//       if (disCutInPercen) {
//         options = {
//           amount: Number((disCutInPercen + req.body.deliveryCharge) * 100),
//           currency: 'INR',
//           userId: reqId
//         }
//       }
//       exportBracket = disCutInPercen + req.body.deliveryCharge
//     }

//     var razorOrder = await instance.orders.create(options)

//     var pOrder: any = await userOrderModel.create({
//       userId: req.body.user._id,
//       userName: req.body.userName,
//       city: req.body.city,
//       state: req.body.state,
//       address: req.body.address,
//       pincode: req.body.pincode,
//       mobile: req.body.mobile,
//       totalPrice: exportBracket,
//       currency: req.body.currency,
//       couponApplied: false,
//       deliveryCharge: req.body.deliveryCharge,
//       restaurantId: userCart.restaurantId,
//       restaurantIdStr: userCart.restaurantIdStr,
//       restaurantName: userCart.restaurantName,
//       orderId: razorOrder.id

//     })
//     var orderItems: any
//     userCart.dishes.forEach(async (each: any) => {
//       orderItems = {
//         foodDishName: each.dishName,
//         foodDishIdStr: each.dishIdStr,
//         foodDishId: each.dishId,
//         orderedDate: new Date(),
//         price: each.price,
//         qty: each.quantity,
//         addSuggestion: each.addSuggestion
//       }
//       pOrder.orderItems = pOrder.orderItems.concat(orderItems)

//     })
//     await pOrder.save()
//     const rOrder: any = await restaurantOrders.create({
//       userId: req.body.user._id,
//       userName: req.body.userName,
//       restaurantId: userCart.restaurantId,
//       address: req.body.address,
//       city: req.body.city,
//       state: req.body.state,
//       pincode: req.body.pincode,
//       mobile: req.body.mobile,
//       email: req.body.email,
//       couponApplied: false,
//       totalOrderPrice: exportBracket,
//       currency: req.body.currency,
//       orderId: razorOrder.id,
//       deliveryCharge: req.body.deliveryCharge

//     })
//     var orderDishes: any
//     userCart.dishes.forEach(async (item: any) => {
//       orderDishes = {
//         dishName: item.dishName,
//         dishId: item.dishId,
//         dishIdStr: item.dishIdStr,
//         price: item.price,
//         quantity: item.quantity,
//         addSuggestion: item.addSuggestion
//       }
//       rOrder.orderItems = rOrder.orderItems.concat(orderDishes)

//     })
//     await rOrder.save()
//     if (req.body.couponName === "WELCOME50") {
//       const welcome: any = await userModel.findByIdAndUpdate(req.body.user._id, { $set: { welcomeCouponApplied: true } }, { new: true, runValidators: true })
//     }
//     options.pOrderId = pOrder._id
//     options.rOrderId = rOrder._id

//     res.status(200).json({
//       userOrderModelId: pOrder._id,
//       resOrderModelId: rOrder._id,
//       orderIdUserOrder: pOrder.orderId,
//       orderIdResModel: rOrder.orderId,
//       loggedInUserId: req.body.user._id,
//       totalpriceafterDiscountInUserModel: pOrder.totalPrice,
//       totalPriceinResoRderModel: rOrder.totalOrderPrice,
//       options

//     })
//   } catch (err: any) {
//     res.status(404).json({
//       success: false,
//       message: err.message
//     })
//   }
// }


// export const freeDelivery = async (req: Request, res: Response) => {
//   try {
//     const coupon: any = await couponModel.findOne({ couponName: "FreeAbove1000" })
//     if (coupon.activeStatus === true) {
//       res.status(200).json({
//         message: "No delivery charge above 1000"
//       })
//     } else {
//       res.status(200).json({
//         message: "Delivery charge is applicable"
//       })
//     }
//   } catch (Err: any) {
//     res.status(404).json({
//       success: false,
//       message: Err.message
//     })
//   }
// }



// /// Web-Hooks for payment captured and failed //////////

// export const hookForPaymentCapture = async (req: any, res: any) => {
//   try {
//     const secret = 'foodDAPIpc'
//     const dta: any = req.body
//     console.log(dta.payload.payment.entity)
//     console.log(dta.payload.payment.entity.id)
//     const shasum: any = crypto.createHmac('sha256', secret)
//     shasum.update(JSON.stringify(dta))
//     const digest: any = shasum.digest('hex')
//     console.log(digest, req.headers['x-razorpay-signature'])
//     if (digest === req.headers['x-razorpay-signature']) {
//       console.log('order paid, But what happened at back?')
//       console.log(options)
//       const cart: any = await userOrderModel.findOne({ _id: options.pOrderId })
//       const restPushOrder: any = await restaurantOrders.findById(options.rOrderId)


//       cart.paymentStatus = "Success"
//       cart.transactionId = dta.payload.payment.entity.id
//       await cart.save()
//       restPushOrder.transactionId = dta.payload.payment.entity.id
//       restPushOrder.paymentStatus = 'Success'
//       restPushOrder.amountReceived = (dta.payload.payment.entity.amount) / 100
//       await restPushOrder.save()
//       const deleteCart: any = await cartModel.findOneAndDelete({ userId: options.userId })


//     }
//   } catch (err: any) {
//     res.status(404).json({
//       success: false,
//       message: err.message
//     })
//   }

// }


// export const hookForPaymentFail = async (req: Request, res: Response) => {
//   try {
//     const secretp = 'isgoodthatyoumadethis'
//     console.log(req.body)
//     const shasum = crypto.createHmac('sha256', secretp)
//     shasum.update(JSON.stringify(req.body))
//     const digest = shasum.digest('hex')
//     console.log(req.body)

//     console.log(digest, req.headers)
//     if (digest === req.headers['x-razorpay-signature']) {
//       console.log('PAYMENT FAILED')
//       const catrt: any = await userOrderModel.findOne({ _id: options.pOrderId })
//       /// restaurant order model's doc can be deleted //////
//       const resOrder: any = await restaurantOrders.findOne({ _id: options.rOrderId })
//       catrt.paymentStatus = 'Failed'
//       await catrt.save()
//       resOrder.paymentStatus = "Failed"
//       await resOrder.save()


//     }

//   } catch (Err: any) {
//     res.status(400).json({
//       success: false,
//       message: Err.message
//     })
//   }
// }



/////////////////////////////////////////////////////////////////////////////// CART API

//////////////////////////////////////////////////////User review to restaurant and food Dishes////////////////
export const getReviewsForRestaurant = async (req: Request, res: Response) => {
  try {
    if (req.body.seller) {
      return res.status(404).json({
        message: "Only users allowed here"
      })
    }

    const { restId }: any = req.params

    const rest: any = await restSchema.findById(restId)
    const user: any = await userSchema.findById(req.body.user._id)


    const resp = await rest.review.find((ref: any) => ref.userId.toString() === user._id.toString())
    if (resp) {
      res.status(200).send(resp)
    }
    else {
      res.send('No there')
    }

  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }
}


export const userPostReviewForRest = async (req: Request, res: Response) => {
  try {
    if (req.body.seller) {
      return res.status(404).json({
        message: "Only users allowed here"
      })
    }

    const { restId }: any = req.params
    const rest: any = await restSchema.findById(restId)
    if (req.body.postNewReview) {
      const reviw: any = {
        userId: req.body.user._id,
        userName: req.body.user.name,
        opinion: req.body.opinion,
        rating: req.body.rating,
        suggest: req.body.suggest,
        reviewedAt: new Date()
      }
      rest.review = rest.review.concat(reviw)
      await rest.save()

      var image: any = [];
      if (req.files) {
        let img = JSON.parse(JSON.stringify(req.files));
        for (let i = 0; i < img.length; i++) {
          let result = await cloud.uploader.upload(img[i].path);
          image.push({
            imageUrl: result.secure_url,
            cloudinaryId: result.public_id,
            index: i
          });
        }
      }
      let reqReview: any = await rest.review.find((hellR: any) => hellR.userId === req.body.user._id)
      reqReview.images = image
      await rest.save()
      res.status(200).json({
        rest
      })

    }

  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }
}

export const deleteMyReviewForASpecificRestaurant = async (req: Request, res: Response) => {
  try {
    if (req.body.seller) {
      return res.status(404).json({
        message: "Only users allowed here"
      })
    }
    const rest: any = await restSchema.findById(req.params.restId)
    const myReview: any = await rest.review.findIndex((mr: any) => mr.userId.toString() === req.body.user._id)
    rest.review.splice(myReview, 1)
    await rest.save()
    res.status(200).json({
      success: true,
      rest
    })
  } catch (err: any) {
    res.status(404).json({
      success: false,
      message: err.message
    })
  }
}


export const deletePhotoOfMyReviewToARestaurant = async (req: Request, res: Response) => {
  try {
    if (req.body.seller) {
      return res.status(404).json({
        message: "Only users allowed here"
      })
    }
    const rest: any = await restSchema.findById(req.params.restId)
    const myRev: any = await rest.review.find((me: any) => me.userId.toString() === req.body.user._id.toString())
    const myRevImages: any = await myRev.images.find((img: any) => img._id.toString() === req.params.iid)
    myRevImages.imageUrl = null
    myRevImages.cloudinaryId = null
    await rest.save()
    res.status(200).json({
      success: true,
      rest
    })

  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }
}

export const updateMyReviewToARest = async (req: Request, res: Response) => {
  try {
    if (req.body.seller) {
      return res.status(404).json({
        message: "Only users allowed here"
      })
    }

    const rest: any = await restSchema.findOne({ _id: req.params.restId })
    const indexed = await rest.review.find((n: any) => n.userId.toString() === req.body.user._id.toString());

    // const resp: any = await rest.review.find((ref: any) => ref.userId.toString() === req.body.user._id.toString())
    let reqimages: any = req.files
    for (let i = 0; i < 5; i++) {
      if (
        reqimages[`image${i}`] &&
        reqimages[`image${i}`][0].fieldname === `image${i}`
      ) {
        const result = await cloud.uploader.upload(
          reqimages[`image${i}`][0].path
        );
        let data = indexed.images.find((val: any) => val.index === i);
        console.log(data);

        data.imageUrl = result.secure_url;
        data.cloudinaryId = result.public_id;
      }
    }
    await rest.save()

    res.json({ indexed })
  } catch (Err: any) {
    res.status(400).json({
      success: false,
      message: Err.message
    })
  }
}


export const reviewFoodDish = async (req: Request, res: Response) => {
  try {
    if (req.body.seller) {
      return res.status(404).json({
        message: "Only users allowed here"
      })
    }

    const { image1, image2, image3 }: any = req.files
    //     //// need to upload photos
    if (image1) {
      const result: any = await cloud.uploader.upload(image1[0].path);
      var fi1: any = result.secure_url;
      var fcid1 = result.public_id;
    }
    if (image2) {
      const result: any = await cloud.uploader.upload(image2[0].path);
      var fi2: any = result.secure_url;
      var fcid2 = result.public_id;
    }
    if (image3) {
      const result: any = await cloud.uploader.upload(image3[0].path);
      var fi3: any = result.secure_url;
      var fcid3 = result.public_id;
    }
    const dish: any = await foodSchema.findById(req.params.dishId)
    const dr: any = {
      userName: req.body.userr.name,
      role: req.body.userr.role,
      userId: req.body.userr._id,
      opinion: req.body.opinion,
      rating: req.body.rating,
      reviewedAt: new Date(),
      suggest: req.body.suggest,

    }
    dish.review = dish.review.concat(dr)
    await dish.save()

    res.status(200).json({
      success: false,
      review: dish.review
    })


  } catch (err: any) {
    res.status(404).json({
      success: false,
      message: err.message
    })
  }
}

export const addDishesToFavAtOrder = async (req: Request, res: Response) => {
  try {
    if (req.body.seller) {
      return res.status(404).json({
        message: "Only users allowed here"
      })
    }

    const userfav: any = await userSchema.findOne({ _id: req.body.userr || req.body.userr._id })
    const dish: any = await foodSchema.findOne({ _id: req.params.id })
    const dishFav: any = {
      dishId: dish._id,
      lastOrderDate: req.body.deliveryDate
    }
    userfav.favDishes = userfav.favDishes.concat(dishFav)
    await userfav.save()
    res.status(200).json({
      success: true,
      userfav
    })

  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }
}

export const addFoodDishToFav = async (req: Request, res: Response) => {
  try {
    if (req.body.seller) {
      return res.status(404).json({
        message: "Only users allowed here"
      })
    }

    var conId: any
    if (req.body.userr) {
      conId = req.body.userr._id
    } else if (req.body.seller) {
      conId = req.body.seller._id
    }
    const userfav: any = await userSchema.findOne({ _id: conId })
    const dish: any = await foodSchema.findOne({ _id: req.params.dishId })
    const dishFav: any = {
      dishId: dish._id,
    }
    userfav.favDishes = userfav.favDishes.concat(dishFav)
    await userfav.save()
    res.status(200).json({
      success: true,
      userfav
    })
  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }
}


export const removeFromFavs = async (req: Request, res: Response) => {

}

export const getMyFavDishes = async (req: Request, res: Response) => {
  try {
    if (req.body.seller) {
      return res.status(404).json({
        message: "Only users allowed here"
      })
    }

    const fav: any = await userSchema.findOne({ _id: req.body.userr._id }, '_id name ').populate({ path: 'favDishes', populate: 'dishId' })
    res.send(fav)

  } catch (err: any) {
    res.status(404).json({
      success: false,
      message: err.message
    })
  }
}

export const addRestaurantToFav = async (req: Request, res: Response) => {
  try {
    if (req.body.seller) {
      return res.status(404).json({
        message: "Only users allowed here"
      })
    }

    const userfav: any = await userSchema.findOne({ _id: req.body.userr._id })

    const restFav: any = {

      restId: req.body.restId,

    }
    userfav.favRestaurants = userfav.favRestaurants.concat(restFav)
    await userfav.save()
    res.status(200).json({
      success: true,
      userfav
    })
  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }
}

export const getMyFavRestaurants = async (req: Request, res: Response) => {
  try {
    if (req.body.seller) {
      return res.status(404).json({
        message: "Only users allowed here"
      })
    }

    const user: any = await userSchema.findOne({ _id: req.body.userr._id }, '_id name').populate({ path: 'favRestaurants', populate: 'restId' })
    res.status(200).json({
      success: true,
      user
    })
  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }

}

export const getLatestNews = async (req: Request, res: Response) => {
  try {
    if (req.body.seller) {
      return res.status(404).json({
        message: "Only users allowed here"
      })
    }
    const rests: any = await restSchema.find({}, ' latestNews')
    const todate: any = new Date().toLocaleString('eN-In').slice(0, 9)
    var fgh: any = []
    rests.forEach((rest: any) => {
      rest.latestNews.forEach((news: any) => {
        if (todate <= news.expiryDate) {
          fgh.push(news)
        }
      })
    })
    res.status(200).send(fgh.sort(
      (p1: any, p2: any) =>
        (p1.createDate < p2.createDate) ? 1 : (p1.createDate > p2.createDate) ? -1 : 0));


  } catch (Err: any) {
    res.status(404).json({
      success: false,
      message: Err.message
    })
  }
}