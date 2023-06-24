import { userModel } from "../models/user.js";

export const checkUserByEmailData = async (email) => {
  try {
    return await userModel.findOne({
      email: email,
    });
  } catch (error) {
    console.log("error--------------------->", error);
    return false;
  }
};

export const creatUserData = async (data) => {
  try {
    const result = new userModel(data);

    return await result.save();
  } catch (error) {
    console.log("error--------------------->", error);
    return false;
  }
};

export const updateUserPasswordData = async (id, password) => {
  try {
    return await userModel.findByIdAndUpdate(id, { password: password });
  } catch (error) {
    console.log("error--------------------->", error);
    return false;
  }
};
