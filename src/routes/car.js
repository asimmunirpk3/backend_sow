import express from "express";
import carValidation from '../validation/car.js';
import {getAllCars,getCarById, addCar,updateCar,deleteCar } from '../controllers/car.js'
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/getallcars", auth, getAllCars);
router.get("/getcar/:id",auth, getCarById);
router.post('/addcar',carValidation,auth,  addCar);
router.post('/updatecar/:id', carValidation,auth, updateCar);
router.post('/deletecar/:id',auth, deleteCar);

export default router;
