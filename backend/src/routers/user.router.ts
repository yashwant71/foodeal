import {Router} from 'express';
import { sample_users } from '../data';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { User, UserModel } from '../models/user.model';
import { HTTP_BAD_REQUEST } from '../constants/http_status';
import bcrypt from 'bcryptjs';
const router = Router();
import multer, { Multer } from 'multer';
import * as fs from 'fs';
import * as glob from 'glob';
import mime from 'mime-types';
import { GoogleAuth, GoogleAuthOptions, TokenPayload ,OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import { JSONClient } from 'google-auth-library/build/src/auth/googleauth';
dotenv.config();

import * as https from 'https';

/// Created an instance of Multer to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/user'); // setting the folder to which the file will be saved
  },
  filename: function (req, file, cb) {
    const userId = req.params.userId;
    const ext = file.originalname.split('.').pop();
    cb(null, userId + '.' + ext); // setting the filename of the saved file as the userId
  }
});
const upload = multer({ storage: multer.memoryStorage() });



router.post('/uploadUserImage/:userId', upload.single('image'), asyncHandler(
  async (req, res) => {
    const userId = req.params.userId;
    console.log("userId:",req.params.userId)
    console.log(req.file)
    if (req.file) {
      const imageBuffer = req.file.buffer;
      const base64String = Buffer.from(imageBuffer).toString('base64');
      const imageSrc = `data:${req.file.mimetype};base64,${base64String}`;
      console.log('New image saved');
      
      const user = await UserModel.findById(userId);
      if(user){
        user.image = imageSrc;
        await user?.save();
        
        res.send(generateTokenReponse(user));
      }
    } else {
      res.status(400).send({ message: "Please upload an image file" });
    }
  }
));
router.get("/seed", asyncHandler(
  async (req, res) => {
     const usersCount = await UserModel.countDocuments();
     if(usersCount> 0){
       res.send("Seed is already done!");
       return;
     }
 
     await UserModel.create(sample_users);
     res.send("Seed Is Done!");
 }
 ))

 router.get("/isSeller/:userId/:isSeller", asyncHandler(
  async (req, res) => {
    const userId = req.params.userId;
    const isSeller = req.params.isSeller;
    const updatedUser = await UserModel.findByIdAndUpdate(userId, { $set: { isSeller:isSeller } }, { new: true });
    if(updatedUser)
    res.status(200).json(generateTokenReponse(updatedUser));
 }
 ))

router.post("/login", asyncHandler(
  async (req, res) => {
    const {email, password} = req.body;
    const user = await UserModel.findOne({email});
     if(user && !user.password){
      res.status(HTTP_BAD_REQUEST).send("user doesnt exist, login with google");
     }else if(user && (await bcrypt.compare(password,user.password))) {
      res.send(generateTokenReponse(user));
     }
     else{
       res.status(HTTP_BAD_REQUEST).send("Username or password is invalid!");
     }
  
  }
))

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
router.post('/loginwithgoogle', asyncHandler(async (req, res) => {
  const { credential } = req.body;
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const paydata = ticket.getPayload() as TokenPayload;
  //paydata.name ,paydata.email ,paydata.picture , save it in db and backend and return 
  const user = await UserModel.findOne({email:paydata.email});
  if(user){// then we will return that user's data 
    res.send(generateTokenReponse(user));
  }else{// we will create a new user data 
    const newUser = {
      email:paydata.email,
      name:paydata.name,
      isAdmin:false,
      address:''
    }
    const dbUser = await UserModel.create(newUser);
    console.log(paydata)
    // download the image
    const imageUrl = paydata.picture;
  
    // Make an HTTP request to the image URL
    if(imageUrl){
      dbUser.image = imageUrl;
      await dbUser.save(); // Save the updated user data in the database
      res.send(generateTokenReponse(dbUser))
    }
  }
}));
router.post('/register', asyncHandler(
  async (req, res) => {
    const {name, email, password, address} = req.body;
    const user = await UserModel.findOne({email});
    if(user){
      res.status(HTTP_BAD_REQUEST)
      .send('User is already exist, please login!');
      return;
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const newUser:User = {
      id:'',
      name,
      email: email.toLowerCase(),
      password: encryptedPassword,
      address,
      isAdmin: false
    }

    const dbUser = await UserModel.create(newUser);
    res.send(generateTokenReponse(dbUser));
  }
))

router.post('/update', asyncHandler(
  async (req:any, res) => {
    const {name, email, password, address} = req.body;
    const user = await UserModel.findOne({ email: new RegExp('^' + email + '$', 'i') }); //lower case and match last and start of string

    if(!user){
      res.status(HTTP_BAD_REQUEST)
      .send('user not found');
      return;
    }
    const encryptedPassword = await bcrypt.hash(password, 10);

    const updateUser:User = {
      id:'',
      name,
      email: email.toLowerCase(),
      password: encryptedPassword,
      address,
      isAdmin: false,
    }
    const updatedUser = await UserModel.findByIdAndUpdate(user.id,updateUser, { new: true });
    if(updatedUser)
      res.send(generateTokenReponse(updatedUser));
    else
      res.status(HTTP_BAD_REQUEST).send('user not updated');
  }
))

router.get('/favFood/:foodId/:userId', asyncHandler(
  async (req:any, res) => {
    
    const { foodId } = req.params;
    const { userId } = req.params;
    const user = await UserModel.findById(userId);
    if(user){
      const favFood = user.favFood || [];
      const index = favFood.indexOf(foodId);
      
      if (index !== -1) {
        // If the foodId already exists in the favFood array, remove it
        favFood.splice(index, 1);
      } else {
        // If the foodId does not exist in the favFood array, add it
        favFood.push(foodId);
      }
      
      user.favFood = favFood;
      const updatedUser =await user.save();
      
      if (index !== -1) {
        res.json({ user: generateTokenReponse(updatedUser),message: 'Removed from favorites' });
      } else {
        res.json({ user: generateTokenReponse(updatedUser),message: 'Added to favorites' });
      }
    }else{
      res.status(HTTP_BAD_REQUEST).send('login to update');
    }
  }
))

const generateTokenReponse = (user : User) => {
  const token = jwt.sign({
    id: user.id, email:user.email, isAdmin: user.isAdmin
  },process.env.JWT_SECRET!,{
    expiresIn:"30d"
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    address: user.address,
    isAdmin: user.isAdmin,
    token: token,
    favFood :user.favFood,
    image:user?.image,
    isSeller:user?.isSeller
  };
}


export default router;