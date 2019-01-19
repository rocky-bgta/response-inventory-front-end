import {Injectable} from '@angular/core';
import {HttpRequestHelperService} from "../../core/http-request-helper.service";
import {Observable} from "rxjs/index";
import {InventoryApiEndPoint} from "../inventory-api-end-point";
import {HttpRequestAsyncHelperService} from "../../core/http-request-async-helper.service";
import {ResponseMessage} from "../../core/model/response-message";


@Injectable({
  providedIn: 'root'
})
export class InvoiceHistoryService {

  constructor(private httpRequestHelperService: HttpRequestHelperService,
              private httpRequestHelperServiceAsync: HttpRequestAsyncHelperService) {
  }

  save(data): Observable<any> {
    return this.httpRequestHelperService.postRequest(InventoryApiEndPoint.invoiceHistory, data);
  }

  getListByQueryParameter(dataTableParameter?: any, queryParameter?: any): Observable<any> {
    return this.httpRequestHelperService.getRequest(InventoryApiEndPoint.invoiceHistory + "/list", dataTableParameter, queryParameter);
  }


  getById(id): Observable<any> {
    return this.httpRequestHelperService.getRequestById(InventoryApiEndPoint.invoiceHistory, id);
  }

  update(data) {
    return this.httpRequestHelperService.updateRequest(InventoryApiEndPoint.invoiceHistory, data);
  }

  delete(id) {
    return this.httpRequestHelperService.deleteRequest(InventoryApiEndPoint.invoiceHistory, id);
  }


}
