import { userModel } from "../../models/user.js";
import mongoose from 'mongoose';


export const getAllUsersApi = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', active } = req.query;
    
    // Build query filter
    let query = { deletedAt: { $exists: false } };
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    if (active !== undefined) {
      query.active = active === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await userModel
      .find(query)
      .select('-password -googleId -facebookId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalUsers = await userModel.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / parseInt(limit));

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};


export const editUserApi = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, profilePicture, active, verified } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Check if user exists
    const existingUser = await userModel.findOne({ 
      _id: id, 
      deletedAt: { $exists: false } 
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is already taken by another user
    if (email && email !== existingUser.email) {
      const emailExists = await userModel.findOne({ 
        email, 
        _id: { $ne: id },
        deletedAt: { $exists: false }
      });
      
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Update user
    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
        ...(profilePicture !== undefined && { profilePicture }),
        ...(active !== undefined && { active }),
        ...(verified !== undefined && { verified }),
      },
      { new: true, runValidators: true }
    ).select('-password -googleId -facebookId');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// Delete user (soft delete)
export const deleteUserApi = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Check if user exists
    const user = await userModel.findOne({ 
      _id: id, 
      deletedAt: { $exists: false } 
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete user
    await userModel.findByIdAndUpdate(id, { 
      deletedAt: new Date(),
      active: false 
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// Assign role to user
export const assignRoleApi = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    if (!role || !['student', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "student" or "admin"'
      });
    }

    // Check if user exists
    const user = await userModel.findOne({ 
      _id: id, 
      deletedAt: { $exists: false } 
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user role
    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password -googleId -facebookId');

    res.status(200).json({
      success: true,
      message: 'Role assigned successfully',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning role',
      error: error.message
    });
  }
};

export const getAdminDetailsApi = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user.id)
      .select('-password')
    if (user.role !== "admin") {
      return res.status(404).json({ error: "User role is not admin" })
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const adminSettigApi = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Unauthorized: User ID missing' });
    }

     const user = await userModel
      .findById(req.user.id)
      .select('-password')
    if (user.role !== "admin") {
      return res.status(404).json({ error: "User role is not admin" })
    }

    const { firstName, lastName, password } =
      req.body;
    console.log("firdt", firstName)

    const updateData = {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
    };

    if (password && password !== '********') {
      updateData.password = password;
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      })
      .select('-password');

    if (!updatedUser) {
      return res
        .status(404)
        .json({ status: 'error', message: 'User not found' });
    }

    return res.status(200).json({
      status: 'success',
      message: 'user setting updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while updating profile',
    });
  }
};