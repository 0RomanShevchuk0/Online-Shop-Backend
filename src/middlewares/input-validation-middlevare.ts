import { NextFunction, Request, Response } from "express"
import { validationResult } from "express-validator"
import { HTTP_STATUSES } from "../constants/httpStatuses"

export const inputValidationMiddlevare = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUSES.BAD_REQUEST_400).send(errors)
  }

  next()
}
