import {AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
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
import {StoreInProductViewModel} from "../../model/view-model/store-in-product-view-model";
import {DateModel} from "../../../core/model/dateModel";
import {StoreInProductsService} from "../../service/store-in-products.service";
import {StoreInProductsModel} from "../../model/store-in-products-model";

@Component({
  selector: 'app-store-in-products',
  templateUrl: './store-in-products.component.html',
  styleUrls: ['./store-in-products.component.scss']
})
export class StoreInProductsComponent implements OnInit, AfterViewInit {


  public pageTitle:string="Store Product in";


  public entryForm: FormGroup;



  //======== page state variables star ===========
  public formSubmitted:boolean=false;
  public productAdded:boolean=false;
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

  //public storeInProductsModel: StoreInProductsModel = new StoreInProductsModel();

  //public storeInProductsModelList: Array<StoreInProductsModel> = new Array<StoreInProductsModel>();

  public storeModelList: Array<StoreModel> = new Array<StoreModel>();
  public vendorModelList: Array<VendorModel> = new Array<VendorModel>();
  public productModelList: Array<ProductModel> = new Array<ProductModel>();

  public storeInProductViewModel:StoreInProductViewModel = new StoreInProductViewModel();
  public storeInProductViewModelList: Array<StoreInProductViewModel> = new Array<StoreInProductViewModel>();


  //helper variable==========
  private _storeName:string;
  private _vendorName:string;
  private _productName:string;


//========== Variables for this page business =====================================================




  //date-picker r&D =======================
  //get by id as jQuery
  @ViewChild('storeDropDown') storeDropDownRef :ElementRef ;
  model: any;
  public testDate: DateModel = new DateModel();
  public dateTime1:Date = new Date();
  //date-picker r&D =======================

  constructor(private vendorService: VendorService,
              private storeService: StoreService,
              private storeInProductService: StoreInProductsService,
              private formBuilder: FormBuilder,
              private toastr: ToastrService,
              public  ngxSmartModalService: NgxSmartModalService) { }

  ngOnInit() {



    //Util.logConsole(d);
    //debugger
    //we stop browser rendering to browser's debugging mode by following line
    this.initializedPageStateVariable();
    this.initializeReactiveFormValidation();

    this.getStoreList();
    this.getVendorList();

  }

  public onFocusOutQuantityEvent(){
    let price:number;
    let quantity:number;
    let total:number;
    price = this.storeInProductViewModel.price;
    quantity=this.storeInProductViewModel.quantity;
    if(!_.isNaN(price) && price>0 && !_.isNaN(quantity) && quantity>0){
      total= price*quantity;
      this.storeInProductViewModel.totalPrice=total;
    }

  }




  public onClickAddProduct(){
    let storeInProductViewModel:StoreInProductViewModel;


    this.productAdded=true;
    if(!this.entryForm.invalid){
      storeInProductViewModel = _.clone(this.storeInProductViewModel);
      storeInProductViewModel.storeName=this._storeName;
      storeInProductViewModel.vendorName=this._vendorName;
      this.storeInProductViewModelList.push(storeInProductViewModel);
      //Util.logConsole(this.storeInProductViewModelList,"Model Date");
      return;
    }
  }

  public onChangeStore(event){
    this._storeName=event.name;

    //Util.logConsole(event.id);
    //Util.logConsole(event.name);
  }

  public onChangeVendor(event){
    this._vendorName=event.name;

    //Util.logConsole(event.id);
    //Util.logConsole(event.name);
  }

  private getVendorList(){
    this.vendorService.getList().subscribe
    (
      (response:ResponseMessage)=>
      {
        if(response.httpStatus==HttpStatusCode.FOUND){
          this.vendorModelList = <Array<VendorModel>>response.data;
          return;
        }else if(response.httpStatus==HttpStatusCode.NOT_FOUND) {
          this.toastr.error('Failed to get Vendor list ',this.pageTitle);
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

  private getStoreList(){
    this.storeService.getList().subscribe
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
      store: ['', Validators.compose([Validators.required])],
      vendor: ['', Validators.compose([Validators.required])],
      barcode: ['', Validators.compose([Validators.required,Validators.maxLength(20)])],
      price: ['', Validators.compose([Validators.max(1000000000),Validators.required])],
      quantity: ['', Validators.compose([Validators.max(10000),Validators.required])],
      total: ['', Validators.compose([Validators.max(100000000)])],
      mfDate: ['', Validators.compose([Validators.required])],
      expDate: ['', Validators.compose([Validators.required])],
      entryDate: ['', Validators.compose([Validators.required])],
    });
  }


  ngAfterViewInit(): void {
    //Here we can access ng-select property and method dynamically
    Util.logConsole(this.storeDropDownRef);
  }

}
