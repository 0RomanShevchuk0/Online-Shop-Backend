	import mongoose, { Document, Schema } from "mongoose"

	// Тип для продукта
	export interface IProduct extends Document {
		id: string
		title: string
		price: number
	}

	// Схема продукта
	const ProcutSchema = new Schema<IProduct>({
		id: { type: String, required: true, unique: true },
		title: { type: String, required: true },
		price: { type: Number, required: true },
	})

	// Модель продукта
	export const ProductModel = mongoose.model<IProduct>("Product", ProcutSchema)
