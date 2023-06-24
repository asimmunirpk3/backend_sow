import {checkUserByEmailData} from '../services/user.js';
import {
  getAllCarsData,
  getCarByIdData,
  creatCarData,
  updateCarByidData,
  deleteCarData,
} from '../services/car.js';
import {getCategoryByIdData} from '../services/category.js';

export const getAllCars = async (req, res) => {
  try {
    const useremail = req.email;
    const checkuser = await checkUserByEmailData (useremail);
    if (!checkuser) {
      return res.status (402).json ({
        res: 'error',
        msg: `User is not exists with ${useremail}`,
      });
    }
    const cars = await getAllCarsData ();
    if (cars) {
      res.status (200).json ({
        res: 'success',
        msg: 'All Cars Data are Fetched Now.',
        data: cars,
      });
    } else {
      res
        .status (200)
        .json ({res: 'error', msg: 'Error accourd in fetching cars'});
    }
  } catch (error) {
    console.log ('error-------------------------->', error);
    res.status (500).json ({res: 'error', msg: 'Error accourd'});
  }
};

export const getCarById = async (req, res) => {
  try {
    const useremail = req.email;
    const carid = req.params.id;
    const checkuser = await checkUserByEmailData (useremail);
    if (!checkuser) {
      return res.status (402).json ({
        res: 'error',
        msg: `User is not exists with ${useremail}`,
      });
    }
    console.log (carid, '------------------------>');
    const car = await getCarByIdData (carid);
    if (car) {
      res.status (200).json ({
        res: 'success',
        msg: 'Car Data are Fetched Now.',
        data: car,
      });
    } else {
      res
        .status (200)
        .json ({res: 'error', msg: 'Error accourd in fetching car'});
    }
  } catch (error) {
    console.log ('error-------------------------->', error);
    res.status (500).json ({res: 'error', msg: 'Error accourd'});
  }
};

export const addCar = async (req, res) => {
  try {
    const {name, category, color, model, make, registration} = req.body;
    const useremail = req.email;
    const checkuser = await checkUserByEmailData (useremail);
    if (!checkuser) {
      return res.status (402).json ({
        res: 'error',
        msg: `User is not exists with ${useremail}`,
      });
    }
    const checkcategory = await getCategoryByIdData (category);
    if (!checkcategory) {
      return res.status (403).json ({
        res: 'error',
        msg: `Car Category is not exists`,
      });
    }
    const car = await creatCarData ({
      name: name,
      category: checkcategory,
      color: color,
      model,
      model,
      make: make,
      registration: registration,
    });
    if (category) {
      res.status (200).json ({
        res: 'success',
        msg: 'Car Data is created.',
      });
    } else {
      res
        .status (500)
        .json ({res: 'error', msg: 'Error accourd in adding car'});
    }
  } catch (error) {
    console.log ('error-------------------------->', error);
    res.status (500).json ({res: 'error', msg: 'Error accourd'});
  }
};

export const updateCar = async (req, res) => {
  try {
    const {name, category, color, model, make, registration} = req.body;
    const carid = req.params.id;
    const useremail = req.email;
    const checkuser = await checkUserByEmailData (useremail);
    if (!checkuser) {
      return res.status (402).json ({
        res: 'error',
        msg: `User is not exists with ${useremail}`,
      });
    }
    const carrr = await getCarByIdData (carid);
    if (!carrr) {
      return res.status (403).json ({
        res: 'error',
        msg: `Car is not exists`,
      });
    }
    const updatecar = await updateCarByidData (carid, {
      name: name,
      color: color,
      model,
      model,
      make: make,
      registration: registration,
    });
    if (updatecar) {
      res.status (200).json ({
        res: 'success',
        msg: 'Car details is updated now.',
      });
    } else {
      res
        .status (500)
        .json ({res: 'error', msg: 'Error accourd in updateing car details'});
    }
  } catch (error) {
    console.log ('error-------------------------->', error);
    res.status (500).json ({res: 'error', msg: 'Error accourd'});
  }
};

export const deleteCar = async (req, res) => {
  try {
    const useremail = req.email;
    const carid = req.params.id;
    const checkuser = await checkUserByEmailData (useremail);
    if (!checkuser) {
      return res.status (402).json ({
        res: 'error',
        msg: `User is not exists with ${useremail}`,
      });
    }

    const carrr = await deleteCarData (carid);
    if (carrr) {
      res.status (200).json ({
        res: 'success',
        msg: 'Car Data is deleted',
      });
    } else {
      res
        .status (500)
        .json ({res: 'error', msg: 'Error accourd in deleteing car'});
    }
  } catch (error) {
    console.log ('error-------------------------->', error);
    res.status (500).json ({res: 'error', msg: 'Error accourd'});
  }
};
