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


//========== Variables for this page business =====================================================

  //get by id as jQuery
  @ViewChild('storeDropDown') storeDropDownRef :ElementRef ;

  //date-picker r&D =======================
  model: any;
  public testDate: DateModel = new DateModel();
  public dateTime1:Date = new Date();

  constructor(private vendorService: VendorService,
              private storeService: StoreService,
              private storeInProductService: StoreInProductsService,
              private formBuilder: FormBuilder,
              private toastr: ToastrService,
              public  ngxSmartModalService: NgxSmartModalService) { }

  ngOnInit() {

    this.testDate.year=2018;
    this.testDate.month=9;
    this.testDate.day=14;

    //Util.logConsole(d);
    //we stop browser rendering to browser's debugging mode by following line
    //debugger
    this.initializeReactiveFormValidation();

    this.getStoreList();
    this.getVendorList();

  }


  ngAfterViewInit(): void {
    //Here we can access ng-select property and method dynamically
    Util.logConsole(this.storeDropDownRef);
  }

  onClickSave(){
    let storeInPro: StoreInProductsModel = new StoreInProductsModel();
    var d = new Date(this.testDate.year,this.testDate.month-1,this.testDate.day+1);
    //storeInPro.manufacturingDate=d;
    //let month:number = this.dateTime1.getMonth()+1;
    storeInPro.manufacturingDate=this.dateTime1;
    let req:RequestMessage;
    req=Util.getRequestMessage(storeInPro);
    this.storeInProductService.save(req).subscribe(
      re=>{

      },error2 => {

      }
    )


  }

  public onChangeStore(event){
    Util.logConsole(event.id);
    Util.logConsole(event.name);
  }

  public onChangeVendor(event){
    Util.logConsole(event.id);
    Util.logConsole(event.name);
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

  private initializeReactiveFormValidation():void{
    //let notAllowedCharacter = "^[A-Za-z0-9_.]+$";
    //let notAllowedCharacter = "^[A-Za-z0-9-_. \\\\ \\/ - \\n]+$";
    this.entryForm = this.formBuilder.group({
      store: ['', Validators.compose([Validators.required])],
      vendor: ['', Validators.compose([Validators.required])],
      barcode: ['', Validators.compose([Validators.required,Validators.maxLength(20)])],
      price: ['', Validators.compose([Validators.max(1000000000),Validators.required])],
      quantity: ['', Validators.compose([Validators.max(10000),Validators.required])],
      total: ['', Validators.compose([Validators.max(100000000)])],
      mfDate: ['', Validators.compose([Validators.required])],
      exDate: ['', Validators.compose([Validators.required])],
      entryDate: ['', Validators.compose([Validators.required])],
      ngxDate: ['', Validators.compose([Validators.required])],
      //description: ['', Validators.compose([Validators.maxLength(200), Validators.pattern(notAllowedCharacter)])]

    });
  }

}
