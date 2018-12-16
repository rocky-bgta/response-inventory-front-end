import {Component, OnInit} from '@angular/core';

import {CategoryService} from "../../service/category.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {RequestMessage} from "../../../core/model/request-message";
import {Util} from "../../../core/Util";
import {HttpErrorResponse} from "@angular/common/http";
import {ResponseMessage} from "../../../core/model/response-message";
import {ToastrService} from "ngx-toastr";
import {DataTableRequest} from "../../../core/model/data-table-request";
import {CategoryModel} from "../../model/category-model";
import * as _ from 'lodash';
import {NgxSmartModalService} from "ngx-smart-modal";
import * as HttpStatus from 'http-status-codes'

declare var jQuery: any;

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {

  public categoryModel: CategoryModel = new CategoryModel();


  constructor(private categoryService: CategoryService,
              private formBuilder: FormBuilder,
              private toastr: ToastrService,
              public ngxSmartModalService: NgxSmartModalService) {

  }

  public categoryForm: FormGroup;
  public submitted:boolean=false;
  public pageTitle:string = "Category";
  // convenience getter for easy access to form fields
  get f() {
    return this.categoryForm.controls;
  }

  public dtOptions: DataTables.Settings = {};
  public categoryModelList: Array<CategoryModel> = new Array();

  private dataTablesCallBackParameters: DataTableRequest;
  private dataTableCallbackFunction: any;

  public isPageUpdateState: boolean;
  public hideCategoryInputForm: boolean;
  public disableElementOnDetailsView: boolean;

  ngOnInit() {
    this.initializedPageStateVariable();
    this.initializeReactiveFormValidation();
    this.populateDataTable();
  }

  private initializedPageStateVariable(){
    this.isPageUpdateState = false;
    this.hideCategoryInputForm = false;
    this.disableElementOnDetailsView = false;
    this.dataTablesCallBackParameters = new DataTableRequest();
    this.dataTablesCallBackParameters.start = 0;
    this.dataTablesCallBackParameters.length = 10;
  }

  private populateDataTable(){
    //========== DataTable option start ===========
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: false,
      searching: true,
      ajax: (dataTablesParameters: DataTableRequest, callback) => {
        this.getCategoryList(dataTablesParameters, callback);
      },
      columns: [{data: 'name'}, {data: 'description'}]
    };
    //========== DataTable option end ==============
  }

  private getCategoryList(dataTablesParameters: DataTableRequest, callback: any) {
    this.dataTablesCallBackParameters = dataTablesParameters;
    this.dataTableCallbackFunction = callback;

    this.categoryService.getList(dataTablesParameters)
      .subscribe((resp: ResponseMessage) => {
        this.categoryModelList = <Array<CategoryModel>>resp.data;

        callback({
          recordsTotal: resp.dataTableResponse.recordsTotal,
          recordsFiltered: resp.dataTableResponse.recordsTotal,
          data: []
        });
      });
  }


  //work as a save and update method
  onSubmit() {

    this.submitted=true;

    let requestMessage: RequestMessage;

    if (this.isPageUpdateState == true && !this.categoryForm.invalid) {
      this.updateCategory();
      return;
    }

    if (this.isPageUpdateState == false) {
      // stop here if form is invalid
      if (this.categoryForm.invalid) {
        this.toastr.info("Please provide required form data","Category");
        return;
      }

      requestMessage = Util.getRequestMessage(this.categoryModel);

      this.categoryService.save(requestMessage).subscribe(
        (responseMessage: ResponseMessage) =>
        {
          if(responseMessage.httpStatus==HttpStatus.CONFLICT){
            this.toastr.info(responseMessage.message, this.pageTitle);
          }else if(responseMessage.httpStatus==HttpStatus.FAILED_DEPENDENCY){
            this.toastr.error(responseMessage.message,this.pageTitle);
          }else if(responseMessage.httpStatus==HttpStatus.CREATED){
            this.toastr.success( responseMessage.message,this.pageTitle);
            this.categoryModel = <CategoryModel> responseMessage.data;
            this.getCategoryList(this.dataTablesCallBackParameters, this.dataTableCallbackFunction);
            return;
          }else {
            this.toastr.error(responseMessage.message,this.pageTitle);
            return;
          }


        },
        (httpErrorResponse: HttpErrorResponse) => {
          if (httpErrorResponse.error instanceof Error) {
            console.log("Client-side error occured.");
          } else {
            console.log("Server-side error occured.");
          }
        }
      );
      // alert('SUCCESS!! :-)\n\n' + JSON.stringify(this.categoryModel))
    }
  }


  public onClickEdit(id) {
    this.categoryService.getById(id).subscribe(
      (responseMessage: ResponseMessage) => {
        this.categoryModel = <CategoryModel> responseMessage.data;
        this.openCategoryCreateForm();
      },
      (httpErrorResponse: HttpErrorResponse) => {
        //Util.errorHandler(httpErrorResponse);

        if (httpErrorResponse.error instanceof Error) {
          console.log("Client-side error occured.");
        } else {
          console.log("Server-side error occured.");
        }

      }
    );
  }

  public onClickDetails(id) {
    let detailsCategoryModel: CategoryModel;
    this.disableElementOnDetailsView = true;
    jQuery('#collapseCategoryForm').collapse('show');
    jQuery('html, body').animate({scrollTop: '0px'}, 500);
    jQuery("#collapseCategoryForm").scrollTop();
    detailsCategoryModel = _.find(this.categoryModelList, {id});
    this.categoryModel = detailsCategoryModel;
    //Util.logConsole(detailsCategoryModel);
  }

  private updateCategory() {
    let requestMessage: RequestMessage;
    requestMessage = Util.getRequestMessage(this.categoryModel);
    this.categoryService.update(requestMessage).subscribe(
      (responseMessage: ResponseMessage) =>
      {
        if(responseMessage.httpStatus==HttpStatus.CONFLICT){
          this.toastr.info(responseMessage.message,this.pageTitle);
          return;
        }else if(responseMessage.httpStatus==HttpStatus.OK) {
          this.toastr.success( responseMessage.message,this.pageTitle);
          this.resetPage();
          return;
        }
      },
      (httpErrorResponse: HttpErrorResponse) =>
      {
        if (httpErrorResponse.error instanceof Error) {
          console.log("Client-side error occured.");
        } else {
          console.log("Server-side error occured.");
        }
      }
    );
  }

  public onClickReset() {
    if(this.isPageUpdateState) {
      this.categoryModel.description = null;
      this.categoryModel.name = null;
    }else {
      this.categoryModel = new CategoryModel();
    }
    this.submitted=false;
  }

  public onClickDelete(id) {
    let deleteCategory: CategoryModel;
    deleteCategory = _.find(this.categoryModelList, {id});
    this.categoryModel = deleteCategory;
    this.ngxSmartModalService.setModalData(deleteCategory.name, 'deleteConfirmationModal');
    this.ngxSmartModalService.getModal('deleteConfirmationModal').open();
    console.log(id);
  }

  onClickCancel() {
    if (this.disableElementOnDetailsView) {
      jQuery('#collapseCategoryForm').collapse('hide');
      setTimeout(() => {
        this.categoryModel = new CategoryModel();
        this.disableElementOnDetailsView = false;
      }, 500);
      return;
    }

    jQuery('#collapseCategoryForm').collapse('hide');
    this.categoryModel = new CategoryModel();
    this.isPageUpdateState = false;
    this.submitted=false;

  }

  private openCategoryCreateForm() {
    jQuery('#collapseCategoryForm').collapse('show');
    jQuery('html, body').animate({scrollTop: '0px'}, 500);
    jQuery("#collapseCategoryForm").scrollTop();
    this.isPageUpdateState = true;
    this.disableElementOnDetailsView=false;
  }

  private resetPage() {
    this.categoryModel = new CategoryModel();
    this.isPageUpdateState = false;
    this.getCategoryList(this.dataTablesCallBackParameters, this.dataTableCallbackFunction);
  }

  onClickDeleteOfModal(id) {
    this.categoryService.delete(id).subscribe(
      (responseMessage: ResponseMessage) => {
        this.toastr.success('Category', responseMessage.message);
        this.resetPage();
      },
      (httpErrorResponse: HttpErrorResponse) => {
        if (httpErrorResponse.error instanceof Error) {
          console.log("Client-side error occured.");
        } else {
          console.log("Server-side error occured.");
        }
      });
    this.ngxSmartModalService.getModal('deleteConfirmationModal').close();
  }

  private initializeReactiveFormValidation(){
    //========== form validation ==========
    this.categoryForm = this.formBuilder.group({
      name: ['',  Validators.compose([Validators.required, Validators.maxLength(20)])],
      description: ['', Validators.maxLength(100)]
    });
  }

}
