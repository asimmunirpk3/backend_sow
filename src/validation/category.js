import Joi from 'joi';

const validation = Joi.object({
  name: Joi.string(),
});

const categoryValidation = async (req, res, next) => {
  const payload = {
    name: req.body.name,
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
export default categoryValidation;
