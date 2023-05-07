import { CredentialResponse } from 'google-one-tap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, Subject, catchError, from, tap, throwError } from 'rxjs';
import { FOOD_FAVORITE_URL, USER_ISSELLER_URL, USER_LOGINGOOGLE_URL, USER_LOGIN_URL, USER_REGISTER_URL, USER_UPDATE_URL, USER_UPLOADIMG_URL } from '../shared/constants/urls';
import { IUserLogin } from '../shared/interfaces/IUserLogin';
import { IUserRegister } from '../shared/interfaces/IUserRegister';
import { User } from '../shared/models/User';
import { IUserUpdate } from '../shared/interfaces/IUserUpdate';

const USER_KEY = 'User';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject =
  new BehaviorSubject<User>(this.getUserFromLocalStorage());
  public userObservable:Observable<User>;

  // creating new subject for image uploaded notify to its subscriber (in our case its header)
  public userImageUpdatedSubject = new Subject<void>();
  userImageUpdated$ = this.userImageUpdatedSubject.asObservable();
  userImageRetrieved: boolean;
  constructor(private http:HttpClient, private toastrService:ToastrService) {
    this.userImageRetrieved = false;
    this.userObservable = this.userSubject.asObservable();
  }

  public get currentUser():User{
    return this.userSubject.value;
  }

  login(userLogin:IUserLogin):Observable<User>{
    return this.http.post<User>(USER_LOGIN_URL, userLogin).pipe(
      tap({
        next: (user) =>{
          this.setUserToLocalStorage(user);
          this.userSubject.next(user);
          this.toastrService.success(
            `Welcome to foodeal ${user.name}!`,
            'Login Successful'
            )
        },
        error: (errorResponse) => {
          this.toastrService.error(errorResponse.error, 'Login Failed');
        }
      })
    );
  }
  LoginWithGoogle(response: any): Observable<User> {
    const header = new HttpHeaders().set('Content-type', 'application/json');
    return this.http.post<User>(USER_LOGINGOOGLE_URL, response, { headers: header, withCredentials: true }).pipe(
      tap({
        next: (user) =>{
          this.setUserToLocalStorage(user);
          this.userSubject.next(user);
          this.toastrService.success(
            `Welcome to foodeal ${user.name}!`,
            'Login Successful'
            )
        },
        error: (errorResponse) => {
          this.toastrService.error(errorResponse.error, 'Login Failed');
        }
      })
    );
  }

  register(userRegiser:IUserRegister): Observable<User>{
    return this.http.post<User>(USER_REGISTER_URL, userRegiser).pipe(
      tap({
        next: (user) => {
          this.setUserToLocalStorage(user);
          this.userSubject.next(user);
          this.toastrService.success(
            `Welcome to the foodeal ${user.name}`,
            'Register Successful'
          )
        },
        error: (errorResponse) => {
          this.toastrService.error(errorResponse.error,
            'Register Failed')
        }
      })
    )
  }
  update(userUpdate:IUserUpdate): Observable<User>{
    return this.http.post<User>(USER_UPDATE_URL, userUpdate).pipe(
      tap({
        next: (user) => {
          this.setUserToLocalStorage(user);
          this.userSubject.next(user);
          this.toastrService.success(
            `Profile changed ${user.name}`,
            'update Successful'
          )
        },
        error: (errorResponse) => {
          this.toastrService.error(errorResponse.error,
            'update Failed')
        }
      })
    )
  }

  logout(){
    this.userSubject.next(new User());
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("Cart");
    window.location.reload();
  }

  private setUserToLocalStorage(user:User){
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  private getUserFromLocalStorage():User{
    const userJson = localStorage.getItem(USER_KEY);
    if(userJson) return JSON.parse(userJson) as User;
    return new User();
  }


  toggleFavorite(foodId:string,userId:string) {
    return from(
      fetch(`${FOOD_FAVORITE_URL}/${foodId}/${userId}`)
        .then((response) => {
          if (response.ok) {return response.json();} else {throw new Error(response.statusText);}
        })
        .then((data) => {
          if (data.message)
            this.toastrService.success(data.message);
          if (data.user) {
            this.setUserToLocalStorage(data.user);
            this.userSubject.next(data.user);
          }
          return data.message;
        })
        .catch((error) => {
          this.toastrService.error(error.message, 'favorite Failed');
          throw error;
        })
    );
  }

  sellerToggle(isSeller:boolean,userId:string){
    return fetch(USER_ISSELLER_URL+userId+'/'+isSeller)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    })
    .then(user => {
      this.setUserToLocalStorage(user);
      this.userSubject.next(user);
      if(user.isSeller)
        this.toastrService.success(
          'welcome to seller Dashboard'
        );
      return user;
    })
    .catch(error => {
      this.toastrService.error(error.message, 'update failed');
      throw error;
    });
  }
}
