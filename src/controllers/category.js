import {checkUserByEmailData} from '../services/user.js';
import {
  getAllCategoriesData,
  creatCategoryData,
  checkCategoryByName,
  getCategoryByIdData,
  updateCategoryByidData,
  deleteCategoryData,
} from '../services/category.js';

export const getAllCategories = async (req, res) => {
  try {
    const useremail = req.email;
    const checkuser = await checkUserByEmailData (useremail);
    if (!checkuser) {
      return res.status (402).json ({
        res: 'error',
        msg: `User is not exists with ${useremail}`,
      });
    }
    const categories = await getAllCategoriesData ();
    if (categories) {
      res.status (200).json ({
        res: 'success',
        msg: 'All categorys Data are fetched',
        data: categories,
      });
    } else {
      res
        .status (200)
        .json ({res: 'error', msg: 'Error accourd in fetching categories'});
    }
  } catch (error) {
    console.log ('error-------------------------->', error);
    res.status (500).json ({res: 'error', msg: 'Error accourd'});
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const useremail = req.email;
    const categoryid = req.params.id;
    const checkuser = await checkUserByEmailData (useremail);
    if (!checkuser) {
      return res.status (402).json ({
        res: 'error',
        msg: `User is not exists with ${useremail}`,
      });
    }
    console.log (categoryid, '------------------------>');
    const category = await getCategoryByIdData (categoryid);
    if (category) {
      res.status (200).json ({
        res: 'success',
        msg: 'Category are fetched',
        data: category,
      });
    } else {
      res
        .status (200)
        .json ({res: 'error', msg: 'Error accourd in fetching category'});
    }
  } catch (error) {
    console.log ('error-------------------------->', error);
    res.status (500).json ({res: 'error', msg: 'Error accourd'});
  }
};

export const addCategory = async (req, res) => {
  try {
    const {name} = req.body;
    const useremail = req.email;
    const checkuser = await checkUserByEmailData (useremail);
    if (!checkuser) {
      return res.status (402).json ({
        res: 'error',
        msg: `User is not exists with ${useremail}`,
      });
    }
    const checkcategory = await checkCategoryByName (name.toLowerCase ());
    if (checkcategory) {
      return res.status (403).json ({
        res: 'error',
        msg: `Category is already exists`,
      });
    }
    const category = await creatCategoryData ({name: name.toLowerCase ()});
    if (category) {
      res.status (200).json ({
        res: 'success',
        msg: 'Category is created now.',
      });
    } else {
      res
        .status (500)
        .json ({res: 'error', msg: 'Error accourd in adding category'});
    }
  } catch (error) {
    console.log ('error-------------------------->', error);
    res.status (500).json ({res: 'error', msg: 'Error accourd'});
  }
};

export const updateCategory = async (req, res) => {
  try {
    const {name} = req.body;
    const useremail = req.email;
    const id = req.params.id;
    const checkuser = await checkUserByEmailData (useremail);
    if (!checkuser) {
      return res.status (402).json ({
        res: 'error',
        msg: `User is not exists with ${useremail}`,
      });
    }
    const checkcategory = await getCategoryByIdData (id);
    if (!checkcategory) {
      return res.status (403).json ({
        res: 'error',
        msg: `Category is already exists`,
      });
    }

    const category = await updateCategoryByidData (checkcategory._id, {
      name: name.toLowerCase (),
    });
    if (category) {
      res.status (200).json ({
        res: 'success',
        msg: 'Category data is updated now',
      });
    } else {
      res
        .status (500)
        .json ({res: 'error', msg: 'Error accourd in updateing category'});
    }
  } catch (error) {
    console.log ('error-------------------------->', error);
    res.status (500).json ({res: 'error', msg: 'Error accourd'});
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const useremail = req.email;
    const id = req.params.id;
    const checkuser = await checkUserByEmailData (useremail);
    if (!checkuser) {
      return res.status (402).json ({
        res: 'error',
        msg: `User is not exists with ${useremail}`,
      });
    }
    const checkcategory = await getCategoryByIdData (id);
    if (!checkcategory) {
      return res.status (403).json ({
        res: 'error',
        msg: `Category is already exists`,
      });
    }

    const category = await deleteCategoryData (checkcategory._id);
    if (category) {
      res.status (200).json ({
        res: 'success',
        msg: 'Category is deleted now.',
      });
    } else {
      res
        .status (500)
        .json ({res: 'error', msg: 'Error accourd in deleteing category'});
    }
  } catch (error) {
    console.log ('error-------------------------->', error);
    res.status (500).json ({res: 'error', msg: 'Error accourd'});
  }
};
