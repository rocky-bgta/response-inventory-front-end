import { Injectable } from '@angular/core';
import {HttpRequestHelperService} from "../../core/http-request-helper.service";
import {Observable} from "rxjs/index";
import {InventoryApiEndPoint} from "../inventory-api-end-point";

@Injectable({
  providedIn: 'root'
})
export class CustomerDuePaymentHistoryService {

  constructor(private httpRequestHelperService: HttpRequestHelperService) {
  }

  save(data): Observable<any> {
    return this.httpRequestHelperService.postRequest(InventoryApiEndPoint.customerDuePaymentHistory, data);
  }

  getList(dataTableParameter?:any): Observable<any> {
    return this.httpRequestHelperService.getRequest(InventoryApiEndPoint.customerDuePaymentHistory+"/list",dataTableParameter);
  }


  getById(id): Observable<any> {
    return this.httpRequestHelperService.getRequestById(InventoryApiEndPoint.customerDuePaymentHistory, id);
  }

  getDuePaymentHistoryByInvoiceNo(invoiceNo:string): Observable<any> {
    return this.httpRequestHelperService.getRequestById(InventoryApiEndPoint.customerDuePaymentHistory+"/invoice-no", invoiceNo);
  }

  getPreviousDueByCustomerId(customerId:string): Observable<any> {
    return this.httpRequestHelperService.getRequestById(InventoryApiEndPoint.customerDuePaymentHistory+"/previous-due/customer-id", customerId);
  }

  update(data) {
    return this.httpRequestHelperService.updateRequest(InventoryApiEndPoint.customerDuePaymentHistory, data);
  }

  delete(id) {
    return this.httpRequestHelperService.deleteRequest(InventoryApiEndPoint.customerDuePaymentHistory, id);
  }
}
