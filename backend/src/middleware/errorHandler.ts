import { Request, Response, NextFunction } from 'express';

export function errorHandler(error: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', error);

  if (error.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation error',
      details: error.errors,
    });
  }

  if (error.message.includes('API key')) {
    return res.status(500).json({
      error: 'Configuration error',
      message: 'The service is not properly configured. Please contact support.',
    });
  }

  if (error.message.includes('Rate limit') || error.message.includes('temporarily unavailable')) {
    return res.status(503).json({
      error: 'Service temporarily unavailable',
      message: error.message,
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong. Please try again later.',
  });
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}