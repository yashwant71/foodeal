import { User } from 'src/app/shared/models/User';
import { UserService } from './../../../services/user.service';
import { Component } from '@angular/core';

@Component({
  selector: 'toggle-seller',
  templateUrl: './toggle-seller.component.html',
  styleUrls: ['./toggle-seller.component.css']
})
export class ToggleSellerComponent {
  user!:User;
  constructor(private userService:UserService){
    this.user = userService.currentUser
    console.log(this.user)
  }
  toggleSeller(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
      this.userService.sellerToggle(isChecked,this.user.id);
  }
}
