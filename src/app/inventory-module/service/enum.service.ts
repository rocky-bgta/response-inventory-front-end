import {Injectable} from '@angular/core';
import {HttpRequestHelperService} from "../../core/http-request-helper.service";
import {Observable} from "rxjs/index";
import {InventoryApiEndPoint} from "../inventory-api-end-point";
import {HttpRequestAsyncHelperService} from "../../core/http-request-async-helper.service";
import {ResponseMessage} from "../../core/model/response-message";


@Injectable({
  providedIn: 'root'
})
export class EnumService {

  constructor(private httpRequestHelperService: HttpRequestHelperService) {
  }

  public getPaymentMethods(): Observable<any> {
    return this.httpRequestHelperService.getRequestWithUrl(InventoryApiEndPoint.enum +"/payment-method");
  }

}
