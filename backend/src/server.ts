import dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import fs from 'fs';
import express from "express";
import cors from "cors";
import foodRouter from './routers/food.router';
import userRouter from './routers/user.router';
import orderRouter from './routers/order.router';
import cartRouter from './routers/cart.router';
import { dbConnect } from './configs/database.config';
dbConnect();


const uploadsDirPath = path.join(__dirname, 'uploads');
const userDirPath = path.join(uploadsDirPath, 'user');

if (!fs.existsSync(uploadsDirPath)) {
  // create uploads directory if it doesn't exist
  fs.mkdirSync(uploadsDirPath);
  console.log("uploads didnt exist ,thus created uploads")
}

if (!fs.existsSync(userDirPath)) {
    // create user directory if it doesn't exist
    fs.mkdirSync(userDirPath);
    console.log("user didnt exist ,thus created user")
}

// set permissions for both directories
fs.chmodSync(uploadsDirPath, 0o755);
console.log("gave 755 perms to uploads")
fs.chmodSync(userDirPath, 0o755);
console.log("gave 755 perms to user")

const app = express();
app.use(express.json());
app.use(cors({
    credentials:true,
    origin:["http://localhost:4200"]
}));

app.use("/api/foods", foodRouter);
app.use("/api/users", userRouter);
app.use("/api/orders", orderRouter);
app.use('/api/cart', cartRouter)

app.use(express.static('public'));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname,'public', 'index.html'))
})

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log("Website served on http://localhost:" + port);
})