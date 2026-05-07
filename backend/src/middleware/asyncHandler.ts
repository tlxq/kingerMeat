import type { Request, Response, NextFunction, RequestHandler } from 'express'

// async controllern fångar fel och skickar dem till errorHandler
// RequestHandler<any> tillåter controllers med specifika param-typer, t.ex. Request<{ id: string }>
export function asyncHandler(fn: RequestHandler<any>): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
