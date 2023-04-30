import { UserService } from 'src/app/services/user.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from 'src/app/services/cart.service';
import { FoodService } from 'src/app/services/food.service';
import { Food } from 'src/app/shared/models/Food';
import { User } from 'src/app/shared/models/User';

@Component({
  selector: 'app-food-page',
  templateUrl: './food-page.component.html',
  styleUrls: ['./food-page.component.css']
})
export class FoodPageComponent implements OnInit {
  food!: Food;
  favClassVar?:string = 'fav favorite not';
  constructor(activatedRoute:ActivatedRoute, foodService:FoodService,
    private cartService:CartService, private router: Router,private userService:UserService) {
    activatedRoute.params.subscribe((params) => {
      if(params.id)
      foodService.getFoodById(params.id).subscribe(serverFood => {
        this.food = serverFood;
        if(this.userService.currentUser.favFood && this.userService.currentUser.favFood.includes(this.food.id)){
          this.favClassVar = 'fav favorite'
        }else{
          this.favClassVar = 'fav favorite not'
        }
      });
    })
   }

  ngOnInit(): void {
  }
  toggleFavorite(){
    this.userService.toggleFavorite(this.food.id,this.userService.currentUser.id).subscribe((data:any) => {
      if(this.userService.currentUser.favFood && this.userService.currentUser.favFood.includes(this.food.id)){
        this.favClassVar = 'fav favorite'
      }else{
        this.favClassVar = 'fav favorite not'
      }
    });
  }
  addToCart(){
    this.cartService.addToCart(this.food);
    this.router.navigateByUrl('/cart-page');
  }
}
