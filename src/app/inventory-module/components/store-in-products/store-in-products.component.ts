import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {StoreInProductsModel} from "../../model/store-in-products-model";
import {DataTableRequest} from "../../../core/model/data-table-request";
import {ToastrService} from "ngx-toastr";
import {VendorService} from "../../service/vendor.service";
import {NgxSmartModalService} from "ngx-smart-modal";
import {ResponseMessage} from "../../../core/model/response-message";
import {Util} from "../../../core/Util";
import {RequestMessage} from "../../../core/model/request-message";
import {HttpErrorResponse} from "@angular/common/http";
import {VendorModel} from "../../model/vendor-model";
import {StoreModel} from "../../model/store-model";
import {ProductModel} from "../../model/product-model";
import {StoreService} from "../../service/store.service";

declare var jQuery: any;
import * as _ from 'lodash';
import {HttpStatusCode} from "../../../core/constants/HttpStatusCode";


@Component({
  selector: 'app-store-in-products',
  templateUrl: './store-in-products.component.html',
  styleUrls: ['./store-in-products.component.scss']
})
export class StoreInProductsComponent implements OnInit {

  public pageTitle:string="Store Product in";


  public entryForm: FormGroup;



  //======== page state variables star ===========
  public formSubmitted:boolean=false;
  public isPageInUpdateState: boolean;
  public hideInputForm: boolean;
  public disablePageElementOnDetailsView: boolean;
  //======== page state variables end  ===========

  //======== Data Table variable  start ===========================
  public dataTableOptions: DataTables.Settings = {};
  private dataTablesCallBackParameters: DataTableRequest;
  private dataTableCallbackFunction: any;
  //======== Data Table variable enc  =============================


  //========== Variables for this page business =====================================================

  public storeInProductsModel: StoreInProductsModel = new StoreInProductsModel();

  public storeInProductsModelList: Array<StoreInProductsModel> = new Array<StoreInProductsModel>();

  public storeModelList: Array<StoreModel> = new Array<StoreModel>();
  public vendorModelList: Array<VendorModel> = new Array<VendorModel>();
  public productModelList: Array<ProductModel> = new Array<ProductModel>();

//========== Variables for this page business =====================================================

  constructor(private vendorService: VendorService,
              private storeService: StoreService,
              private formBuilder: FormBuilder,
              private toastr: ToastrService,
              public  ngxSmartModalService: NgxSmartModalService) { }

  ngOnInit() {

    this.initializeReactiveFormValidation();

    this.getStoreList();

  }

  onChangeVendor($event){

  }

  private getVendorList(){
    let requestMessage: RequestMessage;
    requestMessage = Util.getRequestMessage();
    this.vendorService.getList().subscribe
    (
      (response:ResponseMessage)=>
      {

      },
    (error: HttpErrorResponse)=>
    {

    }

    )
  }


  private getStoreList(){
    let requestMessage: RequestMessage;
    requestMessage = Util.getRequestMessage(null,null);
    this.storeService.getList(requestMessage).subscribe
    (
      (response:ResponseMessage)=>
      {
        if(response.httpStatus==HttpStatusCode.FOUND){
          this.storeModelList = <Array<StoreModel>>response.data;
          return;
        }else if(response.httpStatus==HttpStatusCode.NOT_FOUND) {
          this.toastr.error('Failed to get Store list ',this.pageTitle);
          return;
        }else {
          Util.logConsole(response);
          return;
        }
      },

      (httpErrorResponse: HttpErrorResponse) =>
      {
        if (httpErrorResponse.error instanceof Error) {
          Util.logConsole(httpErrorResponse,"Client-side error occurred.");
        } else {
          Util.logConsole(httpErrorResponse,"Client-side error occurred.");
        }
        return;
      }

    )
  }

  private initializeReactiveFormValidation():void{
    //let notAllowedCharacter = "^[A-Za-z0-9_.]+$";
    //let notAllowedCharacter = "^[A-Za-z0-9-_. \\\\ \\/ - \\n]+$";
    this.entryForm = this.formBuilder.group({
      //name:     ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
      //phoneNo:  ['', Validators.compose([Validators.required, Validators.maxLength(20)])],
      //email:    ['', Validators.compose([Validators.email, Validators.maxLength(50)])],
      //address: ['', Validators.compose([Validators.maxLength(200)])],
      password: ['', Validators.compose([Validators.required])],
      store: ['', Validators.compose([Validators.required])]

      //address: ['', Validators.compose([Validators.maxLength(200), Validators.pattern(notAllowedCharacter)])],
      //description: ['', Validators.compose([Validators.maxLength(200), Validators.pattern(notAllowedCharacter)])]

    });
  }

}
