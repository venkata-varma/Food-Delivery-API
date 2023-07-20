import mongoose from "mongoose";

// for string ;
export const isValid = function (value: any) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

// for mobile
export const isValidPhone = (mobile: any) => {
  const phone = /^[0-9]+$/;
  return phone.test(mobile);
};

// for email;
export const isValidEmail = (email: any) => {
  const mail = /\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/;
  return mail.test(email);
};

// for passcode

export const isValidPassword = (password: any) => {
  const pass = /[0-9]/;
  return pass.test(password);
};

// for objectId;
export const isValidObjectId = (objectId: string) => {
  return mongoose.Types.ObjectId.isValid(objectId);
};

// for link;
export const isValidImageLink = (image: any) => {
  var link =
    /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/gm;
  return link.test(image);
};
