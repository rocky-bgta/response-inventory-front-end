import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs/index";
import {RequestMessage} from "./model/request-message";
import {Util} from "./Util";


@Injectable({
  providedIn: 'root'
})
export class HttpRequestHelperService {


  constructor(private httpClient: HttpClient) {
  }

  private httpHeaderOptions: object = {
    headers: new HttpHeaders({
      "Content-Type": "application/json",
    })
  };

  /*

  private httpOptionToGetLoginToken = {
    headers: new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded",
      //Authorization: "Basic " + btoa("bccweb-app:secret")
    })
  };

  */


  public getRequestWithQueryParameter(requestUrl: string, params: any): Observable<any> {
    let response = this.httpClient.get<any>(requestUrl, {params: params});
    return response;
  }

  public getRequest(requestUrl: string,dataTableParameter?:any): Observable<any> {
    let requestMessage: RequestMessage;
    requestMessage = Util.getRequestMessage(null,dataTableParameter);

    let response = this.httpClient.post<any>(requestUrl, requestMessage,this.httpHeaderOptions);
    return response;
  }

  public getRequestById(requestUrl: string, id: string): Observable<any> {
    let response = this.httpClient.get<any>(requestUrl + "/"+ id, this.httpHeaderOptions);
    return response;
  }

  public postRequest(requestUrl: string, requestPayload: any): Observable<any> {
    let response = this.httpClient.post<any>
    (
      requestUrl,
      requestPayload,
      this.httpHeaderOptions
    );
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
    );
    return response;
  }


  public deleteRequest(requestUrl: string, id: string): Observable<any> {
    let deleteUrl: string;
    deleteUrl = requestUrl + "/" + id;
    let response = this.httpClient.delete<any>
    (
      deleteUrl
    );
    return response;
  }

}
