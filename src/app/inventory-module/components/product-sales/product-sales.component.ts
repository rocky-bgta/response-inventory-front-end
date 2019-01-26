import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
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
import {DropDownModel} from "../../../core/model/DropDownModel";

declare var jQuery: any;

@Component({
  selector: 'app-product-sales',
  templateUrl: './product-sales.component.html',
  styleUrls: ['./product-sales.component.scss']
})
export class ProductSalesComponent implements OnInit {

  public pageTitle: string = "Product Sales";
  public entryForm: FormGroup;
  public formSubmitted: boolean = false;
  //get by id as jQuery and access native property of element
  //@ViewChild('productList') productDropDownRef :ElementRef ;
  @ViewChild('barcode') barcodeRef: ElementRef;

  public showBuyPrice: boolean = false;
  //public showBrand: boolean = false;

  //======= save modal text ======================================
  public modalHeader: string;
  public modalBodyText: string = "You are about to confirm sales, of those selected products";
  //======= save modal text ======================================


  public storeModelList: Array<StoreModel> = new Array<StoreModel>();
  public productModelList: Array<ProductModel> = new Array<ProductModel>();
  public customerModelList: Array<CustomerModel> = new Array<CustomerModel>();

  public productSalesViewModel: ProductSalesViewModel = new ProductSalesViewModel();
  public customerModel: CustomerModel = new CustomerModel();

  private searchRequestParameter: CustomObject = {};

  public availableSalesProductViewModelList: Array<SalesProductViewModel> = new Array<SalesProductViewModel>();

  public selectedProductListForSales: Array<SalesProductViewModel> = new Array<SalesProductViewModel>();

  //public storeSalesProductViewModel: StoreSalesProductViewModel = new StoreSalesProductViewModel();

  public grandTotalSalesPrice: number = 0;

  //private barcode:string;

  public dropDownModelList: Array<DropDownModel> = new Array<DropDownModel>();

  constructor(private storeService: StoreService,
              private customerService: CustomerService,
              private storeInProductService: StoreInProductsService,
              private formBuilder: FormBuilder,
              private toaster: ToastrService,
              private productSalesService: ProductSalesService,
              public  ngxSmartModalService: NgxSmartModalService) {
  }


  public isStoreSelected: boolean = false;
  public isProductSelected: boolean = false;
  public isCustomerSelected: boolean = false;

  ngOnInit() {
    this.initializeReactiveFormValidation();
    this.getStoreList();
    this.getCustomerList();
    this.setInvoiceNo();
  }

  private setModelForSave() {
    this.productSalesViewModel.salesProductViewModelList = this.selectedProductListForSales;
    this.productSalesViewModel.grandTotal = this.grandTotalSalesPrice;
    //Util.logConsole(this.productSalesViewModel);
    this.ngxSmartModalService.getModal('saveConfirmationModal').open();
  }

  public onClickSave(dynamicForm: NgForm) {
    this.formSubmitted = true;
    let isCustomerInformationValid: boolean;

    if (!dynamicForm.invalid) {

      //manually required field check for customer ==================
      if (!this.isCustomerSelected) {
        isCustomerInformationValid = this.customerRequiredInfoCheck();
        if (isCustomerInformationValid) {
          this.setModelForSave();
          return
        } else {
          this.toaster.info("Please enter customer information");
        }
        //manually required field check for customer ===============
      } else {
        this.setModelForSave();
        return
      }
    } else {
      this.toaster.info("Please correct entered sales products value");
    }
    return;
  }

  public onClickSaveConfirmationOfModal(isConfirm: boolean) {
    if (isConfirm) {
      this.saveSalesProduct();
    }
  }

  public async onChangeStore(event: StoreModel) {
    //Util.logConsole(event);
    if (event !== undefined) {
      this.isStoreSelected = true;
      this.productModelList = await this.getProductListByStoreId(event.id);
      this.dropDownModelList = await this.buildDropDownModel(this.productModelList);
      this.searchRequestParameter.storeId = event.id;
      this.setFocusOnBarcodeInputTextBox();
      //this.getAvailableProductsForSales(this.searchRequestParameter);
    }

  }

  public onClearStore() {
    //let length:number;
    this.isStoreSelected = false;
    this.productSalesViewModel.productId = null;
    //length = this.selectedProductListForSales.length;
    //this.selectedProductListForSales.splice(0,length);
    this.productModelList = null;
  }

  public onChangeCustomer(event, customerId: string) {
    this.isCustomerSelected = true;
    this.customerModel = new CustomerModel();
  }

  public onClearCustomer() {
    this.isCustomerSelected = false;
  }

  public onChangeProduct(event: DropDownModel) {
    if (event !== undefined) {
      this.searchRequestParameter.productId = event.id;
      this.searchRequestParameter.barcode = null;
      this.getAvailableProductsForSales(this.searchRequestParameter);
      //Util.logConsole(this.productDropDownRef);
      //this.productDropDownRef.nativeElement.clear();
      //event.id=null;
      //this.productSalesViewModel.productId=null;
      this.isProductSelected = true;

    }
  }

  public onClearProduct() {
    //this.isProductSelected=true;
  }

  public onChangeBarcode(barcode: string, event) {
    this.productSalesViewModel.barcode = null;
    this.searchRequestParameter.productId = null;
    this.searchRequestParameter.barcode = barcode;
    this.getAvailableProductsForSales(this.searchRequestParameter);
    event.target.select();
    event.target.value = "";
  }

  public onFocusBarcode() {
    this.productSalesViewModel.productId = null;
  }

  public onFocusOutSalesPriceRowEvent(index: number, salesPrice: number) {
    let isAllowedSalePrice: boolean;
    //let invoiceDiscountAmount: number = this.productSalesViewModel.discountAmount;
    isAllowedSalePrice = this.verifySalesPrice(index, salesPrice);
    if (isAllowedSalePrice) {
      this.setRowWiseDiscountSalesPrice(index);
      this.setRowWiseTotalPrice(index);
      this.setInvoiceDiscount(this.productSalesViewModel.discountAmount.toString());
      //this.setGrandTotalSalesPrice();
    }
    else {
      this.selectedProductListForSales[index].salesPrice = 0;
      this.selectedProductListForSales[index].totalPrice = 0;
    }
  }

  public onFocusOutSalesQtyRowEvent(index: number, salesQty: number) {
    let availableQty: number;
    availableQty = this.selectedProductListForSales[index].available;
    if (salesQty > availableQty) {
      this.selectedProductListForSales[index].salesQty = availableQty;
    }
    /* if(!_.isNaN(salesQty)){
       this.selectedProductListForSales[index].salesQty = 1;
     }*/
    this.setRowWiseDiscountSalesPrice(index);
    this.setRowWiseTotalPrice(index);
    this.setInvoiceDiscount(this.productSalesViewModel.discountAmount.toString());
  }

  public onFocusOutDiscountRowEvent(index: number) {
    this.setRowWiseDiscountSalesPrice(index);
    this.setRowWiseTotalPrice(index);
    this.setInvoiceDiscount(this.productSalesViewModel.discountAmount.toString());
  }

  public onClickRemoveRow(index) {
    this.selectedProductListForSales[index].required = false;
    this.selectedProductListForSales.splice(index, 1);
    this.setGrandTotalSalesPrice();
  }

  public onFocusOutPaidAmount(paidAmount: number) {
    if (this.grandTotalSalesPrice < paidAmount) {
      this.productSalesViewModel.paidAmount = this.grandTotalSalesPrice;
    } else {
      /* if(!_.isNaN(paidAmount)){
         this.productSalesViewModel.paidAmount=0;
       }*/
      this.setDueAmount(paidAmount);
    }
  }

  public onClickReset() {
    this.resetPage();
  }

  public onFocusOutInvoiceDiscountAmount(discount: string) {
    this.setInvoiceDiscount(discount);
  }

  private setInvoiceDiscount(discount: string) {
    let discountAmount: number;
    let invoiceAmount: number;
    let grandTotalAmountAfterDiscount: number;
    if (discount != null && discount!="") {
      discountAmount = +discount;
      if (discountAmount > 0) {
        invoiceAmount = this.grandTotalSalesPrice;
        grandTotalAmountAfterDiscount = invoiceAmount - discountAmount;
        this.grandTotalSalesPrice = grandTotalAmountAfterDiscount;
        this.productSalesViewModel.paidAmount = grandTotalAmountAfterDiscount;
      }
    } else {
      this.setGrandTotalSalesPrice();
    }
  }

  private setRowWiseDiscountSalesPrice(index: number) {
    let salesPrice: number;
    let qty: number;
    let discountPercent: number;
    let totalPriceBeforeDiscount: number;
    let totalPriceAfterDiscount: number;
    let discountAmount: number;
    if (!_.isNaN(index)) {
      discountAmount = this.selectedProductListForSales[index].discount;
      if (!_.isNaN(discountAmount) && +discountAmount > 0) {
        salesPrice = this.selectedProductListForSales[index].salesPrice;
        qty = this.selectedProductListForSales[index].salesQty;

        if (!_.isNaN(qty) && +qty > 0) {
          totalPriceBeforeDiscount = salesPrice * qty;
        } else {
          totalPriceBeforeDiscount = salesPrice;
        }

        if (!_.isNaN(totalPriceBeforeDiscount) && +totalPriceBeforeDiscount > 0) {
          discountPercent = discountAmount / 100;
          totalPriceAfterDiscount = totalPriceBeforeDiscount - (totalPriceBeforeDiscount * discountPercent);
          this.selectedProductListForSales[index].totalPrice = totalPriceAfterDiscount;
        }
      }
    }
  }

  private setDueAmount(paidAmount: number) {
    let dueAmount: number;
    if (this.grandTotalSalesPrice == paidAmount) {
      dueAmount = 0;
    } else if (paidAmount < this.grandTotalSalesPrice) {
      dueAmount = this.grandTotalSalesPrice - paidAmount;
    }
    this.productSalesViewModel.dueAmount = dueAmount;
  }

  public isDisableBarcodeInput(): boolean {
    if (this.isStoreSelected)
      return false;
    else {
      return true;
    }
  }

  private verifyAvailableQuantity(index: number, salesQty: number): boolean {
    let isAllowedInputSalesQty: boolean = true;
    let availableQty: number;
    availableQty = this.selectedProductListForSales[index].available;
    if (salesQty > availableQty) {
      this.selectedProductListForSales[index].salesQty = availableQty;
      isAllowedInputSalesQty = false;
    }
    return isAllowedInputSalesQty;
  }

  private verifySalesPrice(index: number, salesPrice): boolean {
    let buyPrice: number;
    let isSalesPriceAllowed: boolean = false;
    if (index != null && !_.isNaN(index)) {
      buyPrice = this.selectedProductListForSales[index].buyPrice;
      if (salesPrice < buyPrice) {
        isSalesPriceAllowed = false;
      } else {
        isSalesPriceAllowed = true;
      }
    }
    return isSalesPriceAllowed;
  }

  private setRowWiseTotalPrice(index: number) {
    let salesPrice: number;
    let salesQty: number;
    let totalPrice: number;
    let discountAmount: number;
    //reset due amount====================
    this.productSalesViewModel.dueAmount = 0;
    //====================================
    salesPrice = this.selectedProductListForSales[index].salesPrice;
    salesQty = this.selectedProductListForSales[index].salesQty;
    discountAmount = this.selectedProductListForSales[index].discount;

    if (!_.isNaN(salesQty) && salesQty == 0) {
      this.selectedProductListForSales[index].totalPrice = 0;
      this.setGrandTotalSalesPrice();
      return;
    }

    if (!_.isNaN(discountAmount) && discountAmount > 0) {
      //perform no calculation
      //this.selectedProductListForSales[index].totalPrice = totalPrice;
    } else {
      if (index != null && !Util.isNullOrUndefined(salesQty) && (!_.isNaN(salesPrice) && !_.isNaN(salesQty))) {
        totalPrice = salesPrice * salesQty;
        totalPrice = Util.roundNumberToTwoDecimalPlace(totalPrice);
        /*if(!_.isNaN(discountAmount) && discountAmount>0){
          totalPrice = totalPrice - discountAmount;
        }*/
        this.selectedProductListForSales[index].totalPrice = totalPrice;

      }
    }
    this.setGrandTotalSalesPrice();
  }

  private setGrandTotalSalesPrice() {
    let grandTotal: number = 0;
    for (let product of this.selectedProductListForSales) {
      if (Util.isNullOrUndefined(product.totalPrice) == false)
        grandTotal += product.totalPrice;
    }
    this.grandTotalSalesPrice = grandTotal;
    this.productSalesViewModel.paidAmount = grandTotal;
  }

  private getAvailableProductsForSales(searchRequestParameter: any) {
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

  private async getProductListByStoreId(storeId: string): Promise<Array<ProductModel>> {
    let productModelList: Array<ProductModel> = null;
    await this.storeInProductService.getProductListByStoreIdAsync(storeId).then
    (
      (response: ResponseMessage) => {
        if (response.httpStatus == HttpStatusCode.FOUND) {
          productModelList = <Array<ProductModel>>response.data;
          return productModelList;
        } else if (response.httpStatus == HttpStatusCode.NOT_FOUND) {
          this.toaster.error(response.message, this.pageTitle);
          productModelList = <Array<ProductModel>>response.data;
          //await this.buildDropDownModel(this.productModelList);
          return productModelList;
        } else {
          Util.logConsole(response);
          return;
        }
      }
    );
    return productModelList;
  }

  private async buildDropDownModel(productModelList: Array<ProductModel>): Promise<Array<DropDownModel>> {
    let dropDownModel: DropDownModel;
    let dropDownModelList: Array<DropDownModel> = new Array<DropDownModel>();
    for (let item of productModelList) {
      dropDownModel = new DropDownModel();
      dropDownModel.id = item.id;
      dropDownModel.name = item.name + ", ModelNo: " + item.modelNo;
      dropDownModelList.push(dropDownModel)
    }

    return dropDownModelList;
  }

  private checkIsProductAlreadyAddedToList(productId: string): boolean {
    let isProductContainedInList: boolean = false;
    let isAllowedInputSalesQty: boolean;

    let salesProductViewModel: SalesProductViewModel;
    let index: number;
    let salesQty: number;

    salesProductViewModel = _.find(this.selectedProductListForSales, {productId});

    if (salesProductViewModel != null && !_.isEmpty(salesProductViewModel)) {
      isProductContainedInList = true;
      // if product exist then do not add new row just increase qty
      index = _.findIndex(this.selectedProductListForSales, {productId: productId});
      if (!_.isNaN(index)) {

        salesQty = this.selectedProductListForSales[index].salesQty;
        salesQty = salesQty + 1;

        isAllowedInputSalesQty = this.verifyAvailableQuantity(index, salesQty);
        if (isAllowedInputSalesQty == true) {
          this.selectedProductListForSales[index].salesQty = salesQty;
          this.setRowWiseTotalPrice(index);
        }
      }
    }
    return isProductContainedInList;
  }

  private addAvailableProductToSalesProductList(availableProductList: Array<SalesProductViewModel>) {
    let isProductContainedInList: boolean;
    let salesProductViewModel: SalesProductViewModel;

    for (let product of availableProductList) {
      isProductContainedInList = this.checkIsProductAlreadyAddedToList(product.productId);
      if (!isProductContainedInList) {
        salesProductViewModel = new SalesProductViewModel();
        salesProductViewModel = _.clone(product);
        salesProductViewModel.salesPrice = 0;
        salesProductViewModel.salesQty = 1;
        salesProductViewModel.discount = 0;
        this.selectedProductListForSales.push(salesProductViewModel);
      }
    }
  }

  private setInvoiceNo() {
    let invoiceNo: string;
    //if(this.selectedProductListForSales!=null && this.selectedProductListForSales.length>0){
    invoiceNo = Util.getInvoiceNo();
    this.productSalesViewModel.invoiceNo = invoiceNo;
    this.modalHeader = invoiceNo;
    // }
  }

  private isNewCustomerInfoEntered(): boolean {
    let isNewCustomer: boolean;
    if (this.customerModel.name != null && this.customerModel.phoneNo1 != null)
      isNewCustomer = true;
    else
      isNewCustomer = false;
    return isNewCustomer;
  }

  private saveSalesProduct() {
    let requestMessage: RequestMessage;
    let isNewCustomerInfoEntered: boolean;

    this.productSalesViewModel.salesProductViewModelList = this.selectedProductListForSales;

    isNewCustomerInfoEntered = this.isNewCustomerInfoEntered();
    if (isNewCustomerInfoEntered)
      this.productSalesViewModel.customerModel = this.customerModel;


    requestMessage = Util.getRequestMessage(this.productSalesViewModel);
    //Util.logConsole(requestMessage,"request message");
    //requestMessage.list = this.availableSalesProductViewModelList;
    this.productSalesService.saveSalesProduct(requestMessage).subscribe
    (
      (responseMessage: ResponseMessage) => {
        if (responseMessage.httpStatus == HttpStatusCode.CONFLICT) {
          this.toaster.info(responseMessage.message, this.pageTitle);
        } else if (responseMessage.httpStatus == HttpStatusCode.FAILED_DEPENDENCY) {
          this.toaster.error(responseMessage.message, this.pageTitle);
        } else if (responseMessage.httpStatus == HttpStatusCode.IM_USED) {
          this.toaster.info(responseMessage.message, this.pageTitle);
          return;
        } else if (responseMessage.httpStatus == HttpStatusCode.CREATED) {
          this.toaster.success(responseMessage.message, this.pageTitle);
          this.resetPage();
          return;
        } else {
          this.toaster.error(responseMessage.message, this.pageTitle);
          return;
        }
      },

      (httpErrorResponse: HttpErrorResponse) => {
        this.toaster.error('Failed to save Store in Product', this.pageTitle);
        if (httpErrorResponse.error instanceof ErrorEvent) {
          Util.logConsole("Client Side error occurred: " + httpErrorResponse.error.message);
        } else {
          this.toaster.error('There is a problem with the service. We are notified and working on it', this.pageTitle);
          Util.logConsole(httpErrorResponse, "Server Side error occurred");
        }
        return;
      }
    );
    return;
  }

  private setFocusOnBarcodeInputTextBox() {
    //Util.logConsole(this.barcodeRef.nativeElement);
    if (this.isStoreSelected) {
      //this.barcodeRef.nativeElement.dis
      this.barcodeRef.nativeElement.disabled = false;
      this.barcodeRef.nativeElement.focus();
      //this.barcodeRef.nativeElement.focus();
    }
  }

  private resetPage() {
    let length: number = this.selectedProductListForSales.length;
    this.productSalesViewModel = new ProductSalesViewModel();
    this.isStoreSelected = false;
    this.isProductSelected = false;
    this.isCustomerSelected = false;

    this.selectedProductListForSales.splice(0, length);
    this.productSalesViewModel.storeId = null;
    this.productSalesViewModel.productId = null;
    this.productSalesViewModel.customerId = null;
    this.formSubmitted = false;
    this.setInvoiceNo();
    this.customerModel = new CustomerModel();
    this.customerModel.name = null;
    this.customerModel.phoneNo1 = null;
    this.customerModel.address = null;
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
      buyPrice: ['',],
      salesPrice: ['', Validators.compose([Validators.maxLength(20)])],
      customerName: ['', Validators.compose([Validators.maxLength(50)])],
      customerPhoneNo: ['', Validators.compose([Validators.maxLength(20)])],
      customerAddress: ['', Validators.compose([Validators.maxLength(200)])],
      showBuyPrice: ['',]
    });
  }

  private customerRequiredInfoCheck(): boolean {
    if (!this.isCustomerSelected) {
      if (this.customerModel.name != null && this.customerModel.phoneNo1 != null)
        return true;
      else
        return false;
    }
  }

}

/*

customerName: ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
  customerPhoneNo: ['', Validators.compose([Validators.required, Validators.maxLength(20)])],
  customerAddress: ['', Validators.compose([Validators.maxLength(200)])]*/
