import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs/index";
import {RequestMessage} from "./model/request-message";
import {Util} from "./Util";
import {catchError, delay, retry} from "rxjs/internal/operators";
import {ToastrService} from "ngx-toastr";
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpRequestHelperService {


  constructor(private httpClient: HttpClient,
              private toastr: ToastrService,) {
  }

  private httpHeaderOptions: object = {
    headers: new HttpHeaders({
      "Content-Type": "application/json",
    })
  };

  private delayTimeForResponse:number=50;

  /*

  private httpOptionToGetLoginToken = {
    headers: new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded",
      //Authorization: "Basic " + btoa("bccweb-app:secret")
    })
  };

  */


  public getRequestWithQueryParameter(requestUrl: string, params: any): Observable<any> {
    let response = this.httpClient.get<any>(requestUrl, {params: params})
      .pipe(retry(3),delay(this.delayTimeForResponse), catchError(this.handleError));
    return response;
  }

  public getRequestWithUrl(requestUrl:string): Observable<any>{
    let response = this.httpClient.get<any>(requestUrl, this.httpHeaderOptions)
      .pipe(retry(3),delay(this.delayTimeForResponse), catchError(this.handleError));
    return response;
  }

  public getRequest(requestUrl: string,dataTableParameter?:any): Observable<any> {
    let requestMessage: RequestMessage;
    requestMessage = Util.getRequestMessage(null,dataTableParameter);

    let response = this.httpClient.post<any>(requestUrl, requestMessage,this.httpHeaderOptions)
      .pipe(retry(1),delay(this.delayTimeForResponse), catchError(this.handleError));
    return response;
  }

  public getRequestById(requestUrl: string, id: string): Observable<any> {
    let response = this.httpClient.get<any>(requestUrl + "/"+ id, this.httpHeaderOptions)
      .pipe(retry(3),delay(this.delayTimeForResponse), catchError(this.handleError));
    return response;
  }

  public postRequest(requestUrl: string, requestPayload: any): Observable<any> {
    let response = this.httpClient.post<any>
    (
      requestUrl,
      requestPayload,
      this.httpHeaderOptions
    ).pipe(retry(3),delay(this.delayTimeForResponse), catchError(this.handleError));
    return response;
  }

  public updateRequest(requestUrl: string, requestPayload: any): Observable<any> {
    let putUrl: string;
    putUrl = requestUrl;

    let response = this.httpClient.put<any>
    (
      putUrl,
      requestPayload,
      this.httpHeaderOptions
    ).pipe(retry(3),delay(this.delayTimeForResponse),catchError(this.handleError));
    return response;
  }


  public deleteRequest(requestUrl: string, id: string): Observable<any> {
    let deleteUrl: string;
    deleteUrl = requestUrl + "/" + id;
    let response = this.httpClient.delete<any>
    (
      deleteUrl
    ).pipe(retry(3), delay(this.delayTimeForResponse),catchError(this.handleError));
    return response;
  }

  private handleError(httpErrorResponse: HttpErrorResponse){
    if (httpErrorResponse.error instanceof ErrorEvent) {
      Util.logConsole("Client Side error occurred: " + httpErrorResponse.error.message);
    } else {
      this.toastr.error('There is a problem with the service. We are notified and working on it');
      this.toastr.info("Please reload this page");
      Util.logConsole(httpErrorResponse,"Server Side error occurred" );
    }
    return throwError('There is a problem with the service. We are notified and working on it')
  }

}
