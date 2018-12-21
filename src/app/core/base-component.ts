import {ToastrService} from "ngx-toastr";
import {Injector} from "@angular/core";

import * as lodash from 'lodash';
import {CustomObject} from "./interface/CustomObject";

export class BaseComponent {
  public toasterService: ToastrService;
  private injector: Injector;

  public customObject: CustomObject;
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
