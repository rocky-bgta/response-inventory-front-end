import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Router } from '@angular/router';
import {AuthenticationService} from "../../core/authentication/authentication.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private router: Router,
                private authenticationService:AuthenticationService) {}


    canActivate() {

       /* if (localStorage.getItem('isLoggedin')) {
            return true;
        }*/

        if(this.authenticationService.isAuthenticated()){
          return true;
        }

        this.router.navigate(['/login']);
        return false;
    }
}
