import { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

/**
 * Standardized API response format
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

/**
 * Send a successful response
 */
export function success<T>(c: Context, data: T, meta?: ApiResponse['meta'], status: ContentfulStatusCode = 200) {
  return c.json<ApiResponse<T>>({
    success: true,
    data,
    meta,
  }, status);
}

/**
 * Send a created response (201)
 */
export function created<T>(c: Context, data: T) {
  return success(c, data, undefined, 201);
}

/**
 * Send a no content response (204)
 */
export function noContent(c: Context) {
  return c.body(null, 204);
}

/**
 * Send an error response
 */
export function error(
  c: Context,
  code: string,
  message: string,
  status: ContentfulStatusCode = 400,
  details?: unknown
) {
  return c.json<ApiResponse>({
    success: false,
    error: {
      code,
      message,
      details,
    },
  }, status);
}

/**
 * Common error responses
 */
export const errors = {
  badRequest: (c: Context, message: string = 'Bad request', details?: unknown) =>
    error(c, 'BAD_REQUEST', message, 400, details),
  
  unauthorized: (c: Context, message: string = 'Unauthorized') =>
    error(c, 'UNAUTHORIZED', message, 401),
  
  forbidden: (c: Context, message: string = 'Forbidden') =>
    error(c, 'FORBIDDEN', message, 403),
  
  notFound: (c: Context, resource: string = 'Resource') =>
    error(c, 'NOT_FOUND', `${resource} not found`, 404),
  
  conflict: (c: Context, message: string = 'Conflict') =>
    error(c, 'CONFLICT', message, 409),
  
  validationError: (c: Context, details: unknown) =>
    error(c, 'VALIDATION_ERROR', 'Validation failed', 422, details),
  
  internalError: (c: Context, message: string = 'Internal server error') =>
    error(c, 'INTERNAL_ERROR', message, 500),
};

/**
 * Paginated response helper
 */
export function paginated<T>(
  c: Context,
  data: T[],
  page: number,
  limit: number,
  total: number
) {
  return success(c, data, {
    page,
    limit,
    total,
    hasMore: page * limit < total,
  });
}


