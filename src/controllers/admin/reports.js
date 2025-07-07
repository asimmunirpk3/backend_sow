import { userModel } from '../../models/user.js'
import { courseModel } from '../../models/courses.js';

// Get enrollments report
export const getEnrollmentsApi = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      courseId,
      page = 1,
      limit = 10,
      groupBy = 'month'
    } = req.query;

    let courseQuery = {};
    if (courseId) courseQuery._id = courseId;

    const courses = await courseModel.find(courseQuery);
    let enrollmentData = [];

    courses.forEach(course => {
      const enrolledUserIds = course.enrolled_users?.map(u => u.userId) || [];

      course.enrolled_users?.forEach(user => {
        const userId = user.userId;
        const enrolledAt = user.enrolled_at;

        course.courses.forEach(subCourse => {
          const completion = subCourse.completed_by?.find(c => c.userId === userId);
          enrollmentData.push({
            courseId: course._id,
            courseMasterTitle: course.course_master_title,
            subCourseTitle: subCourse.course_title,
            userId,
            username: completion?.username || '',
            enrolledAt,
            completedAt: completion?.completed_at || null,
            progress: completion?.progress || 0
          });
        });
      });
    });

    // Filter by date
    if (startDate || endDate) {
      enrollmentData = enrollmentData.filter(item => {
        const date = new Date(item.enrolledAt || item.completedAt);
        if (startDate && date < new Date(startDate)) return false;
        if (endDate && date > new Date(endDate)) return false;
        return true;
      });
    }

    // Grouping
    const groupedData = {};
    enrollmentData.forEach(item => {
      const date = new Date(item.enrolledAt || item.completedAt);
      let key;
      switch (groupBy) {
        case 'day': key = date.toISOString().split('T')[0]; break;
        case 'week': const weekStart = new Date(date); weekStart.setDate(date.getDate() - date.getDay()); key = weekStart.toISOString().split('T')[0]; break;
        case 'month': key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; break;
        case 'year': key = String(date.getFullYear()); break;
        default: key = date.toISOString().split('T')[0];
      }

      if (!groupedData[key]) {
        groupedData[key] = {
          period: key,
          enrollments: 0,
          completions: 0,
          averageProgress: 0
        };
      }

      groupedData[key].enrollments++;
      if (item.progress === 100) groupedData[key].completions++;
    });

    // Average progress
    Object.keys(groupedData).forEach(key => {
      const relevant = enrollmentData.filter(item => {
        const date = new Date(item.enrolledAt || item.completedAt);
        let k;
        switch (groupBy) {
          case 'day': k = date.toISOString().split('T')[0]; break;
          case 'week': const w = new Date(date); w.setDate(date.getDate() - date.getDay()); k = w.toISOString().split('T')[0]; break;
          case 'month': k = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; break;
          case 'year': k = String(date.getFullYear()); break;
          default: k = date.toISOString().split('T')[0];
        }
        return k === key;
      });

      const totalProgress = relevant.reduce((sum, i) => sum + i.progress, 0);
      groupedData[key].averageProgress = relevant.length > 0 ? Math.round(totalProgress / relevant.length) : 0;
    });

    const reportData = Object.values(groupedData).sort((a, b) => new Date(a.period) - new Date(b.period));
    const skip = (page - 1) * limit;
    const paginatedData = reportData.slice(skip, skip + parseInt(limit));
    const totalPages = Math.ceil(reportData.length / limit);

    const totalEnrollments = enrollmentData.length;
    const totalCompletions = enrollmentData.filter(e => e.progress === 100).length;
    const completionRate = totalEnrollments > 0 ? Math.round((totalCompletions / totalEnrollments) * 100) : 0;
    // Unique course count where enrolled_users exist
    const totalCoursesEnrolled = courses.filter(c => c.enrolled_users?.length > 0).length;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalEnrollments,
          totalCompletions,
          totalCoursesEnrolled,
          completionRate: `${completionRate}%`,
          averageProgress: totalEnrollments > 0 ? Math.round(enrollmentData.reduce((sum, i) => sum + i.progress, 0) / totalEnrollments) : 0
        },
        reportData: paginatedData,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRecords: reportData.length,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching enrollments report',
      error: error.message
    });
  }
};


// Get course performance report
export const coursePerformanceApi = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'enrollments',
      sortOrder = 'desc'
    } = req.query;

    const courses = await courseModel.find({});
    let performanceData = [];

    courses.forEach(course => {
      const userIds = course.enrolled_users?.map(u => u.userId) || [];
      const courseStats = {
        courseId: course._id,
        courseMasterTitle: course.course_master_title,
        courseDescription: course.course_master_description,
        totalSubCourses: course.courses.length,
        totalEnrollments: userIds.length,
        totalCompletions: 0,
        completionRate: 0,
        averageProgress: 0,
        subCourseStats: []
      };

      const allProgress = [];

      course.courses.forEach(subCourse => {
        let enrollments = 0;
        let completions = 0;
        const progressValues = [];

        subCourse.completed_by?.forEach(c => {
          const completedAt = new Date(c.completed_at);
          if (startDate && completedAt < new Date(startDate)) return;
          if (endDate && completedAt > new Date(endDate)) return;

          if (userIds.includes(c.userId)) {
            enrollments++;
            progressValues.push(c.progress);
            allProgress.push(c.progress);
            if (c.progress === 100) completions++;
          }
        });

        courseStats.subCourseStats.push({
          title: subCourse.course_title,
          enrollments,
          completions,
          completionRate: enrollments > 0 ? Math.round((completions / enrollments) * 100) : 0,
          averageProgress: progressValues.length > 0 ? Math.round(progressValues.reduce((sum, p) => sum + p, 0) / progressValues.length) : 0
        });

        courseStats.totalCompletions += completions;
      });

      courseStats.completionRate = courseStats.totalEnrollments > 0
        ? Math.round((courseStats.totalCompletions / courseStats.totalEnrollments) * 100)
        : 0;

      courseStats.averageProgress = allProgress.length > 0
        ? Math.round(allProgress.reduce((sum, p) => sum + p, 0) / allProgress.length)
        : 0;

      performanceData.push(courseStats);
    });

    // Sort
    performanceData.sort((a, b) => {
      const valA = a[sortBy === 'completion_rate' ? 'completionRate' : sortBy === 'completions' ? 'totalCompletions' : 'totalEnrollments'];
      const valB = b[sortBy === 'completion_rate' ? 'completionRate' : sortBy === 'completions' ? 'totalCompletions' : 'totalEnrollments'];
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });

    const skip = (page - 1) * limit;
    const paginatedData = performanceData.slice(skip, skip + parseInt(limit));
    const totalPages = Math.ceil(performanceData.length / limit);

    const totalCourses = performanceData.length;
    const totalEnrollments = performanceData.reduce((sum, c) => sum + c.totalEnrollments, 0);
    const totalCompletions = performanceData.reduce((sum, c) => sum + c.totalCompletions, 0);
    const overallCompletionRate = totalEnrollments > 0 ? Math.round((totalCompletions / totalEnrollments) * 100) : 0;
    const totalCoursesEnrolled = performanceData.filter(course => course.totalEnrollments > 0).length;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalCourses,
          totalEnrollments,
          totalCompletions,
          totalCoursesEnrolled,
          overallCompletionRate: `${overallCompletionRate}%`
        },
        performanceData: paginatedData,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRecords: performanceData.length,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching course performance report',
      error: error.message
    });
  }
};
