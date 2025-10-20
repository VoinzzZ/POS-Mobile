const checkValidate = (validateSchema, req) => {
  const { error, value } = validateSchema.validate(req.body || {}, { abortEarly: false });
  if (error) {
    const errors = error.details.reduce((acc, cur) => {
      const field = Array.isArray(cur.path) ? cur.path.join('.') : String(cur.path);
      if (!acc[field]) acc[field] = [];
      acc[field].push(cur.message);
      return acc;
    }, {});
    return { error: errors, value }
  }

  return { error, value }
}

module.exports = { checkValidate };