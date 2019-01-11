import {Component, OnInit} from '@angular/core';
import {StoreService} from "../../service/store.service";
import {StoreInProductsService} from "../../service/store-in-products.service";
import {FormBuilder, FormGroup, NgForm, Validators} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {NgxSmartModalService} from "ngx-smart-modal";
import {StoreModel} from "../../model/store-model";
import {CustomerModel} from "../../model/customer-model";
import {ProductModel} from "../../model/product-model";
import {Util} from "../../../core/Util";
import {HttpErrorResponse} from "@angular/common/http";
import {HttpStatusCode} from "../../../core/constants/HttpStatusCode";
import {ResponseMessage} from "../../../core/model/response-message";
import {CustomerService} from "../../service/customer.service";
import {ProductSalesViewModel} from "../../model/view-model/product-sales-view-model";
import {CustomObject} from "../../../core/interface/CustomObject";
import {ProductSalesService} from "../../service/product-sales.service";
import {SalesProductViewModel} from "../../model/view-model/sales-product-view-model";
import * as _ from 'lodash';
import {RequestMessage} from "../../../core/model/request-message";
import {StoreSalesProductsService} from "../../service/store-sales-products.service";

declare var jQuery: any;

@Component({
  selector: 'app-product-sales',
  templateUrl: './product-sales.component.html',
  styleUrls: ['./product-sales.component.scss']
})
export class ProductSalesComponent implements OnInit {

  public pageTitle: string = "Product Sales";
  public entryForm: FormGroup;
  //get by id as jQuery and access native property of element
  //@ViewChild('productList') productDropDownRef :ElementRef ;

  //======= save modal text ======================================
  public modalHeader: string;
  public modalBodyText:string = "You are about to confirm sales, of those selected products";
  //======= save modal text ======================================



  public storeModelList: Array<StoreModel> = new Array<StoreModel>();
  public productModelList: Array<ProductModel> = new Array<ProductModel>();
  public customerModelList: Array<CustomerModel> = new Array<CustomerModel>();

  public productSalesViewModel: ProductSalesViewModel = new ProductSalesViewModel();

  private searchRequestParameter:CustomObject = {};

  public availableSalesProductViewModelList: Array<SalesProductViewModel> = new Array<SalesProductViewModel>();

  public selectedProductListForSales: Array<SalesProductViewModel> = new Array<SalesProductViewModel>();

  //public storeSalesProductViewModel: StoreSalesProductViewModel = new StoreSalesProductViewModel();

  public grandTotalSalesPrice:number = 0;

  constructor(private storeService: StoreService,
              private customerService: CustomerService,
              private storeInProductService: StoreInProductsService,
              private formBuilder: FormBuilder,
              private toaster: ToastrService,
              private storeSalesProductsService: StoreSalesProductsService,
              private productSalesService: ProductSalesService,
              public  ngxSmartModalService: NgxSmartModalService) {
  }


  public isStoreSelected:boolean=false;
  public isProductSelected:boolean=false;

  ngOnInit() {
    this.initializeReactiveFormValidation();
    this.getStoreList();
    this.getCustomerList();
    this.setInvoiceNo();
  }

  public onClickConfirmSales(dynamicForm:NgForm){
    if(!dynamicForm.invalid) {
      this.productSalesViewModel.salesProductViewModelList = this.selectedProductListForSales;
      this.productSalesViewModel.grandTotal = this.grandTotalSalesPrice;
      Util.logConsole(this.productSalesViewModel);
      this.ngxSmartModalService.getModal('saveConfirmationModal').open();

      return
    }else {
      this.toaster.info("Please correct entered sales products value");
    }
    return;
  }

  public onClickSaveConfirmationOfModal(isConfirm:boolean){
    if(isConfirm){
      this.saveStoreSalesProduct();
    }
  }

  public onChangeStore(event:StoreModel) {
    //Util.logConsole(event);
    if(event!==undefined) {
      this.isStoreSelected=true;
      this.getProductListByStoreId(event.id);
      this.searchRequestParameter.storeId = event.id;
      //this.getAvailableProductsForSales(this.searchRequestParameter);
    }

  }

  public onClearStore() {
    let length:number;
    this.isStoreSelected=false;
    this.productSalesViewModel.productId=null;
    //lenght = this.selectedProductListForSales.length;
    //this.selectedProductListForSales.splice(0,length);
  }

  public onChangeCustomer(event, customerId: string) {

  }

  public onClearCustomer() {

  }

  public onChangeProduct(event:ProductModel) {
    if(event!==undefined) {
      this.searchRequestParameter.productId = event.id;
      this.getAvailableProductsForSales(this.searchRequestParameter);
      //Util.logConsole(this.productDropDownRef);
      //this.productDropDownRef.nativeElement.clear();
      //event.id=null;
      //this.productSalesViewModel.productId=null;
      this.isProductSelected=true;

    }
  }

  public onClearProduct() {
    //this.isProductSelected=true;
  }

  public onFocusOutSalesPriceRowEvent(index:number, salesPrice:number){
    let isAllowedSalePrice:boolean;
    isAllowedSalePrice = this.verifySalesPrice(index,salesPrice);
    if(isAllowedSalePrice) {
      this.setRowWiseTotalPrice(index);
      //this.setGrandTotalSalesPrice();
    }
    else {
      this.selectedProductListForSales[index].salesPrice=0;
      this.selectedProductListForSales[index].totalPrice=0;
    }
  }

  public onFocusOutSalesQtyRowEvent(index:number, salesQty:number){
    let availableQty:number;
    availableQty = this.selectedProductListForSales[index].available;
    if(salesQty>availableQty){
      this.selectedProductListForSales[index].salesQty = availableQty;
    }
    //this.setGrandTotalSalesPrice();
    this.setRowWiseTotalPrice(index);
  }

  public onClickRemoveRow(index){
    this.selectedProductListForSales[index].required=false;
    this.selectedProductListForSales.splice(index,1);
    this.setGrandTotalSalesPrice();
  }

  public onFocusOutPaidAmount(paidAmount:number){
    this.setDueAmount(paidAmount);
  }

  private setDueAmount(paidAmount:number){
    let dueAmount:number;
    if(this.grandTotalSalesPrice == paidAmount){
      dueAmount =0;
    }else if(paidAmount<this.grandTotalSalesPrice){
      dueAmount = this.grandTotalSalesPrice - paidAmount;
    }
    this.productSalesViewModel.dueAmount = dueAmount;
  }

  private verifyAvailableQuantity(index:number, salesQty:number):boolean{
    let isAllowedInputSalesQty:boolean=true;
    let availableQty:number;
    availableQty = this.selectedProductListForSales[index].available;
    if(salesQty>availableQty){
      this.selectedProductListForSales[index].salesQty = availableQty;
      isAllowedInputSalesQty = false;
    }
    return isAllowedInputSalesQty;
  }

  private verifySalesPrice(index:number, salesPrice):boolean{
    let buyPrice:number;
    let isSalesPriceAllowed:boolean=false;
    if(index!=null && !_.isNaN(index)){
      buyPrice = this.selectedProductListForSales[index].buyPrice;
      if(salesPrice<buyPrice){
        isSalesPriceAllowed = false;
      }else {
        isSalesPriceAllowed = true;
      }
    }
    return isSalesPriceAllowed;
  }

  private setRowWiseTotalPrice(index:number){
    let salesPrice: number;
    let salesQty:number;
    let totalPrice:number;
    salesPrice = this.selectedProductListForSales[index].salesPrice;
    salesQty = this.selectedProductListForSales[index].salesQty;
    if(index!=null && !Util.isNullOrUndefined(salesQty) && (!_.isNaN(salesPrice) && !_.isNaN(salesQty))){
      totalPrice = salesPrice * salesQty;
      this.selectedProductListForSales[index].totalPrice = totalPrice;
      this.setGrandTotalSalesPrice();
    }
  }

  private setGrandTotalSalesPrice(){
    let grandTotal:number=0;
    for(let product of this.selectedProductListForSales){
      if(Util.isNullOrUndefined(product.totalPrice)==false)
      grandTotal+= product.totalPrice;
    }
    this.grandTotalSalesPrice = grandTotal;
    this.productSalesViewModel.paidAmount = grandTotal;
  }

  private getAvailableProductsForSales(searchRequestParameter:any){
    this.productSalesService.getAllAvailableProduct(searchRequestParameter).subscribe
    (
      (responseMessage: ResponseMessage) => {
        if (responseMessage.httpStatus == HttpStatusCode.FOUND) {
          this.availableSalesProductViewModelList = <Array<SalesProductViewModel>>responseMessage.data;
          this.addAvailableProductToSalesProductList(this.availableSalesProductViewModelList);
          //Util.logConsole(this.availableSalesProductViewModelList);
        } else if (responseMessage.httpStatus == HttpStatusCode.NOT_FOUND) {
          this.toaster.error(responseMessage.message, this.pageTitle);
          return;
        } else {
          Util.logConsole(responseMessage);
          return;
        }
      }
      ,
      (httpErrorResponse: HttpErrorResponse) => {
        if (httpErrorResponse.error instanceof ErrorEvent) {
          Util.logConsole(httpErrorResponse, "Client-side error occurred.");
        } else {
          this.toaster.error('There is a problem with the service. We are notified and working on it');
          Util.logConsole(httpErrorResponse, "Server Side error occurred");
        }
        return;
      });
  }

  private getStoreList() {
    this.storeService.getList().subscribe
    (
      (response: ResponseMessage) => {
        if (response.httpStatus == HttpStatusCode.FOUND) {
          this.storeModelList = <Array<StoreModel>>response.data;
          return;
        } else if (response.httpStatus == HttpStatusCode.NOT_FOUND) {
          this.toaster.error('Failed to get Store list ', this.pageTitle);
          return;
        } else {
          Util.logConsole(response);
          return;
        }
      },

      (httpErrorResponse: HttpErrorResponse) => {
        if (httpErrorResponse.error instanceof Error) {
          Util.logConsole(httpErrorResponse, "Client-side error occurred.");
        } else {
          Util.logConsole(httpErrorResponse, "Client-side error occurred.");
        }
        return;
      }
    )
  }

  private getCustomerList() {
    this.customerService.getList().subscribe
    (
      (response: ResponseMessage) => {
        if (response.httpStatus == HttpStatusCode.FOUND) {
          this.customerModelList = <Array<CustomerModel>>response.data;
          return;
        } else if (response.httpStatus == HttpStatusCode.NOT_FOUND) {
          this.toaster.error(response.message, this.pageTitle);
          return;
        } else {
          Util.logConsole(response);
          return;
        }
      },

      (httpErrorResponse: HttpErrorResponse) => {
        if (httpErrorResponse.error instanceof Error) {
          Util.logConsole(httpErrorResponse, "Client-side error occurred.");
        } else {
          Util.logConsole(httpErrorResponse, "Client-side error occurred.");
        }
        return;
      }
    )
  }

  private getProductListByStoreId(storeId: string) {
    this.storeInProductService.getProductListByStoreId(storeId).subscribe
    (
      (response: ResponseMessage) => {
        if (response.httpStatus == HttpStatusCode.FOUND) {
          this.productModelList = <Array<ProductModel>>response.data;
          return;
        } else if (response.httpStatus == HttpStatusCode.NOT_FOUND) {
          this.toaster.error(response.message, this.pageTitle);
          return;
        } else {
          Util.logConsole(response);
          return;
        }
      },

      (httpErrorResponse: HttpErrorResponse) => {
        if (httpErrorResponse.error instanceof Error) {
          Util.logConsole(httpErrorResponse, "Client Side error occurred.");
        } else {
          Util.logConsole(httpErrorResponse, "Server-side error occurred.");
        }
        return;
      }
    )
  }

  private checkIsProductAlreadyAddedToList(productId: string): boolean {
    let isProductContainedInList:boolean=false;
    let isAllowedInputSalesQty:boolean;

    let salesProductViewModel: SalesProductViewModel;
    let index: number;
    let salesQty:number;

    salesProductViewModel = _.find(this.selectedProductListForSales, {productId});

    if (salesProductViewModel != null && !_.isEmpty(salesProductViewModel)) {
      isProductContainedInList=true;
      // if product exist then do not add new row just increase qty
      index = _.findIndex(this.selectedProductListForSales, {productId: productId});
      if (!_.isNaN(index)) {

        salesQty = this.selectedProductListForSales[index].salesQty;
        salesQty = salesQty+1;

        isAllowedInputSalesQty = this.verifyAvailableQuantity(index,salesQty);
        if(isAllowedInputSalesQty==true) {
          this.selectedProductListForSales[index].salesQty = salesQty;
          this.setRowWiseTotalPrice(index);
        }
      }
    }
    return isProductContainedInList;
  }

  private addAvailableProductToSalesProductList(availableProductList:Array<SalesProductViewModel>){
    let isProductContainedInList:boolean;
    let salesProductViewModel:SalesProductViewModel;

    for(let product of availableProductList){
      isProductContainedInList = this.checkIsProductAlreadyAddedToList(product.productId);
      if(!isProductContainedInList) {
        salesProductViewModel = new SalesProductViewModel();
        salesProductViewModel = _.clone(product);
        salesProductViewModel.salesPrice=0;
        salesProductViewModel.salesQty=1;
        this.selectedProductListForSales.push(salesProductViewModel);
      }
    }
  }

  private setInvoiceNo(){
    let invoiceNo:string;
    //if(this.selectedProductListForSales!=null && this.selectedProductListForSales.length>0){
      invoiceNo = Util.getInvoiceNo();
      this.productSalesViewModel.invoiceNo =invoiceNo;
      this.modalHeader = invoiceNo;
   // }
  }

  private saveStoreSalesProduct(){
    this.productSalesViewModel.salesProductViewModelList = this.selectedProductListForSales;

    let requestMessage: RequestMessage;
    requestMessage = Util.getRequestMessage(this.productSalesViewModel);
    Util.logConsole(requestMessage,"request message");
    return;
    //requestMessage.list = this.availableSalesProductViewModelList;
    this.storeSalesProductsService.save(requestMessage).subscribe
    (
      (responseMessage: ResponseMessage) =>
      {
        if(responseMessage.httpStatus== HttpStatusCode.CONFLICT) {
          this.toaster.info(responseMessage.message, this.pageTitle);
        }else if(responseMessage.httpStatus==HttpStatusCode.FAILED_DEPENDENCY) {
          this.toaster.error(responseMessage.message,this.pageTitle);
        }else if(responseMessage.httpStatus==HttpStatusCode.CREATED){
          this.toaster.success( responseMessage.message,this.pageTitle);
          this.resetPage();
          return;
        }else {
          this.toaster.error(responseMessage.message,this.pageTitle);
          return;
        }
      },

      (httpErrorResponse: HttpErrorResponse) =>
      {
        this.toaster.error('Failed to save Store in Product',this.pageTitle);
        if (httpErrorResponse.error instanceof ErrorEvent) {
          Util.logConsole("Client Side error occurred: " + httpErrorResponse.error.message);
        } else {
          this.toaster.error('There is a problem with the service. We are notified and working on it',this.pageTitle);
          Util.logConsole(httpErrorResponse,"Server Side error occurred" );
        }
        return;
      }
    );
    return;
  }

  private resetPage(){
    let length:number=this.selectedProductListForSales.length;
    this.productSalesViewModel = new ProductSalesViewModel();
    this.isStoreSelected=false;
    this.isProductSelected=false;
    //this.iscustomerSelected=false;

    this.selectedProductListForSales.splice(0,length);
    this.productSalesViewModel.storeId=null;
    this.productSalesViewModel.productId=null;
    this.productSalesViewModel.customerId=null;
    //this.storeSalesProductViewModel.salesMethod=null;
  }

  private initializeReactiveFormValidation(): void {
    let allowedCharacter = "^((?!(0))[0-9]{1,10})$";
    this.entryForm = this.formBuilder.group({
      store: ['', Validators.compose([Validators.required])],
      customer: [''],
      product: [''],
      //product: ['',   Validators.compose([Validators.required])],
      barcode: ['', Validators.compose([Validators.maxLength(20)])],
      serialNo: ['', Validators.compose([Validators.maxLength(20)])],
      saleOn: ['', Validators.compose([Validators.required])],
      quantity: ['', Validators.compose([Validators.max(100)])],
      buyPrice: ['', Validators.compose([Validators.maxLength(10), Validators.pattern(allowedCharacter)])],
      salesPrice: ['', Validators.compose([Validators.maxLength(10), Validators.pattern(allowedCharacter)])],
    });
  }

}
