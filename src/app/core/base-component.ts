import {ToastrService} from "ngx-toastr";
import {Injector} from "@angular/core";
import {ICustomType} from "./interface/ICustomType";
import * as lodash from 'lodash';

export class BaseComponent {
  public toasterService: ToastrService;
  private injector: Injector;

  public customObject: ICustomType;
  public lodash;


  /*constructor(toasterService: ToastrService) {
    this.toasterService = toasterService;
  }*/
  constructor(){
    this.toasterService = this.injector.get(ToastrService)
    this.customObject = {};
    this.lodash = lodash;
  }

}
