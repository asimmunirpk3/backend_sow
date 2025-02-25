import { carModel } from '../models/car.js';

export const creatCarData = async (data) => {
  try {
    const result = new carModel(data);
    return await result.save();
  } catch (error) {
    console.log('error--------------------->', error);
    return false;
  }
};

export const deleteCarData = async (id) => {
  try {
    return await carModel.findByIdAndDelete(id);
  } catch (error) {
    console.log('error--------------------->', error);
    return false;
  }
};

export const getAllCarsData = async () => {
  try {
    return await carModel.find({}).populate('category');
  } catch (error) {
    console.log('error--------------------->', error);
    return false;
  }
};

export const getCarByIdData = async (id) => {
  try {
    return await carModel.findById(id);
  } catch (error) {
    console.log('error--------------------->', error);
    return false;
  }
};

export const updateCarByidData = async (id, data) => {
  try {
    return await carModel.findByIdAndUpdate(id, data);
  } catch (error) {
    console.log('error--------------------->', error);
    return false;
  }
};
