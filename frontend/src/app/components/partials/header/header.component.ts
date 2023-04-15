import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/services/cart.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/shared/models/User';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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
  constructor(cartService:CartService,private userService:UserService,private sanitizer: DomSanitizer) {
    cartService.getCartObservable().subscribe((newCart) => {
      this.cartQuantity = newCart.totalCount;
    })

    userService.userObservable.subscribe((newUser) => {
      this.user = newUser;
    })
   }

   ngOnInit(): void {
    // adding image from localstorage
    if(this.userService.currentUser.id){
      const userImage = localStorage.getItem(`userImage_${this.userService.currentUser.id}`);
      if (userImage) {
        const image = new Image();
        image.src = userImage;
        image.onload = () => {
          this.userImage = this.sanitizer.bypassSecurityTrustUrl(userImage);
        };
        image.onerror = () => { //if issue with localstorage image
          localStorage.removeItem(`userImage_${this.userService.currentUser.id}`);
          this.getUserImagefromBackend()
        };
      }else {
        // If the user image is not in local storage, retrieve it from the backend
        if (!this.userService.userImageRetrieved) {
          this.getUserImagefromBackend()
        }
      }

      // if we receive image updated event we update the image
      this.userService.userImageUpdated$.subscribe(() => {
        const userImage = localStorage.getItem(`userImage_${this.userService.currentUser.id}`);
        if (userImage) {
          this.userImage = this.sanitizer.bypassSecurityTrustUrl(userImage);
        }
      })
    }
  }
  getUserImagefromBackend(){
    this.userService.getUserImage(this.userService.currentUser.id).subscribe(image => {
      let reader = new FileReader();
      reader.addEventListener("load", () => {
        this.userImage = reader.result;
      }, false);

      if (image) {
        const url = URL.createObjectURL(image);
        reader.readAsDataURL(image);
        this.userImage = this.sanitizer.bypassSecurityTrustUrl(url);
        // Save the URL to local storage
        localStorage.setItem(`userImage_${this.userService.currentUser.id}`, url);
        this.userService.userImageUpdatedSubject.next(); //for letting profile know image is updated in local
      }
      this.userService.userImageRetrieved = true;
    });
  }
  logout(){
    this.userService.logout();
  }

  get isAuth(){
    return this.user.token;
  }
}
