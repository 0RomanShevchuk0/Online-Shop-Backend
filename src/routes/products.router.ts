import { HTTP_STATUSES } from "./../constants/httpStatuses"
import { Response, Router } from "express"
import { body, Result, ValidationError, checkExact } from "express-validator"
import { inputValidationMiddlevare } from "../middlewares/input-validation-middlevare"
import { IProduct, ProductModel } from "../models/product.model"
import { productsRepository } from "../repositories/product.repository"
import { v4 as uuidv4 } from "uuid"
import { type ProductViewType } from "../types/product/product-view"
import { type ProductCreateType } from "../types/product/product-create"
import { type ProductUpdateType } from "../types/product/product-update"
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
} from "../types/request.types"
import { QueryProductsType, URIParamProductIdType } from "../types/product/product-request.types"

const getProductViewModel = (dbProduct: IProduct): ProductViewType => {
  return {
    id: dbProduct.id,
    title: dbProduct.title,
    price: dbProduct.price,
  }
}

// to-do: type requests

const productValidation = checkExact(
  [
    body("title", "Title length should be 3-30 symbols").isString().isLength({ min: 3, max: 30 }),
    body("price").isNumeric({ no_symbols: true }),
  ],
  {
    message: "Unknown fields specified",
  }
)

export const productsRouter = Router()

productsRouter.get(
  "/",
  async (req: RequestWithQuery<QueryProductsType>, res: Response<ProductViewType[]>) => {
    const { title } = req.query

    try {
      const filteredProducts = await productsRepository.findProducts(title as string)
      res.json(filteredProducts.map(getProductViewModel))
    } catch (error) {
      res.sendStatus(HTTP_STATUSES.SERVER_ERROR_500)
    }
  }
)

productsRouter.get(
  "/:id",
  async (req: RequestWithParams<URIParamProductIdType>, res: Response<ProductViewType>) => {
    const productId = req.params.id

    try {
      const foundProduct = await productsRepository.findProductById(productId)
      if (!foundProduct) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
      }
      res.json(getProductViewModel(foundProduct))
    } catch (error) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    }
  }
)

productsRouter.post(
  "/",
  productValidation,
  inputValidationMiddlevare,
  async (
    req: RequestWithBody<ProductCreateType>,
    res: Response<ProductViewType | Result<ValidationError>>
  ) => {
    try {
      const newProduct = new ProductModel({
        id: uuidv4(),
        title: req.body.title,
        price: req.body.price,
      })

      const createdProduct = await productsRepository.createProduct(newProduct)

      res.status(HTTP_STATUSES.CREATED_201).json(getProductViewModel(createdProduct))
    } catch (error) {
      res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
    }
  }
)

productsRouter.patch(
  "/:id",
  productValidation,
  inputValidationMiddlevare,
  async (
    req: RequestWithParamsAndBody<URIParamProductIdType, ProductUpdateType>,
    res: Response<ProductViewType | Result<ValidationError>>
  ) => {
    const productId = req.params.id
    try {
      const updatedProduct = await productsRepository.updateProduct(productId, req.body)

      if (!updatedProduct) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
      }

      res.status(HTTP_STATUSES.OK_200).json(getProductViewModel(updatedProduct))
    } catch (error) {
      res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
    }
  }
)

productsRouter.delete(
  "/:id",
  async (req: RequestWithParams<URIParamProductIdType>, res: Response) => {
    const productId = req.params.id
    try {
      const isDeleted = await productsRepository.deleteProduct(productId)
      const resultStatus = isDeleted ? HTTP_STATUSES.NO_CONTENT_204 : HTTP_STATUSES.NOT_FOUND_404

      res.sendStatus(resultStatus)
    } catch (error) {
      res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
    }
  }
)
