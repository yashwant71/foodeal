import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/services/user.service';
import { IUserUpdate } from 'src/app/shared/interfaces/IUserUpdate';
import { PasswordsMatchValidator } from 'src/app/shared/validators/password_match_validator';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  registerForm!:FormGroup;
  isSubmitted = false;
  userImage: SafeUrl | null = null;
  selectedFile: File | null = null;
  imageButtonText: string = 'Profile Image';

  returnUrl = '';
  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private toastrService:ToastrService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      name: [this.userService.currentUser.name, [Validators.required, Validators.minLength(5)]],
      email: [this.userService.currentUser.email, [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5)]],
      confirmPassword: ['', Validators.required],
      address: [this.userService.currentUser.address, [Validators.required, Validators.minLength(10)]]
    },{
      validators: PasswordsMatchValidator('password','confirmPassword')
    });
    //saving the image in localstorage to use in imagecomponent
    const userImage = localStorage.getItem(`userImage_${this.userService.currentUser.id}`);
    if (userImage) {
      this.userImage = this.sanitizer.bypassSecurityTrustUrl(userImage);
    }
    this.returnUrl= this.activatedRoute.snapshot.queryParams.returnUrl;

    // if we receive image updated event we update the image
    this.userService.userImageUpdated$.subscribe(() => {
    const userImage = localStorage.getItem(`userImage_${this.userService.currentUser.id}`);
    if (userImage) {
      this.userImage = this.sanitizer.bypassSecurityTrustUrl(userImage);
    }
    })
  }

  get fc() {
    return this.registerForm.controls;
  }

  // for image uploading
  onImageSelected(file: File) { // file is from eventEmitter from image-upload component
    if (file && file.size > 2 * 1024 * 1024) {
      this.toastrService.error('Please select an image file with a size less than 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      this.userService.uploadUserImage(this.userService.currentUser.id, file)
        .then((image) => {
          if(image){
            localStorage.setItem(`userImage_${this.userService.currentUser.id}`,image);
            this.userService.userImageUpdatedSubject.next(); // emit the event
          }
        })
        .catch(error => {
          console.error('Failed to upload image', error);
        });
    };
    reader.readAsDataURL(file);
  }
  submit(){
    this.isSubmitted = true;
    if(this.registerForm.invalid) return;
    const fv= this.registerForm.value;
    const user :IUserUpdate = {
      name: fv.name,
      email: fv.email,
      password: fv.password,
      confirmPassword: fv.confirmPassword,
      address: fv.address
    };

    this.userService.update(user).subscribe(_ => {
      this.router.navigateByUrl(this.returnUrl);
    })
  }
}
