import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  checkUserByEmailData,
  creatUserData,
  updateUserPasswordData,
} from '../services/user.js';
import { sendMail } from '../utils/sendEmail.js';
import excludeitems from '../utils/exclude.js';
/* eslint-disable no-undef */
const JWTPHRASE = process.env.JWTPHRASE;

export const register = async (req, res) => {
  try {
    const { email, username } = req.body;

    const checkuser = await checkUserByEmailData(email);
    if (checkuser) {
      return res
        .status(402)
        .json({ res: 'success', msg: `User is already exists with ${email}` });
    }

    // generate salt to hash password
    const salt = await bcrypt.genSalt(10);
    let password = Math.random().toString(36).slice(2, 10);
    const passwordhash = await bcrypt.hash(password, salt);
    const newuser = await creatUserData({
      email: email,
      username: username,
      password: passwordhash,
    });
    if (newuser) {
      await sendMail(
        'Welcome Car Portal (ROPSTAM)',
        `Hello! we are glad to welcoming you for registration in our portal \n Your Email:${newuser.email} \n Your Password: ${password}\n Please use the above credentional for signing in to portal.\nThanks`,
        newuser.email
      );

      res.status(200).json({
        res: 'success',
        msg: 'User is register please check your email for password',
      });
    } else {
      res
        .status(200)
        .json({ res: 'error', msg: 'Error accourd in user registration' });
    }
  } catch (error) {
    console.log('error-------------------------->', error);
    res.status(500).json({ res: 'error', msg: 'Error accourd' });
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const checkuser = await checkUserByEmailData(email);
    if (!checkuser) {
      return res
        .status(402)
        .json({ res: 'success', msg: `User is not exists with ${email}` });
    }
    const validpassword = await bcrypt.compare(password, checkuser.password);
    if (validpassword) {
      const token = jwt.sign(
        { email: checkuser.email, id: checkuser._id },
        JWTPHRASE
      );

      const updateuser = excludeitems(
        checkuser,
        'password',
        'updatedAt',
        '__v'
      );
      res.status(200).json({
        res: 'success',
        msg: 'User is logged in succesfully',
        data: checkuser,
        token: token,
        updateuser,
      });
    } else {
      res.status(500).json({ res: 'error', msg: 'Error accourd in logging' });
    }
  } catch (error) {
    console.log('error-------------------------->', error);
    res.status(500).json({ res: 'error', msg: 'Error accourd' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { email, password, newpassword } = req.body;
    const checkuser = await checkUserByEmailData(email);
    if (!checkuser) {
      return res
        .status(402)
        .json({ res: 'success', msg: `User is not exists with ${email}` });
    }
    const validpassword = await bcrypt.compare(password, checkuser.password);
    if (validpassword) {
      const salt = await bcrypt.genSalt(10);
      const passwordhash = await bcrypt.hash(newpassword, salt);
      const updatepass = await updateUserPasswordData(
        checkuser._id,
        passwordhash
      );
      if (updatepass) {
        res.status(200).json({
          res: 'success',
          msg: 'Password is changed',
        });
      } else {
        res
          .status(500)
          .json({ res: 'error', msg: 'Error accourd in changing password' });
      }
    } else {
      res
        .status(500)
        .json({ res: 'error', msg: 'Error accourd in changing password' });
    }
  } catch (error) {
    console.log('error-------------------------->', error);
    res.status(500).json({ res: 'error', msg: 'Error accourd' });
  }
};
