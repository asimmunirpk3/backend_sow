import { userModel } from '../models/user.js';

export const checkUserByEmailData = async (email) => {
  try {
    return await userModel.findOne({
      email: email,
    });
  } catch (error) {
    return false;
  }
};

export const creatUserData = async (data) => {
  try {
    const result = new userModel(data);

    return await result.save();
  } catch (error) {
    return false;
  }
};

// export const updateUserPasswordData = async (id, password) => {
//   try {
//     return await userModel.findByIdAndUpdate(id, { password: password });
//   } catch (error) {
//     return false;
//   }
// };

export const getUserData = async (data) => {
  return {
    id: data._id,
    firstName: data?.firstName,
    lastName: data?.lastName,
    email: data?.email,
    phone: data?.phone,
    role: data?.role,
    active: data?.active,
    twoFactorEnabled: data?.twoFactorEnabled,
    planId: data?.planId,
    createdAt: data?.createdAt,
    verified: data?.verified,
    verifyAt: data?.verifyAt,
    profilePicture: data?.profilePicture,
  };
};
