import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CredentialResponse } from 'google-one-tap';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'google-login',
  templateUrl: './google-login.component.html',
  styleUrls: ['./google-login.component.css']
})
export class GoogleLoginComponent {
  clientId = "437956420963-j173b9of0nriqiocd8omtlmes3fslu9t.apps.googleusercontent.com";
  returnUrl = '';
  constructor(private userService:UserService,
    private router:Router,
    private activatedRoute:ActivatedRoute) { }
  ngOnInit(): void {

    // @ts-ignore
    window.onGoogleLibraryLoad = () => {
      // @ts-ignore
      google.accounts.id.initialize({
        client_id: this.clientId,
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true
      });
      // @ts-ignore
      google.accounts.id.renderButton(
      // @ts-ignore
      document.getElementById("buttonDiv"),
        { theme: "outline", size: "large", width: "100%" }
      );
      // @ts-ignore
      google.accounts.id.prompt((notification: PromptMomentNotification) => {});
    };
    this.returnUrl = this.activatedRoute.snapshot.queryParams.returnUrl;

  }
  
  async handleCredentialResponse(response: CredentialResponse) {
    console.log(response)
    this.userService.LoginWithGoogle(response).subscribe(() => {
      //  this.userService.userImageUpdatedSubject.next(); // emit the event
       this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          location.reload();
        }
      });
      this.router.navigateByUrl(this.returnUrl);
     });
  }
}
