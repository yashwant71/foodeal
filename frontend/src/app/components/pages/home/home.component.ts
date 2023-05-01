import { UserService } from 'src/app/services/user.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { FoodService } from 'src/app/services/food.service';
import { Food } from 'src/app/shared/models/Food';
import { User } from 'src/app/shared/models/User';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  foods: Food[] = [];
  user?: User;
  favClassVar?:string = 'fav favorite not';
  constructor(private foodService: FoodService, activatedRoute: ActivatedRoute,private userService:UserService) {
    let foodsObservable:Observable<Food[]>;
    this.user = this.userService.currentUser
    activatedRoute.url.subscribe((url) => {
      if (url.length > 0 && url[0].path === "favorites") {

        foodsObservable = foodService.getAll();
        foodsObservable.subscribe((serverFoods) => {
          this.foods = serverFoods.filter(food => this.user?.favFood?.includes(food.id));
        });
      } else {
        
        activatedRoute.params.subscribe((params) => {
          let foodsObservable;
          if (params.searchTerm)
            foodsObservable = this.foodService.getAllFoodsBySearchTerm(params.searchTerm);
          else if (params.tag)
            foodsObservable = this.foodService.getAllFoodsByTag(params.tag);
          else
            foodsObservable = foodService.getAll();

          foodsObservable.subscribe((serverFoods) => {
            this.foods = serverFoods;
          });
        });
      }
    });
  }


  ngOnInit(): void {
  }

}
