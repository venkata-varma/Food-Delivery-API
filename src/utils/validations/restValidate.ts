import { NextFunction, Request, Response } from "express";
import * as val from '../validation'

export const restCreateValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors: any = [];
  const { businessName, ownerName, address, gstinNo, emailId ,state, city, country,mobileNum} = req.body;
  
  if (!businessName) {
    errors.push({ message: "businessName field is required" });
  }
  if(!val.isValid(businessName)){
    errors.push({ message: "Enter valid Businessname" });
  }
  if (!ownerName) {
    errors.push({ message: "ownerName field is required" });
  }
  if (!val.isValid(ownerName)) {
    errors.push({ message: "Enter valid Owner name" });
  }
  if (!gstinNo) {
    errors.push({ message: "gstinNo field is required" });
  }
  if (!city) {
    errors.push({ message: "city field is required" });
  }
  if (!state) {
    errors.push({ message: "state field is required" });
  }
  if (!country) {
    errors.push({ message: "country field is required" });
  }
  if (!mobileNum) {
    errors.push({ message: "Mobile Num field is required" });
  }
  !val.isValidPhone(mobileNum) &&
    errors.push({ message: "Valid mobileNum is required!" });

  if (mobileNum.length !== 10) {
    errors.push({ message: "Mobile number should be of length  10" })
  }

  if (!address) {
    errors.push({ message: "address field is required" });
  }
  if (!emailId) {
    errors.push({ message: "emailId field is required" });
  }
  if(!val.isValidEmail(emailId)){
    errors.push({ message: "Enter valid email " })
  }
  errors.length ? res.status(400).json({ status: "false", errors }) : next();
};


export const updateBusinessDetailsValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors: any = [];
  const { businessName, ownerName,  cuisine } = req.body;

  if (businessName&&!val.isValid(businessName)) {
    errors.push({ message: "Enter valid Businessname" });
  }
  if (ownerName&&!val.isValid(ownerName)) {
    errors.push({ message: "Enter valid Owner name" });
  }
  
  if (cuisine&&!val.isValid(cuisine)) {
    errors.push({ message: "Enter valid cuisine Name" });
  }
  errors.length ? res.status(400).json({ status: "false", errors }) : next();
};
