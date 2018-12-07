import {ToastrService} from "ngx-toastr";
import {Injector} from "@angular/core";

export class BaseComponent {
  public toasterService: ToastrService;
  private injector: Injector;

  /*constructor(toasterService: ToastrService) {
    this.toasterService = toasterService;
  }*/
  constructor(){
    this.toasterService = this.injector.get(ToastrService)
  }

}
