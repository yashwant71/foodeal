import {Router} from 'express';
import { sample_foods, sample_tags } from '../data';
import asyncHandler from 'express-async-handler';
import { FoodModel } from '../models/food.model';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
const router = Router();

router.get("/seed", asyncHandler(
 async (req, res) => {
    const foodsCount = await FoodModel.countDocuments();
    if(foodsCount> 0){
      res.send("Seed is already done!");
      return;
    }

    await FoodModel.create(sample_foods);
    res.send("Seed Is Done!");
}
))

router.get('/count/:localCount',asyncHandler(
  async(req,res)=>{
    const localCount = Number(req.params.localCount);
    const foodsCount = await FoodModel.countDocuments();

    if(foodsCount == localCount){
      res.send(true);
      return;
    }else{
      res.send(false);
    }
  }
))

router.get("/",asyncHandler(
  async (req, res) => {
    const foods = await FoodModel.find().populate('seller','name email');
    // async function readImageFile(imagePath: string): Promise<string> {
    //   const data = await fs.promises.readFile(imagePath);
    //   const base64 = data.toString('base64');
    //   return `data:image/png;base64,${base64}`;
    // }
    // for (let food of foods) {
    //   // const imagePath = path.join(imageUrl);
    //   const imageBuffer = await readImageFile(food.imageUrl);
    //   food.image = imageBuffer;
    //   await food.save(); // save the updated food object to the database
    // }
      res.send(foods);
  }
))

router.get("/search/:searchTerm", asyncHandler(
  async (req, res) => {
    const searchRegex = new RegExp(req.params.searchTerm, 'i');
    const foods = await FoodModel.find({name: {$regex:searchRegex}}).populate('seller','name email');
    res.send(foods);
  }
))

router.get("/tags", asyncHandler(
  async (req, res) => {
    const tags = await FoodModel.aggregate([
      {
        $unwind:'$tags'
      },
      {
        $group:{
          _id: '$tags',
          count: {$sum: 1}
        }
      },
      {
        $project:{
          _id: 0,
          name:'$_id',
          count: '$count'
        }
      }
    ]).sort({count: -1});

    const all = {
      name : 'All',
      count: await FoodModel.countDocuments()
    }

    tags.unshift(all);
    res.send(tags);
  }
))

router.get("/tag/:tagName",asyncHandler(
  async (req, res) => {
    const foods = await FoodModel.find({tags: req.params.tagName}).populate('seller','name email');
    res.send(foods);
  }
))

router.get("/:foodId", asyncHandler(
  async (req, res) => {
    const food = await FoodModel.findById(req.params.foodId).populate('seller','name email image');;
    res.send(food);
  }
))


router.post('/add', asyncHandler(async (req, res) => {
  const dataToUpload = req.body;
  const sellerId = req.body.seller;
  // Create a new instance of the Food model
  const newFood = new FoodModel({
    name: dataToUpload.name,
    price: dataToUpload.price,
    tags: dataToUpload.tags,
    cookTime: dataToUpload.cookTime,
    origins: dataToUpload.origins,
    image: dataToUpload.image,
    stars: 0,
    seller: sellerId
  });

  // Save the new food document to the database
  const savedFood = await newFood.save();
  console.log(savedFood)
  
  res.status(201).json(savedFood);
}));

export default router;