const notFound = (req, res, next) => {
  res.status(404).json({ message: `Endpoint topilmadi: ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  console.error('XATOLIK:', err);
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  if (err.name === 'CastError') { statusCode = 404; message = 'Resurs topilmadi'; }
  if (err.name === 'ValidationError') { statusCode = 400; message = Object.values(err.errors).map((v) => v.message).join(', '); }
  if (err.code === 11000) { statusCode = 400; message = `Bu ${Object.keys(err.keyValue)[0]} allaqachon ro'yxatdan o'tgan`; }

  res.status(statusCode).json({ message, stack: process.env.NODE_ENV === 'production' ? undefined : err.stack });
};

module.exports = { notFound, errorHandler };