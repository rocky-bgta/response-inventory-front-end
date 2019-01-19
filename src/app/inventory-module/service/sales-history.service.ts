import { Injectable } from '@angular/core';
import {HttpRequestHelperService} from "../../core/http-request-helper.service";
import {Observable} from "rxjs/index";
import {InventoryApiEndPoint} from "../inventory-api-end-point";

@Injectable({
  providedIn: 'root'
})
export class SalesHistoryService {

  constructor(private httpRequestHelperService: HttpRequestHelperService) {
  }

  save(data): Observable<any> {
    return this.httpRequestHelperService.postRequest(InventoryApiEndPoint.storeSalesProducts, data);
  }

  getList(dataTableParameter?:any): Observable<any> {
    return this.httpRequestHelperService.getRequest(InventoryApiEndPoint.storeSalesProducts+"/list",dataTableParameter);
  }


  getById(id): Observable<any> {
    return this.httpRequestHelperService.getRequestById(InventoryApiEndPoint.storeSalesProducts, id);
  }

  getSalesHistoryByInvoiceNo(invoiceNo:string): Observable<any> {
    return this.httpRequestHelperService.getRequestById(InventoryApiEndPoint.storeSalesProducts+"/invoice-no", invoiceNo);
  }

  update(data) {
    return this.httpRequestHelperService.updateRequest(InventoryApiEndPoint.storeSalesProducts, data);
  }

  delete(id) {
    return this.httpRequestHelperService.deleteRequest(InventoryApiEndPoint.storeSalesProducts, id);
  }
}
