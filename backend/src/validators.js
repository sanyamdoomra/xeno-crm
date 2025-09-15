const Joi = require('joi');

function validateCustomer(data) {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    totalSpend: Joi.number().min(0).required(),
    visits: Joi.number().integer().min(0).required(),
    lastActive: Joi.date().required()
  });
  return schema.validate(data);
}

function validateOrder(data) {
  const schema = Joi.object({
    customerId: Joi.number().integer().required(),
    amount: Joi.number().min(0).required(),
    date: Joi.date().required()
  });
  return schema.validate(data);
}

function validateSegment(data) {
  const schema = Joi.object({
    rules: Joi.array().items(
      Joi.object({
        field: Joi.string().required(),
        operator: Joi.string().required(),
        value: Joi.string().required()
      })
    ).required(),
    logic: Joi.string().valid('AND', 'OR').required(),
    name: Joi.string().optional()
  });
  return schema.validate(data);
}

module.exports = { validateCustomer, validateOrder, validateSegment };
