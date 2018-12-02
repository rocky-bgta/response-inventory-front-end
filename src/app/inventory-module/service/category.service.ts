import {Injectable} from '@angular/core';
import {HttpRequestHelperService} from "../../core/http-request-helper.service";
import {Observable} from "rxjs/index";
import {InventoryApiEndPoint} from "../inventory-api-end-point";


@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private httpRequestHelperService: HttpRequestHelperService) {
  }

  save(data): Observable<any> {
    return this.httpRequestHelperService.postRequest(InventoryApiEndPoint.category+"save", data);
  }

 /* getList(): Observable<any> {
    return this.httpRequestHelperService.getRequest(InventoryApiEndPoint.category+"getAll");
  }
*/
  getList(parameter:any): Observable<any> {
    return this.httpRequestHelperService.getRequest(InventoryApiEndPoint.category+"getAll",parameter);
  }


  getById(id): Observable<any> {
    return this.httpRequestHelperService.getRequestById(InventoryApiEndPoint.category, id);
  }

  update(data, id) {
    return this.httpRequestHelperService.updateRequest(InventoryApiEndPoint.category, id, data);
  }

  delete(id) {
    return this.httpRequestHelperService.deleteRequest(InventoryApiEndPoint.category, id);
  }


}
