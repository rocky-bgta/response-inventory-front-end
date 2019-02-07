import {Injectable} from '@angular/core';
import {LoginModel} from "../../login/login-model";
import {Router} from "@angular/router";

export interface Credentials {
  // Customize received credentials here
  username: string;
  token: string;
}

export interface LoginContext {
  username: string;
  password: string;
  remember?: boolean;
}

const credentialsKey = 'credentials';

/**
 * Provides a base for authentication workflow.
 * The Credentials interface as well as login/logout methods should be replaced with proper implementation.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private readonly _username:string='admin';
  private readonly _password:string='admin';

  private _credentials: Credentials | null;

  //private storedCredential: LoginModel;

  constructor(private router: Router) {

    //this.storedCredential = <LoginModel>sessionStorage.getItem(credentialsKey) || localStorage.getItem(credentialsKey);

   /* const savedCredentials = sessionStorage.getItem(credentialsKey) || localStorage.getItem(credentialsKey);
    if (savedCredentials) {
      this._credentials = JSON.parse(savedCredentials);
    }*/

  }

  /**
   * Authenticates the user.
   * @param context The login parameters.
   * @return The user credentials.
   */
 /* login(context: LoginContext): Observable<Credentials> {
    // Replace by proper authentication call
    const data = {
      username: context.username,
      token: '123456'
    };
    this.setCredentials(data, context.remember);
    return of(data);
  }*/

  /**
   * Logs out the user and clear credentials.
   * @return True if the user was logged out successfully.
   */
  logout() {
    sessionStorage.removeItem(credentialsKey);
    localStorage.removeItem(credentialsKey);
    this.router.navigate(['/login'],{ replaceUrl: true })
  }

  /**
   * Checks is the user is authenticated.
   * @return True if the user is authenticated.
   */
  isAuthenticated(): boolean {
    let loginModel: LoginModel;
    let loginStringObject;
    loginStringObject = sessionStorage.getItem(credentialsKey) || localStorage.getItem(credentialsKey);
    loginModel = JSON.parse(loginStringObject);

    if(loginModel!=null) {

      if (loginModel.username == this._username && loginModel.password == this._password)
        return true;
    }else return false;
  }

  /**
   * Gets the user credentials.
   * @return The user credentials or null if the user is not authenticated.
   */
  get credentials(): Credentials | null {
    return this._credentials;
  }

  /**
   * Sets the user credentials.
   * The credentials may be persisted across sessions by setting the `remember` parameter to true.
   * Otherwise, the credentials are only persisted for the current session.
   * @param credentials The user credentials.
   * @param remember True to remember credentials across sessions.
   */
 /* private setCredentials(credentials?: Credentials, remember?: boolean) {
    this._credentials = credentials || null;

    if (credentials) {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem(credentialsKey, JSON.stringify(credentials));
    } else {
      sessionStorage.removeItem(credentialsKey);
      localStorage.removeItem(credentialsKey);
    }
  }*/

  public setCredentials(loginModel:LoginModel) {
    if (loginModel.remember!=null && true) {
      localStorage.setItem(credentialsKey,JSON.stringify(loginModel));
    }
      else {
      sessionStorage.setItem(credentialsKey,JSON.stringify(loginModel));
    }

    if(loginModel.username==this._username && loginModel.password==this._password)
      this.router.navigate(['/dashboard'])

  }
}
