import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/services/cart.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/shared/models/User';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  cartQuantity=0;
  user!:User;
  userImage: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  constructor(cartService:CartService,private userService:UserService) {
    cartService.getCartObservable().subscribe((newCart) => {
      this.cartQuantity = newCart.totalCount;
    })

    userService.userObservable.subscribe((newUser) => {
      this.user = newUser;
    })
   }

  ngOnInit(): void {
    // adding image from localstorage
    const userImage = localStorage.getItem(`userImage_${this.userService.currentUser.id}`);
    if (userImage) {
      this.userImage = userImage;
    }
    // if we receive image updated event we update the image
    this.userService.userImageUpdated$.subscribe(() => {
      const userImage = localStorage.getItem(`userImage_${this.userService.currentUser.id}`);
      if (userImage) {
        this.userImage = userImage;
      }
    })
  }

  logout(){
    this.userService.logout();
  }

  get isAuth(){
    return this.user.token;
  }
}
