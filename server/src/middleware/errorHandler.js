import { ZodError } from 'zod';

export function errorHandler(err, req, res, next) {
  console.error('[Error Handler]', err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }

  // Handle Prisma specific known errors
  if (err.code === 'P2002') {
    const target = err.meta?.target ? err.meta.target.join(', ') : 'field';
    return res.status(409).json({
      success: false,
      message: `A record with this ${target} already exists.`,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Requested record was not found.',
    });
  }

  // Handle custom application errors with status
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  // Generic server error
  return res.status(500).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
  });
}
