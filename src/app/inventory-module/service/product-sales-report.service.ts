import {Injectable} from '@angular/core';
import {HttpRequestHelperService} from "../../core/http-request-helper.service";
import {Observable} from "rxjs/index";
import {InventoryApiEndPoint} from "../inventory-api-end-point";
import {RequestMessage} from "../../core/model/request-message";


@Injectable({
  providedIn: 'root'
})
export class ProductSalesReportService {

  constructor(private httpRequestHelperService: HttpRequestHelperService) {
  }

  save(data): Observable<any> {
    return this.httpRequestHelperService.postRequest(InventoryApiEndPoint.productSales, data);
  }

  getListByRequestMessage(requestMessage:RequestMessage): Observable<any> {
    return this.httpRequestHelperService.getRequestWithRequestMessage(InventoryApiEndPoint.productSales+"/report",requestMessage);
  }


  getById(id): Observable<any> {
    return this.httpRequestHelperService.getRequestById(InventoryApiEndPoint.productSales, id);
  }

  update(data) {
    return this.httpRequestHelperService.updateRequest(InventoryApiEndPoint.productSales, data);
  }

  delete(id) {
    return this.httpRequestHelperService.deleteRequest(InventoryApiEndPoint.productSales, id);
  }


}
