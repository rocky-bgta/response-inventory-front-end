import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
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
import {ProductViewModel} from "../../helper-components/view-model/product-view-model";

declare var jQuery: any;

@Component({
  selector: 'app-store-in-products',
  templateUrl: './store-in-products.component.html',
  styleUrls: ['./store-in-products.component.scss']
})
export class StoreInProductsComponent implements OnInit, AfterViewInit {


  public pageTitle: string = "Store Product In";


  public entryForm: FormGroup;
  //public dynamicForm: FormGroup;


  //======== page state variables star ===========
  public formSubmitted: boolean;
  public productAdded: boolean;
  public isPageInUpdateState: boolean;
  //public hideInputForm: boolean;
  //public hideProductAddedTable:boolean;
  //public disablePageElementOnDetailsView: boolean;
  //======== page state variables end  ===========

  //======== Regular Expression ===========================
  //public quantityValidation:string = '^((?!(0))[0-9])*$';

  //======== Regular Expression end  =============================


  //========== Variables for this page business =====================================================

  //public storeInProductsModel: StoreInProductsModel = new StoreInProductsModel();

  //public storeInProductsModelList: Array<StoreInProductsModel> = new Array<StoreInProductsModel>();

  public storeModelList: Array<StoreModel> = new Array<StoreModel>();
  public vendorModelList: Array<VendorModel> = new Array<VendorModel>();
  public productModelList: Array<ProductModel> = new Array<ProductModel>();
  //private _productModel:ProductModel;

  public storeInProductViewModel: StoreInProductViewModel = new StoreInProductViewModel();
  public storeInProductViewModelList: Array<StoreInProductViewModel> = new Array<StoreInProductViewModel>();

  public storeSelected: boolean = false;
  public vendorSelected: boolean = false;


  //helper variable==========
  private _storeName: string;
  private _vendorName: string;
  //private _modelNo:string;
  public selectedProductIdFromDropDownMenu:string;
//========== Variables for this page business =====================================================


  //get by id as jQuery and access native property of element
  @ViewChild('storeDropDown') storeDropDownRef: ElementRef;
  @ViewChild('barcode') barcodeRef: ElementRef;


  //get by id as jQuery and access native property of element


  constructor(private vendorService: VendorService,
              private storeService: StoreService,
              private productService: ProductService,
              private storeInProductService: StoreInProductsService,
              private formBuilder: FormBuilder,
              private toaster: ToastrService,
              public  ngxSmartModalService: NgxSmartModalService) {
  }

  ngOnInit() {



    //Util.logConsole(d);
    //debugger
    //we stop browser rendering to browser's debugging mode by following line
    this.initializedPageStateVariable();
    this.initializeReactiveFormValidation();
    //this.initializeReactiveDynamicFormValidation();

    this.getStoreList();
    this.getVendorList();
    this.getProductList();

    //for the time being ============
    this.storeInProductViewModel.entryDate = new Date();
    this.storeInProductViewModel.price = 1;
    this.storeInProductViewModel.quantity = 1;
    this.storeInProductViewModel.totalPrice = 1;

    //Util.logConsole(this.storeInProductViewModel);

  }

  /*


  public onClickAddProduct() {
    //set this value for validation purpose only
    this.productAdded = true;
    //==========================================

    if (this.storeSelected && this.vendorSelected) {
      this.barcodeRef.nativeElement.disabled = false;
      this.barcodeRef.nativeElement.focus();
    }


    //First check if any invalid entry exist
    if (this.entryForm.invalid) {
      this.toaster.error("Please correct added product data first", this.pageTitle);
      return;
    } else {
      if (!this.entryForm.invalid) {
        this.productAdded = false;
        Util.logConsole(this.storeInProductViewModelList, "List");
        this.addProductToList();
        return;
      }
    }
  }


*/

  public onClickSave(dynamicForm: NgForm) {
    if (!dynamicForm.invalid) {
      this.saveStoreInProduct();
    } else {
      this.toaster.info("Please correct entered product list value");
    }
    return;
  }

  public onClickClear() {
    this.storeInProductViewModel = new StoreInProductViewModel();
    this.storeInProductViewModel.entryDate = new Date();
    this.storeSelected = false;
    this.vendorSelected = false;
    this.productAdded = false;
    this.selectedProductIdFromDropDownMenu = null;
  }

  public onClickClearAllAddedProduct() {
    this.storeInProductViewModelList = new Array<StoreInProductViewModel>();
    this.selectedProductIdFromDropDownMenu = null;
  }

  public onClearStore() {
    this.storeSelected = false;
    this.selectedProductIdFromDropDownMenu=null;
  }

  public onClearVendor() {
    this.vendorSelected = false;
    if(!this.vendorSelected){
      this.selectedProductIdFromDropDownMenu=null;
    }
  }

  public onChangeProduct(productModel:ProductModel){
    let isProductContainedInList:boolean;
    if(productModel!==undefined) {
      isProductContainedInList = this.checkIsProductAlreadyAddedToList(productModel.id);
      if (!isProductContainedInList) {
        this.storeInProductViewModel.productName = productModel.name;
        this.storeInProductViewModel.productId = productModel.id;
        this.storeInProductViewModel.price = productModel.price;
        this.storeInProductViewModel.modelNo= productModel.modelNo;
        this.setTotalPrice(null);
        this.addProductToList()
      }
    }
  }


  public onClickRemoveRow(index) {
    //Util.logConsole("Remove index: "+index);
    this.storeInProductViewModelList.splice(index, 1);
    if (this.storeInProductViewModelList.length == 0) {
      this.productAdded = false;
      //this.hideProductAddedTable=true;
    }
  }

  public onChangeStore(event, storeId: string) {
    this.storeInProductViewModel.storeId = null;
    this.storeInProductViewModel.storeId = storeId;
    if (event != null && !_.isEmpty(event)) {
      this._storeName = event.name;
      this.storeSelected = true;
      this.setFocusOnBarcodeInputTextBox();
    }
  }

  public onChangeVendor(event, vendorId: string) {
    this.storeInProductViewModel.vendorId = null;
    this.storeInProductViewModel.vendorId = vendorId;
    if (event != null && !_.isEmpty(event)) {
      this._vendorName = event.name;
      this.vendorSelected = true;
      this.setFocusOnBarcodeInputTextBox();
    }
  }

  public onClickSelectedProductOfModal(selectedProductList: Array<ProductViewModel>) {
    let isProductContainedInList:boolean;


    for (let productViewModel of selectedProductList) {

      isProductContainedInList = this.checkIsProductAlreadyAddedToList(productViewModel.id);
      if (!isProductContainedInList) {

        this.storeInProductViewModel.productName = productViewModel.name;
        this.storeInProductViewModel.productId = productViewModel.id;
        this.storeInProductViewModel.price = productViewModel.price;
        this.storeInProductViewModel.modelNo = productViewModel.modelNo;
        this.setTotalPrice(null);
        this.addProductToList()
        //Util.logConsole(productViewModel,"Selected Product");
      }
    }
    this.ngxSmartModalService.get('productListModal').close();
  }

  public onFocusBarcode(){
    //this.selectedProductIdFromDropDownMenu=null;
  }

  public async onChangeBarcode(barcode: string, event) {
    let isProductContainedInList:boolean;
    let productModel: ProductModel;
    productModel = await this.getProductByBarcode(barcode);
    isProductContainedInList = this.checkIsProductAlreadyAddedToList(productModel.id);
    if (!isProductContainedInList) {
      this.storeInProductViewModel.productName = productModel.name;
      this.storeInProductViewModel.productId = productModel.id;
      this.storeInProductViewModel.price = productModel.price;
      this.storeInProductViewModel.modelNo = productModel.modelNo;
      this.setTotalPrice(null);
      this.addProductToList();
    }
    event.target.select();
    event.target.value = "";

  }

  private getProductList(){
    this.productService.getList(null).subscribe(
      (responseMessage: ResponseMessage) => {

        if (responseMessage.httpStatus == HttpStatusCode.OK) {
          this.productModelList = <Array<ProductModel>>responseMessage.data;
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

  public onFocusOutQuantityRowEvent(index: number) {
    this.setTotalPrice(index);
  }

  public onFocusOutPriceRowEvent(index: number) {
    this.setTotalPrice(index);
  }

  private addProductToList(): void {
    let storeInProductViewModel: StoreInProductViewModel;
    storeInProductViewModel = new StoreInProductViewModel();
    //storeInProductViewModel = _.clone(this.storeInProductViewModel);
    storeInProductViewModel.entryDate = _.clone(this.storeInProductViewModel.entryDate);
    storeInProductViewModel.productId = _.clone(this.storeInProductViewModel.productId);
    storeInProductViewModel.productName = _.clone(this.storeInProductViewModel.productName);
    storeInProductViewModel.modelNo = _.clone(this.storeInProductViewModel.modelNo);
    storeInProductViewModel.price = _.clone(this.storeInProductViewModel.price);
    storeInProductViewModel.quantity = _.clone(this.storeInProductViewModel.quantity);
    storeInProductViewModel.serialNo = _.clone(this.storeInProductViewModel.serialNo);
    storeInProductViewModel.totalPrice = _.clone(this.storeInProductViewModel.totalPrice);
    storeInProductViewModel.storeName = this._storeName;
    storeInProductViewModel.storeId = this.storeInProductViewModel.storeId;
    storeInProductViewModel.vendorName = this._vendorName;
    storeInProductViewModel.vendorId = _.clone(this.storeInProductViewModel.vendorId);
    this.storeInProductViewModelList.push(storeInProductViewModel);
    this.productAdded=true;


    //this.storeInProductViewModel.barcode="";
  }

  private checkIsProductAlreadyAddedToList(productId: string): boolean {
    let isProductContainedInList:boolean=false;
    let storeInProductViewModel: StoreInProductViewModel;
    let index: number;
    storeInProductViewModel = _.find(this.storeInProductViewModelList, {productId});

    if (storeInProductViewModel != null && !_.isEmpty(storeInProductViewModel)) {
      isProductContainedInList=true;
      index = _.findIndex(this.storeInProductViewModelList, {productId: productId});
      if (!_.isNaN(index)) {
        this.storeInProductViewModelList[index].quantity += 1;
        this.setTotalPrice(index);
      }
    }
    return isProductContainedInList;
  }

  private saveStoreInProduct() {
    let requestMessage: RequestMessage;
    requestMessage = Util.getRequestMessage(this.storeInProductViewModelList);
    this.storeInProductService.save(requestMessage).subscribe
    (
      (responseMessage: ResponseMessage) => {
        if (responseMessage.httpStatus == HttpStatusCode.CONFLICT) {
          this.toaster.info(responseMessage.message, this.pageTitle);
        } else if (responseMessage.httpStatus == HttpStatusCode.FAILED_DEPENDENCY) {
          this.toaster.error(responseMessage.message, this.pageTitle);
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
          this.toaster.info("Please reload this page");
          Util.logConsole(httpErrorResponse, "Server Side error occurred");
        }
        return;
      }
    );
    return;
  }

  private setTotalPrice(index?: number) {
    let price: number;
    let quantity: number;
    let total: number;

    if (index != null && !_.isNaN(index)) {
      price = this.storeInProductViewModelList[index].price;
      quantity = this.storeInProductViewModelList[index].quantity;
    } else {
      price = this.storeInProductViewModel.price;
      quantity = this.storeInProductViewModel.quantity;
    }
    if (!_.isNaN(price) && price > 0 && !_.isNaN(quantity) && quantity > 0) {
      total = price * quantity;
    }
    if (index != null && !_.isNaN(index)) {
      this.storeInProductViewModelList[index].totalPrice = total;
    } else {
      this.storeInProductViewModel.totalPrice = total;
    }
  }

  public isDisableBarcodeInput(): boolean {
    if (this.vendorSelected && this.storeSelected)
      return false;
    else
      return true;
  }

  private getVendorList() {
    this.vendorService.getList().subscribe
    (
      (response: ResponseMessage) => {
        if (response.httpStatus == HttpStatusCode.FOUND) {
          this.vendorModelList = <Array<VendorModel>>response.data;
          return;
        } else if (response.httpStatus == HttpStatusCode.NOT_FOUND) {
          this.toaster.error('Failed to get Vendor list ', this.pageTitle);
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

  private async getProductByBarcode(barcode: string): Promise<ProductModel> {
    let productModel: ProductModel = null;
    await this.productService.getByBarcodeAsync(barcode.trim()).then
    (
      (responseMessage: ResponseMessage) => {
        if (responseMessage.httpStatus == HttpStatusCode.FOUND) {
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
        } else if (responseMessage.httpStatus == HttpStatusCode.NOT_FOUND) {
          this.toaster.error(responseMessage.message, this.pageTitle);
          return;
        } else {
          Util.logConsole(responseMessage);
          return;
        }
      }
    ).catch(
      (httpErrorResponse: HttpErrorResponse) => {
        if (httpErrorResponse.error instanceof ErrorEvent) {
          Util.logConsole(httpErrorResponse, "Client-side error occurred.");
        } else {
          this.toaster.error('There is a problem with the service. We are notified and working on it');
          this.toaster.info("Please reload this page");
          Util.logConsole(httpErrorResponse, "Server Side error occurred");
        }
        //request.unsubscribe();
        return;
      }
    );
    return productModel;
  }

  private setFocusOnBarcodeInputTextBox() {
    //Util.logConsole(this.barcodeRef.nativeElement);
    if (this.storeSelected && this.vendorSelected) {
      //this.barcodeRef.nativeElement.dis
      this.barcodeRef.nativeElement.disabled = false;
      this.barcodeRef.nativeElement.focus();
      //this.barcodeRef.nativeElement.focus();
    }
  }

  private initializedPageStateVariable(): void {
    this.isPageInUpdateState = false;
    //this.hideProductAddedTable = true;
    //this.disablePageElementOnDetailsView = false;
    //this.dataTablesCallBackParameters = new DataTableRequest();
    //this.dataTablesCallBackParameters.start = 0;
    //this.dataTablesCallBackParameters.length = 10;
    this.productAdded = false;
    this.formSubmitted = false;
  }

  private resetPage() {
    let length: number = this.storeInProductViewModelList.length;
    this.storeInProductViewModelList.splice(0, length);
    this.storeInProductViewModel.storeId = null;
    this.storeInProductViewModel.vendorId = null;
    this.storeInProductViewModel.price = null;
    this.storeInProductViewModel.quantity = 1;
    this.storeInProductViewModel.entryDate = new Date();
    this.storeInProductViewModel.productName = null;
    this.storeInProductViewModel.totalPrice = null;
    this.productAdded = false;
    this.selectedProductIdFromDropDownMenu = null;
    this.productModelList.splice(0,this.productModelList.length);
  }

  private initializeReactiveFormValidation(): void {
    let allowedCharacter = "^((?!(0))[0-9]{1,10})$";
    this.entryForm = this.formBuilder.group({
      store: ['', Validators.compose([Validators.required])],
      vendor: ['', Validators.compose([Validators.required])],
      productList: [''],
      barcode: ['', Validators.compose([Validators.maxLength(20)])],
      //price: ['', Validators.compose([Validators.maxLength(10), Validators.pattern(allowedCharacter)])],
      //quantity: ['', Validators.compose([Validators.max(100)])],
      //total: ['', Validators.compose([Validators.max(1000000000000)])],
      mfDate: ['',],
      expDate: ['',],
      entryDate: ['', Validators.compose([Validators.required])],
      serialNo: ['', Validators.compose([Validators.maxLength(50)])]
    });
  }

  /*

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

  */


  ngAfterViewInit(): void {
    //Util.logConsole(this.barcodeRef.nativeElement);
    //Here we can access ng-select property and method dynamically
    //Util.logConsole(this.storeDropDownRef);
  }
}
