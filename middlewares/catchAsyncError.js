const catchAsyncError = (f) => (req, res, next) => {
  Promise.resolve(f(req, res, next)).catch(next);
};

export default catchAsyncError;
