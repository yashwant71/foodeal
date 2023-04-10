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
    }
    res.send({ message: "Image uploaded successfully" });
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

router.post("/login", asyncHandler(
  async (req, res) => {
    const {email, password} = req.body;
    const user = await UserModel.findOne({email});
  
     if(user && (await bcrypt.compare(password,user.password))) {
      res.send(generateTokenReponse(user));
     }
     else{
       res.status(HTTP_BAD_REQUEST).send("Username or password is invalid!");
     }
  
  }
))
  
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