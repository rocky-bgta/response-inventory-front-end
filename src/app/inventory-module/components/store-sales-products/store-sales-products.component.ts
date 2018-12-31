import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, NgForm, Validators} from "@angular/forms";
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
import * as _ from 'lodash';
import {HttpStatusCode} from "../../../core/constants/HttpStatusCode";
import {StoreInProductViewModel} from "../../model/view-model/store-in-product-view-model";
import {StoreInProductsService} from "../../service/store-in-products.service";
import {ProductService} from "../../service/product.service";
import {CustomerModel} from "../../model/customer-model";
import {CustomerService} from "../../service/customer.service";
import {DataTableRequest} from "../../../core/model/data-table-request";

import {StoreSalesProductViewModel} from "../../model/view-model/store-sales-product-view-model";
import {EnumService} from "../../service/enum.service";
import {KeyValueModel} from "../../../core/model/KeyValueModel";
import {Subject} from "rxjs/index";
import {DataTableDirective} from "angular-datatables";
import {SalesProductViewModel} from "../../model/view-model/sales-product-view-model";
import {StoreSalesProductsService} from "../../service/store-sales-products.service";


@Component({
  selector: 'app-store-sales-products',
  templateUrl: './store-sales-products.component.html',
  styleUrls: ['./store-sales-products.component.scss']
})
export class StoreSalesProductsComponent implements OnInit,  AfterViewInit, OnDestroy {


  public pageTitle:string="Store Sales";
  public entryForm: FormGroup;


  //======== page state variables star ===========
  public formSubmitted:boolean;
  public productAdded:boolean;
  public isPageInUpdateState: boolean;
  //======== page state variables end  ===========

  //======= data table variable ========================
  private dataTablesCallBackParameters: DataTableRequest = new DataTableRequest();
  private dataTableCallbackFunction: any;
  public  dataTableOptions: DataTables.Settings = {};

  @ViewChild(DataTableDirective)
  public dtElement: DataTableDirective;
  public dtTrigger: Subject<any> = new Subject<any>();

  private storeId:string;
  private barcode:string;
  private serialNo:string;
  //====================================================


  //========== Variables for this page business =====================================================
  public storeModelList: Array<StoreModel> = new Array<StoreModel>();
  public customerModelList: Array<CustomerModel> = new Array<CustomerModel>();
  public paymentMethodsList: Array<KeyValueModel>  = new Array<KeyValueModel>();
  public availableSalesProductViewModelList: Array<SalesProductViewModel> = new Array<SalesProductViewModel>();

  public storeSalesProductViewModel: StoreSalesProductViewModel = new StoreSalesProductViewModel();

  //public productViewModelList: Array<ProductViewModel> = new Array<ProductViewModel>();


  public storeInProductViewModel:StoreInProductViewModel = new StoreInProductViewModel();
  //public storeInProductViewModelList: Array<StoreInProductViewModel> = new Array<StoreInProductViewModel>();

  public storeSelected:boolean=false;
  public customerSelected:boolean=false;


  public grandTotalSalesPrice:number = 0;

  //helper variable==========
  //private _storeName:string;
//========== Variables for this page business =====================================================



  //get by id as jQuery and access native property of element
  @ViewChild('storeDropDown') storeDropDownRef :ElementRef ;
  @ViewChild('barcode') barcodeRef :ElementRef ;
  //get by id as jQuery and access native property of element





  constructor(private storeService: StoreService,
              private productService: ProductService,
              private customerService: CustomerService,
              private storeSalesProductsService: StoreSalesProductsService,
              private enumService: EnumService,
              private storeInProductService: StoreInProductsService,
              private formBuilder: FormBuilder,
              private toastr: ToastrService,
              public  ngxSmartModalService: NgxSmartModalService) { }

  ngOnInit() {

    this.initializedPageStateVariable();
    this.initializeReactiveFormValidation();
    //this.storeId = "a25e90aa-0901-4f71-a52d-b180d8306bc2";
    this.populateDataTable();

    this.getStoreList();
    this.getCustomerList();
    this.getPaymentMethod();

    this.storeInProductViewModel.entryDate = new Date();
    this.storeInProductViewModel.price=1;
    this.storeInProductViewModel.quantity=1;
    this.storeInProductViewModel.totalPrice=1;

  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
  }
/*

  public onClickAddProduct(){
    //set this value for validation purpose only
    this.productAdded=true;
    //==========================================

    if(this.storeSelected && this.customerSelected) {
      this.barcodeRef.nativeElement.disabled = false;
      this.barcodeRef.nativeElement.focus();
    }


    //First check if any invalid entry exist
    if(this.entryForm.invalid){
      this.toastr.error("Please correct added product data first", this.pageTitle);
      return;
    }else {
      if (!this.entryForm.invalid) {
        this.productAdded=false;
        Util.logConsole(this.storeInProductViewModelList,"List");
        this.addProductToList();
        return;
      }
    }
  }
*/

  public onClickClear(){
    this.storeInProductViewModel = new StoreInProductViewModel();
    this.storeInProductViewModel.entryDate = new Date();
    this.storeSelected=false;
    this.customerSelected=false;
    this.productAdded=false;
  }

 /* public onClickClearAllAddedProduct(){
    this.storeInProductViewModelList = new Array<StoreInProductViewModel>();
  }*/

  public onClearStore(){
    this.storeSelected=false;
  }

  public onClickRemoveRow(index){
    this.availableSalesProductViewModelList.splice(index,1);
  }

  public onChangeStore(event,storeId:string){

    this.storeSalesProductViewModel.storeId=null;
    this.storeSalesProductViewModel.storeId = storeId;
    this.storeId = storeId;
    if(event!=null && !_.isEmpty(event)) {
      this.storeSelected = true;
      this.setFocusOnBarcodeInputTextBox();
    }
    //this.rerender();
  }

  public onChangeBarcode(barcode:string, event){
    this.storeSalesProductViewModel.barcode=null;
    this.storeSalesProductViewModel.barcode = barcode;
    this.barcode = barcode;
    this.rerender();
    event.target.select();
    event.target.value="";

  }

  public onChangeSerialNo(serialNo:string, event){
    this.storeSalesProductViewModel.serialNo=null;
    this.storeSalesProductViewModel.serialNo = serialNo;
    this.serialNo = serialNo;
    this.rerender();

  }


  public onChangeCustomer(event, customerId:string){
    this.storeSalesProductViewModel.customerId=null;
    this.storeSalesProductViewModel.customerId = customerId;
    if(event!=null && !_.isEmpty(event)) {
      this.customerSelected = true;
      this.setFocusOnBarcodeInputTextBox();
    }
  }

  public onClearCustomer(){
    this.customerSelected=false;
  }

  public onChangeProduct(event){

  }

  public onClearProduct(){

  }

  public onChangeSaleMethod(event){

  }

  public onClearSaleMethod(){

  }


  public onFocusOutSalesPriceRowEvent(index:number, salesPrice:number){
    let isAllowedSalePrice:boolean;
    isAllowedSalePrice = this.verifySalesPrice(index,salesPrice);
    if(isAllowedSalePrice) {
      this.setRowWiseTotalPrice(index);
      //this.setGrandTotalSalesPrice();
    }
    else {
     this.availableSalesProductViewModelList[index].salesPrice=0;
     this.availableSalesProductViewModelList[index].totalPrice=0;
    }
  }

  public onFocusOutSalesQtyRowEvent(index:number, salesQty:number){
    let availableQty:number;
    availableQty = this.availableSalesProductViewModelList[index].available;
    if(salesQty>availableQty){
      this.availableSalesProductViewModelList[index].salesQty = availableQty;
    }
    //this.setGrandTotalSalesPrice();
    this.setRowWiseTotalPrice(index);
  }

  public onClickConfirmSales(dynamicForm:NgForm){
    if(!dynamicForm.invalid) {
      this.storeSalesProductViewModel.salesProductViewModelList = this.availableSalesProductViewModelList;
      Util.logConsole(this.storeSalesProductViewModel);
      this.saveStoreSalesProduct();
    }else {
      this.toastr.info("Please correct entered sales products value");
    }
    return;

  }

  public onClickReset(){

  }

  public onFocusOutPaidAmount(paidAmount:number){
    this.setDueAmount(paidAmount);
  }


  private setRowWiseTotalPrice(index:number){
    let salesPrice: number;
    let salesQty:number;
    let totalPrice:number;
    salesPrice = this.availableSalesProductViewModelList[index].salesPrice;
    salesQty = this.availableSalesProductViewModelList[index].salesQty;
    if(index!=null && (!_.isNaN(salesPrice) && !_.isNaN(salesQty))){
      totalPrice = salesPrice * salesQty;
      this.availableSalesProductViewModelList[index].totalPrice = totalPrice;
      this.setGrandTotalSalesPrice();
    }
  }

  private verifySalesPrice(index:number, salesPrice):boolean{
    let buyPrice:number;
    let isSalesPriceAllowed:boolean=false;
    if(index!=null && !_.isNaN(index)){
      buyPrice = this.availableSalesProductViewModelList[index].buyPrice;
      if(salesPrice<buyPrice){
        isSalesPriceAllowed = false;
      }else {
        isSalesPriceAllowed = true;
      }
    }
    return isSalesPriceAllowed;
  }

  private setGrandTotalSalesPrice(){
    let grandTotal:number=0;
    for(let product of this.availableSalesProductViewModelList){
      grandTotal+= product.totalPrice;
    }
    this.grandTotalSalesPrice = grandTotal;
    this.storeSalesProductViewModel.paidAmount = grandTotal;
  }

  private setDueAmount(paidAmount:number){
    let dueAmount:number;
    if(this.grandTotalSalesPrice == paidAmount){
      dueAmount =0;
    }else if(paidAmount<this.grandTotalSalesPrice){
      dueAmount = this.grandTotalSalesPrice - paidAmount;
    }
    this.storeSalesProductViewModel.dueAmount = dueAmount;
  }

  private getPaymentMethod(){
    this.enumService.getPaymentMethods().subscribe
    (
      (response:ResponseMessage)=>
      {
        if(response.httpStatus==HttpStatusCode.FOUND){
          this.paymentMethodsList = <Array<KeyValueModel>>response.data;
          //Default select first payment method.
          this.storeSalesProductViewModel.salesMethod = this.paymentMethodsList[0].value;
          //==================================
          return;
        }else if(response.httpStatus==HttpStatusCode.NOT_FOUND) {
          this.toastr.error(response.message,this.pageTitle);
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


  private saveStoreSalesProduct(){
    this.storeSalesProductViewModel.salesProductViewModelList = this.availableSalesProductViewModelList;

    let requestMessage: RequestMessage;
    requestMessage = Util.getRequestMessage(this.storeSalesProductViewModel);
    //requestMessage.list = this.availableSalesProductViewModelList;
    this.storeSalesProductsService.save(requestMessage).subscribe
    (
      (responseMessage: ResponseMessage) =>
      {
        if(responseMessage.httpStatus== HttpStatusCode.CONFLICT) {
          this.toastr.info(responseMessage.message, this.pageTitle);
        }else if(responseMessage.httpStatus==HttpStatusCode.FAILED_DEPENDENCY) {
          this.toastr.error(responseMessage.message,this.pageTitle);
        }else if(responseMessage.httpStatus==HttpStatusCode.CREATED){
          this.toastr.success( responseMessage.message,this.pageTitle);
          //this.vendorModel = <VendorModel> responseMessage.data;
          //this.getVendorList(this.dataTablesCallBackParameters, this.dataTableCallbackFunction);
          return;
        }else {
          this.toastr.error(responseMessage.message,this.pageTitle);
          return;
        }
      },

      (httpErrorResponse: HttpErrorResponse) =>
      {
        this.toastr.error('Failed to save Store in Product',this.pageTitle);
        if (httpErrorResponse.error instanceof ErrorEvent) {
          Util.logConsole("Client Side error occurred: " + httpErrorResponse.error.message);
        } else {
          this.toastr.error('There is a problem with the service. We are notified and working on it',this.pageTitle);
          this.toastr.info("Please reload this page");
          Util.logConsole(httpErrorResponse,"Server Side error occurred" );
        }
        return;
      }
    );
    return;
  }

  public isDisableBarcodeInput():boolean{
    if(this.customerSelected && this.storeSelected)
      return false;
    else {
      return true;
    }
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

  private getCustomerList(){
    this.customerService.getList().subscribe
    (
      (response:ResponseMessage)=>
      {
        if(response.httpStatus==HttpStatusCode.FOUND){
          this.customerModelList = <Array<CustomerModel>>response.data;
          return;
        }else if(response.httpStatus==HttpStatusCode.NOT_FOUND) {
          this.toastr.error(response.message,this.pageTitle);
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

  private async getProductByBarcode(barcode:string):Promise<ProductModel>{
    let productModel: ProductModel = null;
    await this.productService.getByBarcodeAsync(barcode.trim()).then
    (
      (responseMessage:ResponseMessage)=>
      {
        if(responseMessage.httpStatus==HttpStatusCode.FOUND){
          productModel = <ProductModel>responseMessage.data;
          //============== code need re-factor need to do promise base code ======================
          // this.storeInProductViewModel.productName = productModel.name;
          // this.storeInProductViewModel.productId = productModel.id;
          // this.storeInProductViewModel.price = productModel.price;
          // this.setTotalPrice();
          // this.addProductToList();
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
      }
    ).catch(
      (httpErrorResponse: HttpErrorResponse) =>
      {
        if (httpErrorResponse.error instanceof ErrorEvent) {
          Util.logConsole(httpErrorResponse,"Client-side error occurred.");
        } else {
          this.toastr.error('There is a problem with the service. We are notified and working on it');
          this.toastr.info("Please reload this page");
          Util.logConsole(httpErrorResponse,"Server Side error occurred" );
        }
        //request.unsubscribe();
        return;
      }
    );
    return productModel;
  }

  private async getProductListByBarcode(barcode:string):Promise<ProductModel>{
    let productModel: ProductModel = null;
    await this.productService.getByBarcodeAsync(barcode.trim()).then
    (
      (responseMessage:ResponseMessage)=>
      {
        if(responseMessage.httpStatus==HttpStatusCode.FOUND){
          productModel = <ProductModel>responseMessage.data;
          //============== code need re-factor need to do promise base code ======================
          // this.storeInProductViewModel.productName = productModel.name;
          // this.storeInProductViewModel.productId = productModel.id;
          // this.storeInProductViewModel.price = productModel.price;
          // this.setTotalPrice();
          // this.addProductToList();
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
      }
    ).catch(
      (httpErrorResponse: HttpErrorResponse) =>
      {
        if (httpErrorResponse.error instanceof ErrorEvent) {
          Util.logConsole(httpErrorResponse,"Client-side error occurred.");
        } else {
          this.toastr.error('There is a problem with the service. We are notified and working on it');
          this.toastr.info("Please reload this page");
          Util.logConsole(httpErrorResponse,"Server Side error occurred" );
        }
        //request.unsubscribe();
        return;
      }
    );
    return productModel;
  }

  private async getProductBySerialNo(serialNo:string):Promise<ProductModel>{
    let productModel: ProductModel = null;
    await this.productService.getByBarcodeAsync(serialNo.trim()).then
    (
      (responseMessage:ResponseMessage)=>
      {
        if(responseMessage.httpStatus==HttpStatusCode.FOUND){
          productModel = <ProductModel>responseMessage.data;
          return productModel;
        }else if(responseMessage.httpStatus==HttpStatusCode.NOT_FOUND) {
          this.toastr.error(responseMessage.message,this.pageTitle);
          return;
        }else {
          Util.logConsole(responseMessage);
          return;
        }
      }
    ).catch(
      (httpErrorResponse: HttpErrorResponse) =>
      {
        if (httpErrorResponse.error instanceof ErrorEvent) {
          Util.logConsole(httpErrorResponse,"Client-side error occurred.");
        } else {
          this.toastr.error('There is a problem with the service. We are notified and working on it');
          this.toastr.info("Please reload this page");
          Util.logConsole(httpErrorResponse,"Server Side error occurred" );
        }
        //request.unsubscribe();
        return;
      }
    );
    return productModel;
  }

  private getAvailableStoreInProductListByStoreIdOrBarcodeOrSerialNo(dataTablesParameters: DataTableRequest, callback: any, storeId?: string, barcode?:string, serialNo?:string){
    //let productViewModelList: Array<ProductViewModel> = null;
    //this.dataTablesCallBackParameters = dataTablesParameters;
    //this.dataTableCallbackFunction = callback;
    if(storeId!=null) {
      this.storeInProductService.getStoreInAvailableProductListByIdentificationIds(dataTablesParameters,storeId,barcode,serialNo).subscribe
      (
        (responseMessage: ResponseMessage) => {
          if (responseMessage.httpStatus == HttpStatusCode.FOUND) {
            this.availableSalesProductViewModelList = <Array<SalesProductViewModel>>responseMessage.data;
            //Util.logConsole(this.availableProductViewModelList);
            //return productViewModelList;
          } else if (responseMessage.httpStatus == HttpStatusCode.NOT_FOUND) {
            this.toastr.error(responseMessage.message, this.pageTitle);
            return;
          } else {
            Util.logConsole(responseMessage);
            return;
          }

          callback({
            recordsTotal: responseMessage.dataTableResponse.recordsTotal,
            recordsFiltered: responseMessage.dataTableResponse.recordsFiltered,
            data: []
          });
        }
        ,
        (httpErrorResponse: HttpErrorResponse) => {
          if (httpErrorResponse.error instanceof ErrorEvent) {
            Util.logConsole(httpErrorResponse, "Client-side error occurred.");
          } else {
            this.toastr.error('There is a problem with the service. We are notified and working on it');
            this.toastr.info("Please reload this page");
            Util.logConsole(httpErrorResponse, "Server Side error occurred");
          }
          return;
        });
    }
  }

  private populateDataTable():void{
   // Util.logConsole("Populate table");

    this.dataTableOptions =
      {
        pagingType: 'full_numbers',
        pageLength: 10,
        serverSide: true,
        processing: false,
        searching: false,
        ajax: (dataTablesParameters: DataTableRequest, callback) => {
          this.getAvailableStoreInProductListByStoreIdOrBarcodeOrSerialNo(dataTablesParameters, callback,this.storeId, this.barcode);
        },
        columns: [
          {title:'Name',        data: 'productName'},
          {title:'Category',    data: 'categoryName'},
          {title:'Brand',       data: 'brandName'},
          {title:'Model No',    data: 'modelNo'},
          {title:'Stock Qty',   data: 'available'},
          {title:'Buy Price',   data: 'buyPrice'},
          {title:'Sales Price', data: 'salesPrice'},
          {title:'Sales Qty',   data: 'salesQty'},
          {title:'Total Price', data: 'totalPrice'},
          {title:'Serial No',   data: 'serialNo'},
          {title:'Support Period', data: 'supportPeriodInMonth'},
          {title:'Action',      data: 'totalPrice'}
          ]
      };
  }

  private setFocusOnBarcodeInputTextBox(){
    //Util.logConsole(this.barcodeRef.nativeElement);
    if(this.storeSelected && this.customerSelected){
      //this.barcodeRef.nativeElement.dis
      this.barcodeRef.nativeElement.disabled=false;
      this.barcodeRef.nativeElement.focus();
      //this.barcodeRef.nativeElement.focus();
      this.rerender();
    }
  }

  private initializedPageStateVariable():void{
    this.isPageInUpdateState = false;
    this.productAdded=false;
    this.formSubmitted=false;
  }

  private initializeReactiveFormValidation():void{
    let allowedCharacter = "^((?!(0))[0-9]{1,10})$";
    this.entryForm = this.formBuilder.group({
      store: ['',     Validators.compose([Validators.required])],
      customer: ['',  Validators.compose([Validators.required])],
      product: ['',   Validators.compose([Validators.required])],
      barcode: ['',   Validators.compose([Validators.maxLength(20)])],
      serialNo: ['',  Validators.compose([Validators.maxLength(20)])],
      saleOn: ['',    Validators.compose([Validators.required])],
      quantity: ['',  Validators.compose([Validators.max(100)])],
      buyPrice: ['',  Validators.compose([Validators.maxLength(10),Validators.pattern(allowedCharacter)])],
      salesPrice: ['',Validators.compose([Validators.maxLength(10),Validators.pattern(allowedCharacter)])],
    });
  }

}
