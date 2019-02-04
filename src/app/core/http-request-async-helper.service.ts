import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs/index";
import {RequestMessage} from "./model/request-message";
import {Util} from "./Util";
import {catchError, delay, retry} from "rxjs/internal/operators";
import {ToastrService} from "ngx-toastr";
import { throwError } from 'rxjs';
import {ResponseMessage} from "./model/response-message";

@Injectable({
  providedIn: 'root'
})
export class HttpRequestAsyncHelperService {


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

  public async getRequestWithUrl(requestUrl:string): Promise<ResponseMessage>{
    let response = this.httpClient.get<any>(requestUrl, this.httpHeaderOptions)
      .pipe(retry(3),delay(this.delayTimeForResponse), catchError(this.handleError)).toPromise();
    return response;
  }

  public async getRequestWithQueryParameter(requestUrl: string, queryParams?: any): Promise<ResponseMessage> {
    let response = this.httpClient.get<any>(requestUrl, {params: queryParams})
      .pipe(retry(3),delay(this.delayTimeForResponse), catchError(this.handleError)).toPromise();
    return response;
  }

  public async getRequestWithRequestModel(requestUrl: string,requestModel:any, dataTableParameter?:any,queryParams?:any): Promise<ResponseMessage> {
    let requestMessage: RequestMessage;
    requestMessage = Util.getRequestMessage(requestModel,dataTableParameter);

    let response = this.httpClient.post<any>(requestUrl, requestMessage,{params:queryParams})
      .pipe(retry(1),delay(this.delayTimeForResponse), catchError(this.handleError)).toPromise();
    return response;
  }

  public async getRequest(requestUrl: string,dataTableParameter?:any,queryParams?:any): Promise<ResponseMessage> {
    let requestMessage: RequestMessage;
    requestMessage = Util.getRequestMessage(null,dataTableParameter);

    let response = await this.httpClient.post<any>(requestUrl, requestMessage,{params:queryParams})
      .pipe(retry(3),delay(this.delayTimeForResponse), catchError(this.handleError)).toPromise();
    return response;
  }

  public async getRequestById(requestUrl: string, id: string): Promise<ResponseMessage> {
    let response =  this.httpClient.get<any>(requestUrl + "/"+ id, this.httpHeaderOptions)
      .pipe(retry(3),delay(this.delayTimeForResponse), catchError(this.handleError)).toPromise();
    return response;
  }

  public async postRequest(requestUrl: string, requestPayload: any): Promise<ResponseMessage> {
    let response = this.httpClient.post<any>
    (
      requestUrl,
      requestPayload,
      this.httpHeaderOptions
    ).pipe(retry(3),delay(this.delayTimeForResponse), catchError(this.handleError)).toPromise();

    return response;
  }

  public async updateRequest(requestUrl: string, requestPayload: any): Promise<ResponseMessage> {
    let putUrl: string;
    putUrl = requestUrl;

    let response = this.httpClient.put<any>
    (
      putUrl,
      requestPayload,
      this.httpHeaderOptions
    ).pipe(retry(3),delay(this.delayTimeForResponse),catchError(this.handleError)).toPromise();
    return response;
  }


  public async deleteRequest(requestUrl: string, id: string): Promise<ResponseMessage> {
    let deleteUrl: string;
    deleteUrl = requestUrl + "/" + id;
    let response = this.httpClient.delete<any>
    (
      deleteUrl
    ).pipe(retry(3), delay(this.delayTimeForResponse),catchError(this.handleError)).toPromise();
    return response;
  }

  private handleError(httpErrorResponse: HttpErrorResponse){
    if (httpErrorResponse.error instanceof ErrorEvent) {
      Util.logConsole("Client Side error occurred: " + httpErrorResponse.error.message);
    } else {
      this.toastr.error('There is a problem with the service. We are notified and working on it');
      Util.logConsole(httpErrorResponse,"Server Side error occurred" );
    }
    return throwError('There is a problem with the service. We are notified and working on it')
  }

}
