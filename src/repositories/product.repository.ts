import { ProductModel } from "../models/product.model"
import { FilterQuery } from "mongoose"
import { type IProduct } from "./../models/product.model"
import { type ProductUpdateType } from "../types/product/product-update"
import { type ProductCreateType } from "../types/product/product-create"

export const productsRepository = {
  async findProducts(title?: string): Promise<IProduct[]> {
    let filter: FilterQuery<IProduct> = {}

    if (title) {
      filter.title = { $regex: title, $options: "i" }
    }

    return ProductModel.find(filter).exec()
  },

  async findProductById(id: string): Promise<IProduct | null> {
    return ProductModel.findOne({ id }).exec()
  },

  async createProduct(newProduct: ProductCreateType): Promise<IProduct> {
    return await ProductModel.create(newProduct)
  },

  async updateProduct(id: string, updatedProduct: ProductUpdateType): Promise<IProduct | null> {
    return ProductModel.findOneAndUpdate({ id }, { $set: updatedProduct }, { new: true }).exec()
  },

  async deleteProduct(id: string): Promise<boolean> {
    const result = await ProductModel.deleteOne({ id })
    return result.deletedCount === 1
  },

  deleteAllProducts() {},
}
