const notFound = (req, res, next) => {
  res.status(404).json({ message: `Endpoint topilmadi: ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose noto'g'ri ObjectId
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resurs topilmadi';
  }
  // Mongoose validatsiya xatosi
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(', ');
  }
  // Takrorlanuvchi kalit (unique)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Bu ${field} allaqachon ro'yxatdan o'tgan`;
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
