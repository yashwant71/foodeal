import {Router} from 'express';
import { CartModel } from '../models/cart.model';
import asyncHandler from 'express-async-handler';
const router = Router();

router.get("/:userId", asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const cart = await CartModel.findOne({ user: userId });
  if (!cart) {// creating dummy cart if doesnt exists
    const newCart = new CartModel({ user: userId ,items:[],totalCount:0,totalPrice:0});
    await newCart.save();
    res.send(newCart);
  } else {
    res.send(cart);
  }
}));

router.post('/updateCart/:userId',
asyncHandler(async (req:any, res:any) => {
    const updatedCartData = req.body;
    const userId = req.params.userId;
    console.log("hellllo")
    console.log(userId
        )
    const existingCart = await CartModel.findOne({ user: userId });

  if (!existingCart) {
    // If the cart data does not exist, create a new cart document in the database
    const newCart = new CartModel({ user: userId, ...updatedCartData });
    await newCart.save();
    res.status(200).json(newCart);
  } else {
    // If the cart data already exists, update it with the new data
    existingCart.items = updatedCartData.items;
    existingCart.totalPrice = updatedCartData.totalPrice;
    existingCart.totalCount = updatedCartData.totalCount;
    await existingCart.save();
    res.status(200).json(existingCart);
  }
}))

export default router;