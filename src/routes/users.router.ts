import { HTTP_STATUSES } from "./../constants/httpStatuses"
import { Request, Response, Router } from "express"
import { body, Result, ValidationError, checkExact } from "express-validator"
import { inputValidationMiddlevare } from "../middlewares/input-validation-middlevare"
import { v4 as uuidv4 } from "uuid"
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
} from "../types/request.types"
import { QueryProductsType, URIParamProductIdType } from "../types/product/product-request.types"
import { IUser, UserModel } from "../models/user.model"
import { UserViewType } from "../types/user/user-view"
import { UserCreateType } from "../types/user/user-create"
import { UserUpdateType } from "../types/user/user-update"
import { usersRepository } from "../repositories/users.repository"
import { MONGO_ERROR_CODES } from "../constants/mongoErrorCodes"

const getUserViewModel = (dbUser: IUser): UserViewType => {
  return {
    id: dbUser.id,
    email: dbUser.email,
    firstName: dbUser.firstName,
    lastName: dbUser.lastName,
  }
}

const userValidation = (isCreate: boolean) => {
  return checkExact(
    [
      body("email", "Please provide a valid email address.")
        .if((_, { req }) => isCreate || req.body.email !== undefined)
        .isEmail()
        .normalizeEmail(),
      body(
        "password",
        "Password must be at least 8 characters long, contain at least one uppercase letter, one number, and one special character."
      )
        .if((_, { req }) => isCreate || req.body.password !== undefined)
        .isStrongPassword({
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        }),

      body("firstName", "First name must be a string.").optional().isString(),
      body("lastName", "Last name must be a string.").optional().isString(),
    ],
    {
      message: "Unknown fields specified",
    }
  )
}

export const usersRouter = Router()

usersRouter.get("/", async (req: Request, res: Response<UserViewType[]>) => {
  try {
    const users = await usersRepository.findUsers()
    res.json(users.map(getUserViewModel))
  } catch (error) {
    res.sendStatus(HTTP_STATUSES.SERVER_ERROR_500)
  }
})

usersRouter.get(
  "/:id",
  async (req: RequestWithParams<URIParamProductIdType>, res: Response<UserViewType>) => {
    const userId = req.params.id

    try {
      const foundUser = await usersRepository.findUserById(userId)
      if (!foundUser) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
      }
      res.json(getUserViewModel(foundUser))
    } catch (error) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    }
  }
)

usersRouter.post(
  "/",
  userValidation(true),
  inputValidationMiddlevare,
  async (
    req: RequestWithBody<UserCreateType>,
    res: Response<UserViewType | Result<ValidationError> | string>
  ) => {
    try {
      const newUser = new UserModel({
        id: uuidv4(),
        email: req.body.email,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
      })
      const createdUser = await usersRepository.createUser(newUser)
      res.status(HTTP_STATUSES.CREATED_201).json(getUserViewModel(createdUser))
    } catch (error: any) {
      if (error.code === MONGO_ERROR_CODES.DUPLICATE_KEY) {
        res.status(HTTP_STATUSES.BAD_REQUEST_400).send("Email is already taken")
        return
      }
      res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
    }
  }
)

usersRouter.patch(
  "/:id",
  userValidation(false),
  inputValidationMiddlevare,
  async (
    req: RequestWithParamsAndBody<URIParamProductIdType, UserUpdateType>,
    res: Response<UserViewType | Result<ValidationError>>
  ) => {
    const userId = req.params.id
    try {
      const updatedUser = await usersRepository.updateUser(userId, req.body)

      if (!updatedUser) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
      }

      res.status(HTTP_STATUSES.OK_200).json(getUserViewModel(updatedUser))
    } catch (error) {
      res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
    }
  }
)

usersRouter.delete("/:id", async (req: RequestWithParams<URIParamProductIdType>, res: Response) => {
  const userId = req.params.id
  try {
    const isDeleted = await usersRepository.deleteUser(userId)
    const resultStatus = isDeleted ? HTTP_STATUSES.NO_CONTENT_204 : HTTP_STATUSES.NOT_FOUND_404

    res.sendStatus(resultStatus)
  } catch (error) {
    res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
  }
})
