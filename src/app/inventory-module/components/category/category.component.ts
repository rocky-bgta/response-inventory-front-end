import {Component, OnInit} from '@angular/core';
import {CateogyModel} from "../../model/cateogy-model";
import {CategoryService} from "../../service/category.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {RequestMessage} from "../../../core/model/request-message";
import {Util} from "../../../core/Util";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {ResponseMessage} from "../../../core/model/response-message";
import {ToastrService} from "ngx-toastr";
import {DataTableRequest} from "../../../core/model/data-table-request";
import * as Jquery from 'jquery';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {

  public categoryModel: CateogyModel = new CateogyModel();

  private requestMessage: RequestMessage;

  public categoryForm: FormGroup;
  public submitted: boolean = false;

  constructor(private categoryService: CategoryService,
              private formBuilder: FormBuilder,
              private toastr: ToastrService,
              private http: HttpClient) {

  }


  // convenience getter for easy access to form fields
  get f() {
    return this.categoryForm.controls;
  }

  dtOptions: DataTables.Settings = {};
  public categoryModelList:Array<CateogyModel> =new Array();

  private dataTablesCallBackParameters: DataTableRequest;
  private dataTableCallbackFunction:any;


  ngOnInit() {



    //Jquery("#collapseCategoryForm").collapse();
    //Jquery("#collapseCategoryForm").collapsing();
    //Jquery("#collapseCategoryForm").show();


    //$('.panel-title a').bind('mouseover focus',function(){
    //});



    this.categoryForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.maxLength(200)]
    });


    //const that = this;


    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching:  false,
      ajax: (dataTablesParameters: DataTableRequest, callback) => {

        this.getCategoryList(dataTablesParameters,callback);

      },
      columns: [{data: 'id'}, {data: 'name'}, {data: 'description'}]
    };
  }

  private getCategoryList(dataTablesParameters: DataTableRequest, callback:any){
   this.dataTablesCallBackParameters=dataTablesParameters;
   this.dataTableCallbackFunction=callback;

    this.categoryService.getList(dataTablesParameters)
      .subscribe((resp: ResponseMessage) => {
      this.categoryModelList = resp.dataTableResponse.data;

      callback({
        recordsTotal: resp.dataTableResponse.recordsTotal,
        recordsFiltered: resp.dataTableResponse.recordsTotal,
        data: []
      });
    });
  }



  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.categoryForm.invalid) {
      return;
    }

    this.requestMessage = Util.getRequestObject(this.categoryModel);

    this.categoryService.save(this.requestMessage).subscribe(
      (responseMessage: ResponseMessage) => {
        this.toastr.success('Category', responseMessage.message);
        this.categoryModel = <CateogyModel> responseMessage.data;
        this.getCategoryList(this.dataTablesCallBackParameters,this.dataTableCallbackFunction);
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


  public onClickEdit(id){
     this.categoryService.getById(id).subscribe(
       (responseMessage:ResponseMessage)=>{
         //this.toastr.success('Category', responseMessage.message);
         this.categoryModel = <CateogyModel> responseMessage.data;
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

  public onClickDelete(id){
    console.log(id);
  }

  private openCategoryCreateForm(){
    //Jquery('#createCategory').trigger('click');
    Jquery("#collapseCategoryForm").show();
  }
}
