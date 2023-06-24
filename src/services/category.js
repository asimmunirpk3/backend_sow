import { categoryModel } from "../models/category.js";

export const checkCategoryByName = async (name) => {
  try {
    return await categoryModel.findOne({
      name: name,
    });
  } catch (error) {
    console.log("error--------------------->", error);
    return false;
  }
};

export const creatCategoryData = async (data) => {
  try {
    const result = new categoryModel(data);
    return await result.save();
  } catch (error) {
    console.log("error--------------------->", error);
    return false;
  }
};

export const deleteCategoryData = async (id) => {
  try {
    return await categoryModel.findByIdAndDelete(id);
  } catch (error) {
    console.log("error--------------------->", error);
    return false;
  }
};

export const getAllCategoriesData = async () => {
  try {
    return await categoryModel.find({})
  } catch (error) {
    console.log("error--------------------->", error);
    return false;
  }
};

export const getCategoryByIdData = async (id) => {
  try {
    return await categoryModel.findById(id);
  } catch (error) {
    console.log("error---------------------", error);
    return false;
  }
};

export const updateCategoryByidData = async (id, data) => {
  try {
    return await categoryModel.findByIdAndUpdate(id, data);
  } catch (error) {
    console.log("error---------------------", error);
    return false;
  }
};
