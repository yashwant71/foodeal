import {model, Schema, Types} from 'mongoose';
import { Food, FoodSchema } from './food.model';

export interface CartItem{
    food: Food;
    price: number;
    quantity: number;
}

export const CartItemSchema = new Schema<CartItem>(
    {
        food:{type: FoodSchema, required: true},
        price:{ type: Number, required:true},
        quantity: {type: Number, required: true}
    }
);

export interface Cart{
    items: CartItem[];
    user: Types.ObjectId;
    totalCount:number;
    totalPrice:number;
    createdAt: Date;
    updatedAt: Date;
}

const cartSchema = new Schema<Cart>({
    items: {type: [CartItemSchema], required: true},
    user: {type: Schema.Types.ObjectId},
    totalPrice: {type: Number, required: true},
    totalCount: {type: Number, required: true}
},{
    timestamps: true,
    toJSON:{
        virtuals: true
    },
    toObject:{
        virtuals: true
    }
})

export const CartModel = model('cart', cartSchema);