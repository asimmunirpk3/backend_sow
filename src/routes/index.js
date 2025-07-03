import userRoutes from '../routes/user.js';
import coursesRoutes from '../routes/courses.js'
import fourmsRoutes from '../routes/forums.js'
import adminUsers from '../routes/admin/user.js'
import express from 'express';
import adminCourses from '../routes/admin/course.js'
import adminReports from '../routes/admin/reports.js'
import adminDiscussion from '../routes/admin/discussion.js'

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: userRoutes,
  },
  {
    path: '/courses',
    route: coursesRoutes,
  },
  {
    path:'/formus',
    route: fourmsRoutes
  },
  {
    path:'/admin/users',
    route:adminUsers
  },
  { 
    path:'/admin/course',
    route: adminCourses
  },
  { 
    path:'/admin/report',
    route: adminReports
  },
   { 
    path:'/admin/discussion',
    route: adminDiscussion
  }
  
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
