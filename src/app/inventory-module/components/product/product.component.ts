import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ProductModel} from "../../model/product-model";
import {Util} from "../../../core/Util";
import {ProductService} from "../../service/product.service";
import {ResponseMessage} from "../../../core/model/response-message";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CategoryModel} from "../../model/category-model";
import {CategoryService} from "../../service/category.service";
import {RequestMessage} from "../../../core/model/request-message";
import {HttpErrorResponse} from "@angular/common/http";
import {ToastrService} from "ngx-toastr";
import {DataTableRequest} from "../../../core/model/data-table-request";
import * as _ from 'lodash';
import {NgxSmartModalService} from "ngx-smart-modal";
import {FileConstant} from "../../../core/constants/file-constant";

declare var jQuery: any;

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {

  @ViewChild('fileInput') myFileInput: ElementRef;

  public categoryModelList: Array<CategoryModel>;
  public productModelList: Array<ProductModel>;
  public productModel: ProductModel;

  public dtOptions: DataTables.Settings = {};
  private dataTablesCallBackParameters: DataTableRequest;
  private dataTableCallbackFunction: any;

  public isPageUpdateState: boolean;
  public hideInputForm: boolean;
  public disableElementOnDetailsView: boolean;

  private base64imageString: string;
  base64textString = [];

  //====== value pass to delete confirmation modal
  public deleteObjectType: string = 'Product';

  public productForm: FormGroup;
  public submitted:boolean=false;

  constructor(private productService: ProductService,
              private categoryService: CategoryService,
              private toastr: ToastrService,
              public ngxSmartModalService: NgxSmartModalService,
              private formBuilder:FormBuilder) {
  }

  get f() {
    return this.productForm.controls;
  }

  ngOnInit() {
    this.productModel = new ProductModel();
    this.categoryModelList = new Array<CategoryModel>();
    this.productModelList = new Array<ProductModel>();

    this.isPageUpdateState = false;
    this.hideInputForm = false;
    this.disableElementOnDetailsView = false;

    this.getCategoryList();
    this.populateDataTable();

    this.initializeReactiveFormValidation();

  }

  //work as a save and update method
  public onSubmit() {
    this.submitted=true;
    if (this.isPageUpdateState == true && !this.productForm.invalid) {
      this.updateProduct();
      return;
    }

    if (this.isPageUpdateState == false) {
       //stop here if form is invalid
       if (this.productForm.invalid) {
         this.toastr.info("Please provide required form data","Product Entry");
         console.log(this.productForm.controls);
         //======== R&D================
         //let errors = this.productForm.errors;
         // const invalid = [];
         // const controls = this.productForm.controls;
         // for (const name in controls) {
         //   if (controls[name].invalid) {
         //     console.log(name);
         //     invalid.push(name);
         //   }
         // }
         //======== R&D================
         return;
       }

      this.saveProduct();
    }
  }

  public onClickImageClear() {
    console.log(this.myFileInput.nativeElement.files[0]);
    this.base64textString = [];
  }

  public onClickReset() {
    let editObjectId:string;
    if(this.isPageUpdateState){
      editObjectId = this.productModel.id;
      this.productModel = new ProductModel();
      this.productModel.id=editObjectId;
    }else {
      this.productModel = new ProductModel();
    }
    this.base64textString = [];
    //this.productModel = new ProductModel();
  }

  public onClickDetails(id) {
    let detailsProductModel: ProductModel;
    this.disableElementOnDetailsView = true;
    this.showInputForm();
    detailsProductModel = _.find(this.productModelList, {id});
    this.productModel = detailsProductModel;
    this.setImage(this.productModel.image);
  }

  public onClickEdit(id) {
    this.productService.getById(id).subscribe(
      (responseMessage: ResponseMessage) => {
        this.productModel = null;
        this.productModel = <ProductModel> responseMessage.data;
        //Util.logConsole(this.productModel);
        this.setImage(this.productModel.image);
        this.openEntryForm();
      },
      (httpErrorResponse: HttpErrorResponse) => {
        if (httpErrorResponse.error instanceof Error) {
          console.log("Client-side error occured.");
        } else {
          console.log("Server-side error occured.");
        }
      }
    );
  }

  public onClickCancel() {
    this.hideAndClearInputForm();
    this.submitted=false;
  }

  public onClickDelete(id) {
    let deleteProductModel: ProductModel;
    deleteProductModel = _.find(this.productModelList, {id});
    this.productModel = deleteProductModel;
    this.ngxSmartModalService.getModal('deleteConfirmationModal').open();
  }

  public onDeleteConfirm(id: string) {
    this.productService.delete(id).subscribe(
      (responseMessage: ResponseMessage) => {
        this.toastr.success('Product', responseMessage.message);
        this.resetPage();
        this.hideAndClearInputForm();
      },
      (httpErrorResponse: HttpErrorResponse) => {
        if (httpErrorResponse.error instanceof Error) {
          console.log("Client-side error occured.");
        } else {
          console.log("Server-side error occured.");
        }
      });
  }

  public onChangeCategory(event:any){
    if(!_.isEmpty(event))
      this.productModel.categoryId = event.id;
  }

  private getCategoryList() {
    this.categoryService.getList().subscribe(
      (response: ResponseMessage) => {
        this.categoryModelList = <Array<CategoryModel>>response.data;
      }, (httpErrorResponse: HttpErrorResponse) => {
        Util.errorHandler(httpErrorResponse);
      }
    )
  }

  private getProductList(dataTablesParameters: DataTableRequest, callback: any) {
    this.dataTablesCallBackParameters = dataTablesParameters;
    this.dataTableCallbackFunction = callback;

    this.productService.getList(dataTablesParameters)
      .subscribe((responseMessage: ResponseMessage) => {

        this.productModelList = <Array<ProductModel>>responseMessage.data;
        //Util.logConsole(this.productModelList);
        this.setCategoryNameForProductList();
        this.setImagePathForProductList();

        callback({
          recordsTotal: responseMessage.dataTableResponse.recordsTotal,
          recordsFiltered: responseMessage.dataTableResponse.recordsTotal,
          data: []
        });

      });

  }

  public onUploadChange(event: any) {
    let uploadFileSize:number;
    let uploadFileSizeLimit= FileConstant.uploadFileSizeLimit;
    this.base64textString = [];
    let file = event.target.files[0];
    uploadFileSize = file.size;
    if(uploadFileSize>uploadFileSizeLimit){
      this.toastr.error("File size must not exceeded 500KB","File Upload");
      return;
    }
    //console.log(file.size);
    if (file) {
      let reader = new FileReader();
      reader.onload = this.handleReaderLoaded.bind(this);
      reader.readAsBinaryString(file);
    }
  }

  private handleReaderLoaded(e) {
    this.base64imageString = (btoa(e.target.result));
    this.base64textString.push('data:image/png;base64,' + this.base64imageString);
  }

  private setImage(image: string[]) {
    this.base64textString = [];
    this.base64textString.push('data:image/png;base64,' + image);
  }

  private populateDataTable() {
    //========== DataTable option start ===========
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: false,
      searching: false,
      ajax: (dataTablesParameters: DataTableRequest, callback) => {
        this.getProductList(dataTablesParameters, callback);
      },
      columns: [
        {data: 'id'},
        {data: 'name'},
        {data: 'category'},
        {data: 'brand'},
        {data: 'modelNo'},
        {data: 'serialNo'},
        {data: 'price'},
        {data: 'image'}
      ]
    };
    //========== DataTable option end ==============
  }

  private setCategoryNameForProductList() {
    let categoryModel: CategoryModel;
    for (let index in this.productModelList) {
      let id = this.productModelList[index].categoryId;
      categoryModel = _.find(this.categoryModelList, {id});
      this.productModelList[index].categoryName = categoryModel.name;
    }
  }

  private setImagePathForProductList() {
    for (let index in this.productModelList) {
      this.productModelList[index].base64ImageString = 'data:image/png;base64,' + this.productModelList[index].image.toString();
    }
  }

  private openEntryForm() {
    this.showInputForm();
    this.isPageUpdateState = true;
    this.disableElementOnDetailsView = false;
  }

  private updateProduct() {
    let requestMessage: RequestMessage;
    //first set converted base64 image string to model then build request message
    this.productModel.base64ImageString = this.base64imageString;
    requestMessage = Util.getRequestMessage(this.productModel);
    this.productService.update(requestMessage).subscribe(
      (responseMessage: ResponseMessage) => {
        this.toastr.success('Product', responseMessage.message);
        this.resetPage();
      },
      (httpErrorResponse: HttpErrorResponse) => {
        if (httpErrorResponse.error instanceof Error) {
          console.log("Client-side error occured.");
        } else {
          console.log("Server-side error occured.");
        }
      }
    );
  }

  private saveProduct() {
    let requestMessage: RequestMessage;
    //first set converted base64 image string to model then build request message
    this.productModel.base64ImageString = this.base64imageString;
    requestMessage = Util.getRequestMessage(this.productModel);
    //==========================================================================

    this.productService.save(requestMessage).subscribe(
      (responseMessage: ResponseMessage) => {
        this.toastr.success('Product', responseMessage.message);
        this.productModel = <ProductModel> responseMessage.data;
        this.setImage(this.productModel.image);
        // update data of data table
        this.getProductList(this.dataTablesCallBackParameters, this.dataTableCallbackFunction);
      },
      (httpErrorResponse: HttpErrorResponse) => {
        if (httpErrorResponse.error instanceof Error) {
          this.toastr.success('Product', "Client-side error occured");
          console.log("Client-side error occured.");
        } else {
          this.toastr.success('Product', "Server-side error occured.");
          console.log("Server-side error occured.");
        }
      }
    );

  }

  private resetPage() {
    this.productModel = new ProductModel();
    this.base64textString = [];
    this.isPageUpdateState = false;
    this.getProductList(this.dataTablesCallBackParameters, this.dataTableCallbackFunction);
  }

  private hideAndClearInputForm(){
    jQuery('#collapseInputForm').collapse('hide');
    setTimeout(() => {
      //reset model
      this.productModel = new ProductModel();
      //reset image
      this.base64textString = [];
      this.disableElementOnDetailsView = false;
      this.isPageUpdateState=false;
    }, 500);
  }

  private showInputForm(){
    jQuery('#collapseInputForm').collapse('show');
    jQuery('html, body').animate({scrollTop: '0px'}, 500);
    jQuery("#collapseInputForm").scrollTop()
  }

  private initializeReactiveFormValidation(){
    //========== form validation ==========
    this.productForm = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.maxLength(20)])],
      categories: ['',Validators.required],
      brand: ['', Validators.compose([Validators.required, Validators.maxLength(20)])],
      modelNo: ['',Validators.compose([Validators.required, Validators.maxLength(20)])],
      //serialNo: ['',Validators.maxLength(20)],
      price: ['', Validators.compose([Validators.max(1000000000),Validators.required])],
      description: ['',Validators.maxLength(100)],
      barcode: ['',Validators.compose([Validators.required,Validators.maxLength(20)])]
    });
  }
}


