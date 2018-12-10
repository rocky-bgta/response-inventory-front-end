import {Component, Injector, OnInit} from '@angular/core';
import {ToastrService} from "ngx-toastr";
import {ICustomType} from "../../interface/ICustomType";
import * as lodash from 'lodash';

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})
export class BaseComponent implements OnInit {

  public customObject: ICustomType;
  public lodash;
  public toasterService: ToastrService;
  private injector: Injector;

  constructor() {
    this.toasterService = this.injector.get(ToastrService);
    this.customObject = {};
    this.lodash = lodash;
  }

  ngOnInit() {
  }

}
