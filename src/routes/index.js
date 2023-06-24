import userRoutes from "../routes/user.js";
import categoryRoute from '../routes/category.js'
import carRoute from '../routes/car.js'
import express  from 'express';


const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: userRoutes,
  },
  {
    path: '/category',
    route: categoryRoute,
  },
  {
    path:'/car',
    route:carRoute
  }
];



defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;