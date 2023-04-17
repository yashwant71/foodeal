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
    const files = glob.sync(`./uploads/user/${userId}.*`); // find all files that match the pattern
    files.forEach((file) => {
      console.log("file::",file)
      fs.unlinkSync(file); // delete each file
    });
    if(req.file){// adding the image 
      const newImagePath = `./uploads/user/${userId}.${req.file.originalname.split('.').pop()}`;
      fs.writeFile(newImagePath, req.file.buffer, (err) => {
        if (err) throw err;
        console.log('New image saved');
      });
      const imageBuffer = req.file.buffer;
      res.set('Content-Type', req.file.mimetype);
      res.send(imageBuffer);
    }else {
      res.status(400).send({ message: "Please upload an image file" });
    }
  }
));
router.get('/getUserImage/:userId', asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const imagePath = `./uploads/user/${userId}.*`;
  const files = glob.sync(imagePath);
  
  if (files.length > 0) {
    const fileContent = fs.readFileSync(files[0]);
    const mimeType = mime.lookup(files[0]) || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);
    res.send(fileContent);
  } else {
    res.status(404).send({ message: 'Image not found' });
  }
}));
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
      const imagePath = `uploads/user/${dbUser.id}`;
      
      https.get(imageUrl, (response) => {
        const contentType = response.headers['content-type'];
        const fileExtension = contentType ? contentType.split('/').pop() : 'jpg';
        const fileName = `${imagePath}.${fileExtension}`;
        const file = fs.createWriteStream(fileName);
    
        response.pipe(file);
    
        file.on('finish', () => {
          file.close();
          console.log(`Image saved as ${fileName}`);
          res.send(generateTokenReponse(dbUser));

        });
    
        file.on('error', (error) => {
          res.status(HTTP_BAD_REQUEST).send("image not saved for user");
        });
      }).on('error', (error) => {
        console.error(`Error downloading image: ${error}`);
      });

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
      isAdmin: false
    }
    const updatedUser = await UserModel.findByIdAndUpdate(user.id,updateUser, { new: true });
    if(updatedUser)
      res.send(generateTokenReponse(updatedUser));
    else
      res.status(HTTP_BAD_REQUEST).send('user not updated');
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
      token: token
    };
  }
  

  export default router;