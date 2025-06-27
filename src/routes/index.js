import userRoutes from '../routes/user.js';
import coursesRoutes from '../routes/courses.js'

import express from 'express';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: userRoutes,
  },
  {
    path: '/courses',
    route: coursesRoutes,
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
