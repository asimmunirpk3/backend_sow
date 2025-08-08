import bcrypt from 'bcrypt';
import { getUserData } from '../services/user.js';
import { userModel } from '../models/user.js';
import { createSecretToken } from '../utils/SecretToken.js';

export const registerApi = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    if (!email || !lastName || !firstName || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ status: 'error', message: 'All fields are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 8 characters',
      });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Passwords do not match' });
    }

    const isEmailExist = await userModel.findOne({ email });
    if (isEmailExist) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Email already in use' });
    }

    const user = await userModel.create({
      firstName,
      lastName,
      email,
      password,
    });

    const token = createSecretToken({ id: user._id });

    const userData = await getUserData(user);
    res.status(201).json({
      status: 'success',
      data: {
        token,
        user: userData,
      },
      message: 'Registration Successful',
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const loginApi = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'All fields are required',
      });
    }

  
    const user = await userModel.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    if (user.deletedAt) {
      return res.status(400).json({
        status: 'error',
        message: 'Account has been deleted',
      });
    }

    const token = createSecretToken({ id: user._id });
    const userData = await getUserData(user);

    res.status(201).json({
      status: 'success',
      data: {
        token,
        user: userData,
      },
      message: 'Login successful',
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const logoutApi = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax"
    });

    return res
      .status(200)
      .json({ status: "success", message: "You have been logged out." });
  } catch (err) {
    return res
      .status(500)
      .json({ status: "error", message: err.message });
  }
};

export const getCurrentUserApi = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user.id)
      .select('-password')

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

export const userSettigApi = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Unauthorized: User ID missing' });
    }

    const { firstName, lastName, password } =
      req.body;
    console.log("firdt", firstName)

    const updateData = {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
    };

    if (password.length < 8) {
      return res
        .status(400)
        .json({ status: "error", message: "Password must be atleast 8 characters long" });
    } else {
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
