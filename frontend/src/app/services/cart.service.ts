import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Cart } from '../shared/models/Cart';
import { CartItem } from '../shared/models/CartItem';
import { Food } from '../shared/models/Food';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { CART_ADD_URL, CART_UPDATE_URL, CART_URL } from '../shared/constants/urls';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart: Cart = this.getCartFromLocalStorage();
  private cartSubject: BehaviorSubject<Cart> = new BehaviorSubject(this.cart);
  private hasFetchedCartData = false;

  constructor(private http: HttpClient, private toastrService: ToastrService, private userService: UserService) {
    // Check if cart data has already been fetched from API
    if (this.userService.currentUser.id && !this.hasFetchedCartData) {
      // Fetch cart data from API if the user is already logged in
      this.fetchCartData().subscribe(cart => {
        this.cart = cart;
        this.cartSubject.next(this.cart);
        this.hasFetchedCartData = true;
      });
    }
  }

  private fetchCartData(): Observable<Cart> {
      // Make API call to fetch cart data
      const userId = this.userService.currentUser.id;
      return this.http.get<Cart>(CART_URL+'/'+userId)
  }


  addToCart(food: Food): void {
    let cartItem = this.cart.items
      .find(item => item.food.id === food.id);
    if (cartItem) return;
    // deleting image for now for payload
    delete food.image;
    this.cart.items.push(new CartItem(food));
    this.setCartToLocalStorage();
  }

  removeFromCart(foodId: string): void {
    this.cart.items = this.cart.items
      .filter(item => item.food.id != foodId);
    this.setCartToLocalStorage();
  }

  changeQuantity(foodId: string, quantity: number) {
    let cartItem = this.cart.items
      .find(item => item.food.id === foodId);
    if (!cartItem) return;

    cartItem.quantity = quantity;
    cartItem.price = quantity * cartItem.food.price;
    this.setCartToLocalStorage();
  }

  clearCart() {
    this.cart = new Cart();
    this.setCartToLocalStorage();
  }

  getCartObservable(): Observable<Cart> {
    return this.cartSubject.asObservable();
  }

  getCart(): Cart{
    return this.cartSubject.value;
  }

  private setCartToLocalStorage(): void {
    this.cart.totalPrice = this.cart.items
      .reduce((prevSum, currentItem) => prevSum + currentItem.price, 0);
    this.cart.totalCount = this.cart.items
      .reduce((prevSum, currentItem) => prevSum + currentItem.quantity, 0);
    // Send the updated cart to the backend
    if(this.userService && this.userService.currentUser && this.userService.currentUser.id){
      fetch(CART_UPDATE_URL+'/'+this.userService.currentUser.id, {
        method: 'POST',
        body: JSON.stringify(this.cart),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(updatedCart => {
        // adding image to food items back
        var foodListStr = localStorage.getItem('foods')
        let foodList: Food[] = [];
        if (foodListStr) {
          foodList = JSON.parse(foodListStr);
        }
        for (const cartItem of updatedCart.items) {
          const matchingFood = foodList?.find((food) => food.id === cartItem.food.id);
          if (matchingFood) {
            cartItem.food.image = matchingFood.image;
          }
        }
        // Save the updated cart to localStorage if the backend call is successful

        const cartJson = JSON.stringify(updatedCart);
        localStorage.setItem('Cart', cartJson);
        this.cartSubject.next(updatedCart);
      })
      .catch(error => {
        // Handle any errors from the backend call
        console.log(error)
        this.toastrService.error('Failed to update cart on the server');
      });
    }else{
      this.toastrService.error('please login to add to cart');
    }
  }

  private getCartFromLocalStorage(): Cart {
    const cartJson = localStorage.getItem('Cart');
    return cartJson ? JSON.parse(cartJson) : new Cart();
  }
}
