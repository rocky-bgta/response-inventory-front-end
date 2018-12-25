import {AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, NgForm, Validators} from "@angular/forms";
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
import {ProductService} from "../../service/product.service";

@Component({
  selector: 'app-store-in-products',
  templateUrl: './store-in-products.component.html',
  styleUrls: ['./store-in-products.component.scss']
})
export class StoreInProductsComponent implements OnInit, AfterViewInit {


  public pageTitle:string="Store Product In";


  public entryForm: FormGroup;
  public dynamicForm: FormGroup;



  //======== page state variables star ===========
  public formSubmitted:boolean;
  public productAdded:boolean;
  public isPageInUpdateState: boolean;
  //public hideInputForm: boolean;
  //public hideProductAddedTable:boolean;
  public disablePageElementOnDetailsView: boolean;
  //======== page state variables end  ===========

  //======== Data Table variable  start ===========================
  //public dataTableOptions: DataTables.Settings = {};
  //private dataTablesCallBackParameters: DataTableRequest;
  //private dataTableCallbackFunction: any;
  //======== Data Table variable enc  =============================


  //========== Variables for this page business =====================================================

  //public storeInProductsModel: StoreInProductsModel = new StoreInProductsModel();

  //public storeInProductsModelList: Array<StoreInProductsModel> = new Array<StoreInProductsModel>();

  public storeModelList: Array<StoreModel> = new Array<StoreModel>();
  public vendorModelList: Array<VendorModel> = new Array<VendorModel>();
  //public productModelList: Array<ProductModel> = new Array<ProductModel>();
  private _productModel:ProductModel;

  public storeInProductViewModel:StoreInProductViewModel = new StoreInProductViewModel();
  public storeInProductViewModelList: Array<StoreInProductViewModel> = new Array<StoreInProductViewModel>();

  public storeSelected:boolean=false;
  public vendorSelected:boolean=false;


  //helper variable==========
  private _storeName:string;
  private _vendorName:string;
  //private _productName:string;


//========== Variables for this page business =====================================================




  //date-picker r&D =======================
  //get by id as jQuery
  @ViewChild('storeDropDown') storeDropDownRef :ElementRef ;
  @ViewChild('barcode') barcodeRef :ElementRef ;
  //model: any;
  //public testDate: DateModel = new DateModel();
  //public dateTime1:Date = new Date();
  //date-picker r&D =======================

  constructor(private vendorService: VendorService,
              private storeService: StoreService,
              private productService: ProductService,
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
    //this.initializeReactiveDynamicFormValidation();

    this.getStoreList();
    this.getVendorList();

    //for the time being ============
    this.storeInProductViewModel.entryDate = new Date();
    this.storeInProductViewModel.price=1;
    this.storeInProductViewModel.quantity=1;
    this.storeInProductViewModel.totalPrice=1;

  }

  public onFocusOutQuantityEvent(){
    this.setTotalPrice();
  }

  public onFocusOutQuantityRowEvent(index:number){
    this.setTotalPrice(index);
  }

  public onFocusOutPriceRowEvent(index:number){
    this.setTotalPrice(index);
  }


  private setTotalPrice(index?:number){
    let price:number;
    let quantity:number;
    let total:number;

    if(index!=null && !_.isNaN(index)){
      price = this.storeInProductViewModelList[index].price;
      quantity = this.storeInProductViewModelList[index].quantity;
    }else {
      price = this.storeInProductViewModel.price;
      quantity = this.storeInProductViewModel.quantity;
    }
    if(!_.isNaN(price) && price>0 && !_.isNaN(quantity) && quantity>0){
      total= price*quantity;
    }
    if(index!=null && !_.isNaN(index)){
      this.storeInProductViewModelList[index].totalPrice=total;
    }else {
      this.storeInProductViewModel.totalPrice=total;
    }
  }



  public onClickAddProduct(){

    if(this.storeSelected && this.vendorSelected) {
      this.barcodeRef.nativeElement.disabled = false;
      this.barcodeRef.nativeElement.focus();
    }

    this.productAdded=true;
    //First check if any invalid entry exist
    if(this.entryForm.invalid){
      this.toastr.error("Please correct added product data first", this.pageTitle);
      return;
    }else {
      if (!this.entryForm.invalid) {
        Util.logConsole(this.storeInProductViewModelList,"List");
        this.addProductToList();
        return;
      }
    }



  }

  private addProductToList():void{
    let storeInProductViewModel: StoreInProductViewModel;
    storeInProductViewModel = new StoreInProductViewModel();
    //storeInProductViewModel = _.clone(this.storeInProductViewModel);
    storeInProductViewModel.entryDate= _.clone(this.storeInProductViewModel.entryDate);
    storeInProductViewModel.productId = _.clone(this.storeInProductViewModel.productId);
    storeInProductViewModel.productName= _.clone(this.storeInProductViewModel.productName);
    storeInProductViewModel.price= _.clone(this.storeInProductViewModel.price);
    storeInProductViewModel.quantity= _.clone(this.storeInProductViewModel.quantity);
    storeInProductViewModel.totalPrice=_.clone(this.storeInProductViewModel.totalPrice);
    storeInProductViewModel.storeName = this._storeName;
    storeInProductViewModel.vendorName = this._vendorName;
    this.storeInProductViewModelList.push(storeInProductViewModel);
    this.productAdded=true;
    //this.storeInProductViewModel.barcode="";
  }

  public onClickSave(dynamicForm:NgForm){
    //this.formSubmitted=true;
    if(!dynamicForm.invalid)
      Util.logConsole(this.storeInProductViewModelList);
  }

  public onClearStore(){
    this.storeSelected=false;
  }

  public onClearVendor(){
    this.vendorSelected=false;
  }

  public onClickRemoveRow(index){
    //Util.logConsole("Remove index: "+index);
    this.storeInProductViewModelList.splice(index,1);
    if(this.storeInProductViewModelList.length==0){
      this.productAdded=false;
      //this.hideProductAddedTable=true;
    }
    //Util.logConsole(this.storeInProductViewModelList);
  }

  public onChangeStore(event){
    if(event!=null && !_.isEmpty(event)) {
      this._storeName = event.name;
      this.storeSelected = true;
      this.setFocusOnBarcodeInputTextBox();
    }

    //Util.logConsole(event.id);
    //Util.logConsole(event.name);
  }

  public onChangeVendor(event){
    if(event!=null && !_.isEmpty(event)) {
      this._vendorName = event.name;
      this.vendorSelected = true;
      this.setFocusOnBarcodeInputTextBox();
    }

    //Util.logConsole(event.id);
    //Util.logConsole(event.name);
  }

  public onChangeBarcode(barcode:string, event){
    //let productModel: ProductModel;
    //Util.logConsole("Barcode: "+ barcode);
    this.getProductByBarcode(barcode);
    event.target.select();
    event.target.value="";
    Util.logConsole(event);
    //Util.logConsole(productModel);
    //Util.logConsole(productModel,barcode);
    //this.storeInProductViewModel.barcode="";

  }

  public isDisableBarcodeInput():boolean{
    if(this.vendorSelected && this.storeSelected)
      return false;
    else
      return true;
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

   private getProductByBarcode(barcode:string):ProductModel{
    let productModel: ProductModel = null;
    this.productService.getByBarcode(barcode.trim()).subscribe
    (
      (responseMessage:ResponseMessage)=>
      {
        if(responseMessage.httpStatus==HttpStatusCode.FOUND){
          productModel = <ProductModel>responseMessage.data;
          //============== code need re-factor need to do promise base code ======================
          this.storeInProductViewModel.productName = productModel.name;
          this.storeInProductViewModel.productId = productModel.id;
          this.storeInProductViewModel.price = productModel.price;
          this.setTotalPrice();
          this.addProductToList();
          //======================================================================================

          //Util.logConsole(productModel,"Product Model from subscribe");
          return productModel;
        }else if(responseMessage.httpStatus==HttpStatusCode.NOT_FOUND) {
          this.toastr.error(responseMessage.message,this.pageTitle);
          return;
        }else {
          Util.logConsole(responseMessage);
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

    );
    return productModel;
  }

  private setFocusOnBarcodeInputTextBox(){
    //Util.logConsole(this.barcodeRef.nativeElement);
    if(this.storeSelected && this.vendorSelected){
      //this.barcodeRef.nativeElement.dis
      this.barcodeRef.nativeElement.disabled=false;
      this.barcodeRef.nativeElement.focus();
      //this.barcodeRef.nativeElement.focus();
    }
  }

  private initializedPageStateVariable():void{
    this.isPageInUpdateState = false;
    //this.hideProductAddedTable = true;
    this.disablePageElementOnDetailsView = false;
    //this.dataTablesCallBackParameters = new DataTableRequest();
    //this.dataTablesCallBackParameters.start = 0;
    //this.dataTablesCallBackParameters.length = 10;
    this.productAdded=false;
    this.formSubmitted=false;
  }

  private initializeReactiveFormValidation():void{
    this.entryForm = this.formBuilder.group({
      store: ['',     Validators.compose([Validators.required])],
      vendor: ['',    Validators.compose([Validators.required])],
      barcode: ['',   Validators.compose([Validators.required,Validators.maxLength(20)])],
      price: ['',     Validators.compose([Validators.max(10000000),Validators.required])],
      quantity: ['',  Validators.compose([Validators.max(100),Validators.required])],
      total: ['',     Validators.compose([Validators.max(1000000000000)])],
      mfDate: ['', ],
      expDate: ['', ],
      entryDate: ['', Validators.compose([Validators.required])],
      serialNo: ['',  Validators.compose([Validators.maxLength(50)])]
    });
  }

  private initializeReactiveDynamicFormValidation(index?:number){
    this.dynamicForm=this.formBuilder.group({
      dynamicSerialNo:  new FormControl(''),
      dynamicPrice:     new FormControl('',[Validators.required]),
      dynamicQuantity:  new FormControl('',[Validators.required]),
      dynamicMfDate:    new FormControl(''),
      dynamicExpDate:   new FormControl(''),
      dynamicEntryDate: new FormControl('',[Validators.required])
    });
  }


  ngAfterViewInit(): void {
    //Util.logConsole(this.barcodeRef.nativeElement);
    //Here we can access ng-select property and method dynamically
    //Util.logConsole(this.storeDropDownRef);
  }

}
