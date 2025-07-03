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
      groupBy = 'month' // 'day', 'week', 'month', 'year'
    } = req.query;

    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get all courses with enrollment data
    let courseQuery = {};
    if (courseId) {
      courseQuery._id = courseId;
    }

    const courses = await courseModel.find(courseQuery);
    
    // Extract enrollment data
    let enrollmentData = [];
    
    courses.forEach(course => {
      course.courses.forEach(subCourse => {
        if (subCourse.completed_by && subCourse.completed_by.length > 0) {
          subCourse.completed_by.forEach(completion => {
            enrollmentData.push({
              courseId: course._id,
              courseMasterTitle: course.course_master_title,
              subCourseTitle: subCourse.course_title,
              userId: completion.userId,
              username: completion.username,
              completedAt: completion.completed_at,
              progress: completion.progress
            });
          });
        }
      });
    });

    // Apply date filter to enrollment data
    if (startDate || endDate) {
      enrollmentData = enrollmentData.filter(item => {
        const itemDate = new Date(item.completedAt);
        if (startDate && itemDate < new Date(startDate)) return false;
        if (endDate && itemDate > new Date(endDate)) return false;
        return true;
      });
    }

    // Group data based on groupBy parameter
    const groupedData = {};
    enrollmentData.forEach(item => {
      const date = new Date(item.completedAt);
      let key;
      
      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          key = String(date.getFullYear());
          break;
        default:
          key = date.toISOString().split('T')[0];
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
      if (item.progress === 100) {
        groupedData[key].completions++;
      }
    });

    // Calculate average progress for each group
    Object.keys(groupedData).forEach(key => {
      const relevantData = enrollmentData.filter(item => {
        const date = new Date(item.completedAt);
        let itemKey;
        
        switch (groupBy) {
          case 'day':
            itemKey = date.toISOString().split('T')[0];
            break;
          case 'week':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            itemKey = weekStart.toISOString().split('T')[0];
            break;
          case 'month':
            itemKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          case 'year':
            itemKey = String(date.getFullYear());
            break;
          default:
            itemKey = date.toISOString().split('T')[0];
        }
        
        return itemKey === key;
      });
      
      const totalProgress = relevantData.reduce((sum, item) => sum + item.progress, 0);
      groupedData[key].averageProgress = relevantData.length > 0 ? 
        Math.round(totalProgress / relevantData.length) : 0;
    });

    // Convert to array and sort
    const reportData = Object.values(groupedData).sort((a, b) => 
      new Date(a.period) - new Date(b.period)
    );

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedData = reportData.slice(skip, skip + parseInt(limit));
    const totalPages = Math.ceil(reportData.length / parseInt(limit));

    // Summary statistics
    const totalEnrollments = enrollmentData.length;
    const totalCompletions = enrollmentData.filter(item => item.progress === 100).length;
    const completionRate = totalEnrollments > 0 ? 
      Math.round((totalCompletions / totalEnrollments) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalEnrollments,
          totalCompletions,
          completionRate: `${completionRate}%`,
          averageProgress: totalEnrollments > 0 ? 
            Math.round(enrollmentData.reduce((sum, item) => sum + item.progress, 0) / totalEnrollments) : 0
        },
        reportData: paginatedData,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRecords: reportData.length,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
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
      sortBy = 'enrollments', // 'enrollments', 'completions', 'completion_rate'
      sortOrder = 'desc'
    } = req.query;

    // Get all courses
    const courses = await courseModel.find({});
    
    let performanceData = [];
    
    courses.forEach(course => {
      let courseStats = {
        courseId: course._id,
        courseMasterTitle: course.course_master_title,
        courseDescription: course.course_master_description,
        totalSubCourses: course.courses.length,
        totalEnrollments: 0,
        totalCompletions: 0,
        completionRate: 0,
        averageProgress: 0,
        subCourseStats: []
      };

      let allProgressValues = [];
      
      course.courses.forEach(subCourse => {
        let subCourseEnrollments = 0;
        let subCourseCompletions = 0;
        let subCourseProgress = [];
        
        if (subCourse.completed_by && subCourse.completed_by.length > 0) {
          subCourse.completed_by.forEach(completion => {
            const completionDate = new Date(completion.completed_at);
            
            // Apply date filter
            if (startDate && completionDate < new Date(startDate)) return;
            if (endDate && completionDate > new Date(endDate)) return;
            
            subCourseEnrollments++;
            allProgressValues.push(completion.progress);
            subCourseProgress.push(completion.progress);
            
            if (completion.progress === 100) {
              subCourseCompletions++;
            }
          });
        }
        
        courseStats.subCourseStats.push({
          title: subCourse.course_title,
          enrollments: subCourseEnrollments,
          completions: subCourseCompletions,
          completionRate: subCourseEnrollments > 0 ? 
            Math.round((subCourseCompletions / subCourseEnrollments) * 100) : 0,
          averageProgress: subCourseProgress.length > 0 ? 
            Math.round(subCourseProgress.reduce((sum, p) => sum + p, 0) / subCourseProgress.length) : 0
        });
        
        courseStats.totalEnrollments += subCourseEnrollments;
        courseStats.totalCompletions += subCourseCompletions;
      });
      
      courseStats.completionRate = courseStats.totalEnrollments > 0 ? 
        Math.round((courseStats.totalCompletions / courseStats.totalEnrollments) * 100) : 0;
      
      courseStats.averageProgress = allProgressValues.length > 0 ? 
        Math.round(allProgressValues.reduce((sum, p) => sum + p, 0) / allProgressValues.length) : 0;
      
      performanceData.push(courseStats);
    });

    // Sort data
    performanceData.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'enrollments':
          aVal = a.totalEnrollments;
          bVal = b.totalEnrollments;
          break;
        case 'completions':
          aVal = a.totalCompletions;
          bVal = b.totalCompletions;
          break;
        case 'completion_rate':
          aVal = a.completionRate;
          bVal = b.completionRate;
          break;
        default:
          aVal = a.totalEnrollments;
          bVal = b.totalEnrollments;
      }
      
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedData = performanceData.slice(skip, skip + parseInt(limit));
    const totalPages = Math.ceil(performanceData.length / parseInt(limit));

    // Overall statistics
    const totalCourses = performanceData.length;
    const totalEnrollments = performanceData.reduce((sum, course) => sum + course.totalEnrollments, 0);
    const totalCompletions = performanceData.reduce((sum, course) => sum + course.totalCompletions, 0);
    const overallCompletionRate = totalEnrollments > 0 ? 
      Math.round((totalCompletions / totalEnrollments) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalCourses,
          totalEnrollments,
          totalCompletions,
          overallCompletionRate: `${overallCompletionRate}%`
        },
        performanceData: paginatedData,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRecords: performanceData.length,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
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