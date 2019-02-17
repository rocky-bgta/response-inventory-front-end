import { Injectable } from '@angular/core';
import {HttpRequestHelperService} from "../../core/http-request-helper.service";
import {Observable} from "rxjs/index";
import {InventoryApiEndPoint} from "../inventory-api-end-point";
import {HttpParams} from "@angular/common/http";
import {HttpRequestAsyncHelperService} from "../../core/http-request-async-helper.service";
import {ResponseMessage} from "../../core/model/response-message";

@Injectable({
  providedIn: 'root'
})
export class StockService {

  constructor(private httpRequestHelperService: HttpRequestHelperService,
              private httpRequestAsyncHelperService: HttpRequestAsyncHelperService) {
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

  async getListWithRequestModelAsync(requestModel:any,dataTableParameter?:any,queryParameter?:any): Promise<ResponseMessage> {
    return await this.httpRequestAsyncHelperService.getRequestWithRequestModel(InventoryApiEndPoint.stock+"/list",requestModel,dataTableParameter,queryParameter);
  }


  getById(id): Observable<any> {
    return this.httpRequestHelperService.getRequestById(InventoryApiEndPoint.stock, id);
  }

  getStockProductDetails(queryParameter:any): Observable<any> {
    return this.httpRequestHelperService.getRequest(InventoryApiEndPoint.stock+"/product-details-list",null,queryParameter);
  }

  update(data) {
    return this.httpRequestHelperService.updateRequest(InventoryApiEndPoint.stock, data);
  }

  delete(id) {
    return this.httpRequestHelperService.deleteRequest(InventoryApiEndPoint.stock, id);
  }
}
