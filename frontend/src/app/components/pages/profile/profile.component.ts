import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/services/user.service';
import { IUserUpdate } from 'src/app/shared/interfaces/IUserUpdate';
import { PasswordsMatchValidator } from 'src/app/shared/validators/password_match_validator';
import { User } from 'src/app/shared/models/User';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  registerForm!:FormGroup;
  isSubmitted = false;
  selectedFile: string | undefined = undefined;
  @ViewChild('fileInput') fileInput: ElementRef | undefined;
  user!:User;
  returnUrl = '';
  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private toastrService:ToastrService,
  ) {

  }

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
    this.user = this.userService.currentUser;
    if(this.user && this.user.image)
      this.selectedFile = this.user.image;
  }

  get fc() {
    return this.registerForm.controls;
  }
  onImageSelected(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();
    // check file type
    if (!file.type.match(/image\/(png|jpg|jpeg)/)) {
      this.toastrService.error('Image must be a PNG or JPG file');
      return;
    }
    // check file size
    if (file.size > 1000000) { // 1 MB
      this.toastrService.error('image size should be less than 1 MB.');
      return;
    }

    reader.onload = () => {
      this.selectedFile = reader.result as string;
    }
    reader.readAsDataURL(event.target.files[0]);
  }
  triggerClick() {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }
  removeImage(){
    this.selectedFile = undefined;
  }
  submit(){
    this.isSubmitted = true;
    if(this.registerForm.invalid) return;
    if(!this.selectedFile){
      this.toastrService.error('Please select User image');
      return;
    }
    const fv= this.registerForm.value;
    const user :IUserUpdate = {
      name: fv.name,
      email: fv.email,
      password: fv.password,
      confirmPassword: fv.confirmPassword,
      address: fv.address,
      image: this.selectedFile
    };

    this.userService.update(user).subscribe(_ => {
      this.router.navigateByUrl(this.returnUrl);
    })
  }
}
