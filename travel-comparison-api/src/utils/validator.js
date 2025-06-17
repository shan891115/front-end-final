const { body, validationResult } = require('express-validator');

const validateUrls = [
  body('urls')
    .isArray()
    .withMessage('URLs must be an array')
    .notEmpty()
    .withMessage('URLs array cannot be empty')
    .custom((urls) => {
      urls.forEach((url) => {
        if (!/^https?:\/\/.+/.test(url)) {
          throw new Error(`Invalid URL: ${url}`);
        }
      });
      return true;
    }),
];

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateUrls,
  validateRequest,
};