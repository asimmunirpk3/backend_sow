import Joi from 'joi';

const validation = Joi.object({
  name: Joi.string().required(),
  category: Joi.string(),
  color: Joi.string(),
  model: Joi.string(),
  make: Joi.string(),
  registration: Joi.string(),
});

const carValidation = async (req, res, next) => {
  const payload = {
    name: req.body.name,
    category: req.body.category,
    color: req.body.color,
    model: req.body.model,
    make: req.body.make,
    registration: req.body.registration,
  };

  const { error } = validation.validate(payload);
  if (error) {
    res.status(406);
    return res
      .status(406)
      .json({ status: false, message: 'Error in car Data', error });
  } else {
    next();
  }
};
export default carValidation;
