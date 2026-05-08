import type { RequestHandler } from 'express'

export function asyncHandler<P>(fn: RequestHandler<P>): RequestHandler<P> {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
