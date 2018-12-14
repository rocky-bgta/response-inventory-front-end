import { Component, OnInit } from '@angular/core';
import {NgxSmartModalService} from "ngx-smart-modal";
import {ToastrService} from "ngx-toastr";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {BrandService} from "../../service/brand.service";
import {VendorModel} from "../../model/vendor-model";
import {DataTableRequest} from "../../../core/model/data-table-request";

import * as HttpStatus from 'http-status-codes'
import * as _ from 'lodash';
declare var jQuery: any;

@Component({
  selector: 'app-vendor',
  templateUrl: './vendor.component.html',
  styleUrls: ['./vendor.component.scss']
})
export class VendorComponent implements OnInit {


  public vendorModel: VendorModel = new VendorModel();

  public entryForm: FormGroup;
  public formSubmitted:boolean=false;

  public dataTableOptions: DataTables.Settings = {};
  public brandModelList: Array<VendorModel> = new Array();

  public isPageInUpdateState: boolean;
  public hideInputForm: boolean;
  public disablePageElementOnDetailsView: boolean;

  private dataTablesCallBackParameters: DataTableRequest;
  private dataTableCallbackFunction: any;


  constructor(private brandService: BrandService,
              private formBuilder: FormBuilder,
              private toastr: ToastrService,
              public ngxSmartModalService: NgxSmartModalService) {
  }


  ngOnInit() {
    this.initializeReactiveFormValidation();
    this.initializedPageStateVariable();
  }




  private initializedPageStateVariable():void{
    this.isPageInUpdateState = false;
    this.hideInputForm = false;
    this.disablePageElementOnDetailsView = false;
    this.dataTablesCallBackParameters = new DataTableRequest();
    this.dataTablesCallBackParameters.start = 0;
    this.dataTablesCallBackParameters.length = 10;
  }

  private initializeReactiveFormValidation():void{
    this.entryForm = this.formBuilder.group({
      name:     ['', Validators.compose([Validators.required, Validators.maxLength(20)])],
      phoneNo:  ['', Validators.compose([Validators.required, Validators.maxLength(20)])],
      email:    ['', Validators.compose([Validators.email, Validators.maxLength(20)])],
      address:  ['', Validators.maxLength(150)],
      description: ['', Validators.maxLength(200)]
    });
  }

  private showEntryForm():void{
    jQuery('#collapseInputForm').collapse('show');
    jQuery('html, body').animate({scrollTop: '0px'}, 500);
    jQuery("#collapseInputForm").scrollTop();
  }

  private hideEntryForm():void{
    jQuery('#collapseInputForm').collapse('hide');
    setTimeout
    (
      () =>
      {
        this.disablePageElementOnDetailsView = false;
      }, 500
    );
    return;
  }

}
