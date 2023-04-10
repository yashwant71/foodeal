import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, Subject, catchError, tap, throwError } from 'rxjs';
import { USER_LOGIN_URL, USER_REGISTER_URL, USER_UPDATE_URL, USER_UPLOADIMG_URL } from '../shared/constants/urls';
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

  constructor(private http:HttpClient, private toastrService:ToastrService) {
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

  uploadUserImage(userId:string, selectedFile:File) {
    const formData = new FormData();
    formData.append('image', selectedFile);
    // console.log(userId, formData.get('image'));
    // console.log(`${USER_UPLOADIMG_URL}/${userId}`);

    return fetch(`${USER_UPLOADIMG_URL}/${userId}`, {
      method: 'POST',
      body: formData,
    }).then((response) => {
        if (!response.ok) {
          throw new Error('Error uploading image.');
        } return response.json();})
      .then((data) => {
        this.toastrService.success(data.message);
      })
      .catch((error) => {
        this.toastrService.error(error.message);
        throw error;
      });
  }


  logout(){
    this.userSubject.next(new User());
    localStorage.removeItem(USER_KEY);
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
}
