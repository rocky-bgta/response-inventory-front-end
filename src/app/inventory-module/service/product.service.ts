import {Injectable} from '@angular/core';
import {HttpRequestHelperService} from "../../core/http-request-helper.service";
import {Observable} from "rxjs/index";
import {InventoryApiEndPoint} from "../inventory-api-end-point";


@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private httpRequestHelperService: HttpRequestHelperService) {
  }

  save(data): Observable<any> {
    return this.httpRequestHelperService.postRequest(InventoryApiEndPoint.product, data);
  }

 /* getList(): Observable<any> {
    return this.httpRequestHelperService.getRequest(InventoryApiEndPoint.product+"getAll");
  }
*/
  getList(parameter:any): Observable<any> {
    return this.httpRequestHelperService.getRequest(InventoryApiEndPoint.product+"/getAll",parameter);
  }


  getById(id): Observable<any> {
    return this.httpRequestHelperService.getRequestById(InventoryApiEndPoint.product, id);
  }

  update(data) {
    return this.httpRequestHelperService.updateRequest(InventoryApiEndPoint.product, data);
  }

  delete(id) {
    return this.httpRequestHelperService.deleteRequest(InventoryApiEndPoint.product, id);
  }


  saveImage(data): Observable<any> {
    return this.httpRequestHelperService.postRequest(InventoryApiEndPoint.product+"/image", data);
  }

  getImage(): Observable<any> {
    return this.httpRequestHelperService.getRequest(InventoryApiEndPoint.product+"/imageGet");
  }

}
