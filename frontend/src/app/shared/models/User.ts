export class User{
  id!:string;
  email!:string;
  name!:string;
  address!:string;
  token!:string;
  isAdmin!:boolean;
  favFood?: string[];
  image?:string;
  isSeller?:Boolean;
}
