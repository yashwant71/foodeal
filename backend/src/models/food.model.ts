import {Schema, model} from 'mongoose';

export interface Food{
    id:string;
    name:string;
    price:number;
    tags: string[];
    stars: number;
    origins: string[];
    cookTime:string;
    image:string;
    seller: Schema.Types.ObjectId;
}

export const FoodSchema = new Schema<Food>(
    {
        name: {type: String, required:true},
        price: {type: Number, required:true},
        tags: {type: [String]},
        stars: {type: Number, required:true},
        origins: {type: [String], required:true},
        cookTime: {type: String, required:true},
        image:{type:String},
        seller: { type: Schema.Types.ObjectId, ref: 'user' } // Reference to User model
    },{
        toJSON:{
            virtuals: true
        },
        toObject:{
            virtuals: true
        },
        timestamps:true
    }
);

export const FoodModel = model<Food>('food', FoodSchema);