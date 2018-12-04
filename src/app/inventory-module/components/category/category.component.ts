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

declare var jQuery: any;

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {

  public categoryModel: CategoryModel = new CategoryModel();
  public categoryForm: FormGroup;

  constructor(private categoryService: CategoryService,
              private formBuilder: FormBuilder,
              private toastr: ToastrService) {

  }


  // convenience getter for easy access to form fields
  get f() {
    return this.categoryForm.controls;
  }

  dtOptions: DataTables.Settings = {};
  public categoryModelList:Array<CategoryModel> =new Array();

  private dataTablesCallBackParameters: DataTableRequest;
  private dataTableCallbackFunction:any;

  public isPageUpdateState:boolean;
  public hideCategoryInputForm:boolean;

  ngOnInit() {

    //========== Page data initialization ============
    this.isPageUpdateState = false;
    this.hideCategoryInputForm=false;
    this.dataTablesCallBackParameters = new DataTableRequest();
    this.dataTablesCallBackParameters.start=0;
    this.dataTablesCallBackParameters.length=10;

    //Jquery("#collapseCategoryForm").collapse();
    //Jquery("#collapseCategoryForm").collapsing();
    //Jquery("#collapseCategoryForm").show();


    //$('.panel-title a').bind('mouseover focus',function(){
    //});


    //========== form validation ==========
    this.categoryForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.maxLength(200)]
    });

    //========== DataTable option start ===========
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: false,
      searching:  false,
      ajax: (dataTablesParameters: DataTableRequest, callback) => {
        this.getCategoryList(dataTablesParameters,callback);
      },
      columns: [{data: 'id'}, {data: 'name'}, {data: 'description'}]
    };
    //========== DataTable option end ==============

  }

  private getCategoryList(dataTablesParameters: DataTableRequest, callback:any){
   this.dataTablesCallBackParameters=dataTablesParameters;
   this.dataTableCallbackFunction=callback;

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

    let requestMessage: RequestMessage;

    if(this.isPageUpdateState==true && !this.categoryForm.invalid){
      this.updateCategory();
      return;
    }

    if(this.isPageUpdateState==false) {
      // stop here if form is invalid
      if (this.categoryForm.invalid) {
        return;
      }

      requestMessage = Util.getRequestObject(this.categoryModel);

      this.categoryService.save(requestMessage).subscribe(
        (responseMessage: ResponseMessage) => {
          this.toastr.success('Category', responseMessage.message);
          this.categoryModel = <CategoryModel> responseMessage.data;
          this.getCategoryList(this.dataTablesCallBackParameters, this.dataTableCallbackFunction);
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


  public onClickEdit(id){
     this.categoryService.getById(id).subscribe(
       (responseMessage:ResponseMessage)=>{
         this.categoryModel = <CategoryModel> responseMessage.data;
         this.openCategoryCreateForm();
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

  private updateCategory(){
    let requestMessage:RequestMessage;
    requestMessage = Util.getRequestObject(this.categoryModel);
    this.categoryService.update(requestMessage).subscribe(
      (responseMessage:ResponseMessage)=>{
        this.toastr.success('Category', responseMessage.message);
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

  public onClickDelete(id){
    console.log(id);
  }

  onClickCancel(){

    if(_.isEmpty(this.categoryModel.name)
        &&_.isEmpty(this.categoryModel.description)
        && !this.isPageUpdateState) {
      jQuery('#addCategoryBtn').trigger('click');
      return;
    }



    if(this.isPageUpdateState &&
      (_.isEmpty(this.categoryModel.name) &&_.isEmpty(this.categoryModel.description))) {

      this.isPageUpdateState=false;
      this.categoryModel = new CategoryModel();
      jQuery('#addCategoryBtn').trigger('click');
      return;
    }

    this.categoryModel.name=null;
    this.categoryModel.description=null;



   /*

    //this.categoryModel=new CategoryModel();
    if(this.isPageUpdateState && !_.isEmpty(this.categoryModel)){
      this.categoryModel.name="";
      this.categoryModel.description="";
    }else if(_.isEmpty(this.categoryModel)) {
      jQuery('#addCategoryBtn').trigger('click');
    }else {
      this.categoryModel = new CategoryModel();
      this.isPageUpdateState = false;
    }
    */


    //    this.hideCategoryInputForm=true;
   /* if(this.isPageUpdateState)
      jQuery('#createCategory').trigger('click');*/
    //jQuery('.collapse').collapse();

  }

  private openCategoryCreateForm(){
    //Jquery('#createCategory').trigger('click');
    jQuery("#collapseCategoryForm").show();
    jQuery('html, body').animate({scrollTop: '0px'}, 500);
    jQuery("#collapseCategoryForm").scrollTop();
    this.isPageUpdateState = true;
  }

  private resetPage(){
    this.categoryModel=new CategoryModel();
    this.isPageUpdateState = false;
    //Jquery("#collapseCategoryForm").hide();
    this.getCategoryList(this.dataTablesCallBackParameters, this.dataTableCallbackFunction);
  }
}
