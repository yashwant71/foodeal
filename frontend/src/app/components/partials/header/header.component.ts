import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/services/cart.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/shared/models/User';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  cartQuantity=0;
  user!:User;
  userImage: SafeUrl | null = null;
  selectedFile: File | null = null;
  constructor(cartService:CartService,private userService:UserService,private sanitizer: DomSanitizer,private router: Router) {
    cartService.getCartObservable().subscribe((newCart) => {
      if(newCart)
      this.cartQuantity = newCart.totalCount;
    })

    userService.userObservable.subscribe((newUser) => {
      this.user = newUser;
    })
  }

  ngOnInit(): void {

  }
  goToHome() {
    this.router.navigate(['/']);
  }
  goToCart() {
    this.router.navigate(['/cart-page']);
  }
  goToProfile(){
    this.router.navigate(['/profile']);
  }
  goToLogin(){
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        location.reload();
      }
    });
    this.router.navigateByUrl('/login');
  }
  goToOrders(){
    this.router.navigate(['/orders']);
  }

  logout(){
    this.userService.logout();
  }

  get isAuth(){
    return this.user.token;
  }
}
