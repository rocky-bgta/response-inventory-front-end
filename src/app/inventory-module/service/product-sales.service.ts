import { Injectable } from '@angular/core';
import {HttpRequestHelperService} from "../../core/http-request-helper.service";
import {Observable} from "rxjs/index";
import {InventoryApiEndPoint} from "../inventory-api-end-point";
import {HttpParams} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ProductSalesService {

  constructor(private httpRequestHelperService: HttpRequestHelperService) {
  }

  saveSalesProduct(data): Observable<any> {
    return this.httpRequestHelperService.postRequest(InventoryApiEndPoint.storeSalesProducts, data);
  }

  getAllAvailableProduct(queryParameter:any): Observable<any> {
    return this.httpRequestHelperService.getRequest(InventoryApiEndPoint.storeInProducts+"/available-products",null,queryParameter);
  }

}
