import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, switchMap, tap } from 'rxjs';
import { sample_foods, sample_tags } from 'src/data';
import { FOODS_BY_SEARCH_URL, FOODS_BY_TAG_URL, FOODS_TAGS_URL, FOODS_URL, FOOD_ADD_URL, FOOD_BY_ID_URL, FOOD_COUNT_URL } from '../shared/constants/urls';
import { Food } from '../shared/models/Food';
import { Tag } from '../shared/models/Tag';

@Injectable({
  providedIn: 'root'
})
export class FoodService {

  constructor(private http:HttpClient) { }

  getAll(): Observable<Food[]> {
    const foods = localStorage.getItem('foods');
    if (foods) {
      var foodslength = JSON.parse(foods).length;
      return this.http.get<boolean>(FOOD_COUNT_URL + foodslength).pipe(
        switchMap((data) => {
          console.log("food",data)
          if (data) {
            return of(JSON.parse(foods));
          } else {
            // fetch the data from the API and cache it in local storage
            return this.http.get<Food[]>(FOODS_URL).pipe(
              tap((data) => {
                localStorage.setItem('foods', JSON.stringify(data));
              })
            );
          }
        }));
    } else {
      return this.http.get<Food[]>(FOODS_URL).pipe(
        tap((data) => {
          localStorage.setItem('foods', JSON.stringify(data));
        }));
    }
  }


  Add(food:any){
    return this.http.post<any>(FOOD_ADD_URL,food).pipe(
      tap(() => {
        this.http.get<Food[]>(FOODS_URL).pipe(
          tap((foods) => {
            localStorage.setItem('foods', JSON.stringify(foods));
            console.log("hello",foods)
          })).subscribe();
      })
    );
  }
  getAllFoodsBySearchTerm(searchTerm: string) {
    return this.http.get<Food[]>(FOODS_BY_SEARCH_URL + searchTerm);
  }

  getAllTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(FOODS_TAGS_URL);
  }

  getAllFoodsByTag(tag: string): Observable<Food[]> {
    return tag === "All" ?
      this.getAll() :
      this.http.get<Food[]>(FOODS_BY_TAG_URL + tag);
  }

  getFoodById(foodId:string):Observable<Food>{
    return this.http.get<Food>(FOOD_BY_ID_URL + foodId);
  }

}
