import { Injectable } from '@angular/core';
import {HttpRequestHelperService} from "../../core/http-request-helper.service";
import {Observable} from "rxjs/index";
import {InventoryApiEndPoint} from "../inventory-api-end-point";
import {HttpParams} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class StockService {

  constructor(private httpRequestHelperService: HttpRequestHelperService) {
  }

  save(data): Observable<any> {
    return this.httpRequestHelperService.postRequest(InventoryApiEndPoint.stock, data);
  }

  getList(dataTableParameter?:any,queryParameter?:any): Observable<any> {
    return this.httpRequestHelperService.getRequest(InventoryApiEndPoint.stock+"/list",dataTableParameter,queryParameter);
  }

  getListWithRequestModel(requestModel:any,dataTableParameter?:any,queryParameter?:any): Observable<any> {
    return this.httpRequestHelperService.getRequestWithRequestModel(InventoryApiEndPoint.stock+"/list",requestModel,dataTableParameter,queryParameter);
  }


  getById(id): Observable<any> {
    return this.httpRequestHelperService.getRequestById(InventoryApiEndPoint.stock, id);
  }

  update(data) {
    return this.httpRequestHelperService.updateRequest(InventoryApiEndPoint.stock, data);
  }

  delete(id) {
    return this.httpRequestHelperService.deleteRequest(InventoryApiEndPoint.stock, id);
  }
}
