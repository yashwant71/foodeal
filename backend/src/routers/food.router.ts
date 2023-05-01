import {Router} from 'express';
import { sample_foods, sample_tags } from '../data';
import asyncHandler from 'express-async-handler';
import { FoodModel } from '../models/food.model';
import fs from 'fs';
import path from 'path';
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


router.get("/",asyncHandler(
  async (req, res) => {
    const foods = await FoodModel.find();
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
    const foods = await FoodModel.find({name: {$regex:searchRegex}})
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
    const foods = await FoodModel.find({tags: req.params.tagName})
    res.send(foods);
  }
))

router.get("/:foodId", asyncHandler(
  async (req, res) => {
    const food = await FoodModel.findById(req.params.foodId);
    res.send(food);
  }
))


export default router;