import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {routerTransition} from '../router.animations';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {LoginModel} from "./login-model";
import {AuthenticationService} from "../core/authentication/authentication.service";


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [routerTransition()]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  loginModel: LoginModel = new LoginModel();

  constructor(private formBuilder: FormBuilder,
              private authenticationService: AuthenticationService,
              //private translate: TranslateService,
              public router: Router) {
   /*
    this.translate.addLangs(['en', 'fr', 'ur', 'es', 'it', 'fa', 'de', 'zh-CHS']);
    this.translate.setDefaultLang('en');
    const browserLang = this.translate.getBrowserLang();
    this.translate.use(browserLang.match(/en|fr|ur|es|it|fa|de|zh-CHS/) ? browserLang : 'en');
*/
    this.initializeReactiveFormValidation();
  }

  ngOnInit() {
  }

  onLoggedin() {
    this.authenticationService.setCredentials(this.loginModel);
    //localStorage.setItem('isLoggedin', 'true');
  }

  private initializeReactiveFormValidation() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      remember: true
    });
  }
}
