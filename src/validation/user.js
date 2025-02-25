import Joi from 'joi';

const validation = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

const userValidation = async (req, res, next) => {
  const payload = {
    email: req.body.email,
    password: req.body.password,
  };

  const { error } = validation.validate(payload);
  if (error) {
    res.status(406);
    return res
      .status(406)
      .json({ status: false, message: 'Error in category Data', error });
  } else {
    next();
  }
};
export default userValidation;
