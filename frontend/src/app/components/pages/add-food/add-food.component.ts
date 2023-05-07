import { FoodService } from 'src/app/services/food.service';
import { UserService } from './../../../services/user.service';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/shared/models/User';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-add-food',
  templateUrl: './add-food.component.html',
  styleUrls: ['./add-food.component.css']
})
export class AddFoodComponent {
  isSubmitted = false;
  registerForm!:FormGroup;
  user!:User;
  tagsOptions: string[] = ['Vegetarian', 'Vegan','Non-veg', 'Gluten-free', 'Low-carb','FastFood','Soup','Sweet','Salad'];
  originsOptions: string[] = ['Italian', 'Mexican', 'Thai', 'Indian','american','chinese','worldwide'];
  selectedTags:string[];
  selectedOrigins:string[];
  dropdownSettings: IDropdownSettings;

  selectedFile: string | undefined = undefined;
  @ViewChild('fileInput') fileInput: ElementRef | undefined;

  constructor(private formBuilder: FormBuilder,
    private userService:UserService,
    private toastrService:ToastrService,
    private foodService:FoodService,
    private router: Router,){

    this.selectedTags = [];
    this.selectedOrigins = [];
    this.dropdownSettings = {
      singleSelection: false,
      allowSearchFilter: false,
      enableCheckAll: false
    };
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
  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(5)]],
      price: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      cookTime: ['',[Validators.required, Validators.pattern("^[0-9]*$")]],
      selectedTags: [[], [Validators.required, Validators.minLength(1)]],
      selectedOrigins: [[], [Validators.required, Validators.minLength(1)]]
    },{

    });
    this.user = this.userService.currentUser;
  }

  get fc() {
    return this.registerForm.controls;
  }

  submit(){
    this.isSubmitted = true;
    if(this.registerForm.invalid) return;
    if(!this.selectedFile){
      this.toastrService.error('Please select a food image');
      return;
    }
    const fv= this.registerForm.value;
    const food = {
      name: fv.name,
      price: fv.price,
      tags: fv.selectedTags,
      cookTime: fv.cookTime,
      origins: fv.selectedOrigins,
      image: this.selectedFile,
      seller: this.user.id
    };
    console.log(food);

    this.foodService.Add(food).subscribe(_ => {
      this.router.navigateByUrl('/');
      this.toastrService.success('Item Added !');
      return;
    })
  }
}
