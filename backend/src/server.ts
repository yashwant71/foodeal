import dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import fs from 'fs';
import express from "express";
import cors from "cors";
import foodRouter from './routers/food.router';
import userRouter from './routers/user.router';
import orderRouter from './routers/order.router';
import { dbConnect } from './configs/database.config';
dbConnect();


const dirPath = path.join(__dirname, './uploads');

if (fs.existsSync(dirPath)) {
  // directory exists, set permissions
  fs.chmod(dirPath, 0o755, (err) => {
    if (err) throw err;
    console.log('Folder permission set to 755');
  });
} else {
  // directory does not exist
  console.log('Directory does not exist!');
}

const app = express();
app.use(express.json());
app.use(cors({
    credentials:true,
    origin:["http://localhost:4200"]
}));

app.use("/api/foods", foodRouter);
app.use("/api/users", userRouter);
app.use("/api/orders", orderRouter);

app.use(express.static('public'));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname,'public', 'index.html'))
})

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log("Website served on http://localhost:" + port);
})