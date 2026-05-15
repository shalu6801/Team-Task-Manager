export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler = (error, req, res, next) => {
  const status = error.status || 500;
  const message = status === 500 ? 'Something went wrong' : error.message;

  if (process.env.NODE_ENV !== 'test') {
    console.error(error);
  }

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
};
