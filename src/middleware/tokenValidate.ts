import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import userSchema from "../models/user";
export const tokenValidation = async (

  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {token}: any = req.headers
    if (!token) {
      return res.status(400).json({ message: "Token required" });
    }
    
    
    const verify: any = await jwt.verify(token, process.env.key);

    const cuuser: any = await userSchema.findOne({ _id: verify.id });
var user:any
var seller:any 
var admin:any
if(cuuser.role===0) {
  req.body.seller=cuuser
 
 

}else if(cuuser.role===1){
  req.body.user=cuuser
  
  
}
else if(cuuser.role===2){
req.body.admin=cuuser
}
next()
  } catch (error: any) {
    return res.status(400).json({ message: "Invalid token", error });
  }
};

// export const isSeller = (req: Request, res: Response, next: NextFunction) =>
//   tokenValidation(0, req, res, next);

// export const isCustomer = (req: Request, res: Response, next: NextFunction) =>
//   tokenValidation(1, req, res, next);

