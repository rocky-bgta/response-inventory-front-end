import { Component, OnInit } from '@angular/core';
import {BrandModel} from "../../model/brand-model";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DataTableRequest} from "../../../core/model/data-table-request";
import {BrandService} from "../../service/brand.service";
import {ToastrService} from "ngx-toastr";
import {NgxSmartModalService} from "ngx-smart-modal";
import {RequestMessage} from "../../../core/model/request-message";
import {Util} from "../../../core/Util";
import {ResponseMessage} from "../../../core/model/response-message";
import {HttpErrorResponse} from "@angular/common/http";

import * as HttpStatus from 'http-status-codes'
import * as _ from 'lodash';
declare var jQuery: any;


@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.scss']
})
export class BrandComponent implements OnInit {

  public brandModel: BrandModel = new BrandModel();

  public entryForm: FormGroup;
  public formSubmitted:boolean=false;

  public dataTableOptions: DataTables.Settings = {};
  public brandModelList: Array<BrandModel> = new Array();

  public isPageInUpdateState: boolean;
  public hideInputForm: boolean;
  public disablePageElementOnDetailsView: boolean;

  private dataTablesCallBackParameters: DataTableRequest;
  private dataTableCallbackFunction: any;

  //====== value pass to delete confirmation modal
  public deleteObjectType:string='Brand';

  constructor(private brandService: BrandService,
              private formBuilder: FormBuilder,
              private toastr: ToastrService,
              public ngxSmartModalService: NgxSmartModalService) {
    }

  ngOnInit() {
    this.initializeReactiveFormValidation();
    this.initializedPageStateVariable();
    this.populateDataTable();
  }

  public onClickSubmit(){
    this.formSubmitted = true;

    if(this.isPageInUpdateState && !this.entryForm.invalid){
      this.updateProduct();
      return;
    }

    if(!this.isPageInUpdateState){
      if(this.entryForm.invalid){
        this.toastr.info("Please provide required form data","Category");
        return;
      }
    }
    //======== now we safely save entry form data
    this.saveProduct();
    return;
  }

  public onClickReset(){
    let editItemId:string;
    if(!this.isPageInUpdateState){
      this.brandModel = new BrandModel();
    }else {
      editItemId = this.brandModel.id;
      this.brandModel = new BrandModel();
      this.brandModel.id=editItemId;
    }
  }

  public onClickCancel(){
      this.brandModel = new BrandModel();
      this.isPageInUpdateState=false;
      this.disablePageElementOnDetailsView=false;
      this.hideEntryForm();
  }

  // ========== Data table button event =====================

  private populateDataTable():void{

    this.dataTableOptions =
      {
        pagingType: 'full_numbers',
        pageLength: 10,
        serverSide: true,
        processing: false,
        searching: true,
        ajax: (dataTablesParameters: DataTableRequest, callback) => {
          this.getBrandList(dataTablesParameters, callback);
        },
        columns: [{data: 'name'}, {data: 'description'}]
    };
  }

  private getBrandList(dataTablesParameters: DataTableRequest, callback: any):Array<BrandModel> {
    this.dataTablesCallBackParameters = dataTablesParameters;
    this.dataTableCallbackFunction = callback;

    this.brandService.getList(dataTablesParameters).subscribe
    (
      (response: ResponseMessage) =>
                {
                  this.brandModelList = <Array<BrandModel>>response.data;
                  callback({
                    recordsTotal: response.dataTableResponse.recordsTotal,
                    recordsFiltered: response.dataTableResponse.recordsTotal,
                    data: []
                  });
                },

      (httpErrorResponse: HttpErrorResponse) =>
                {
                  if (httpErrorResponse.error instanceof Error) {
                    this.toastr.error('Datatable population ','Error')
                    Util.logConsole(httpErrorResponse,"Client-side error occurred.");
                  } else {
                    this.toastr.error('Please try again later','Error')
                    Util.logConsole(httpErrorResponse,"Client-side error occurred.");
                  }
                }
    );

    return this.brandModelList;
  }

  public onClickDetails(id){
   this.brandModel = _.find(this.brandModelList,{id});
   this.disablePageElementOnDetailsView=true;
   this.isPageInUpdateState=false;
   this.showEntryForm();
  }

  public onClickEdit(id){

    this.brandService.getById(id).subscribe
    (
(responseMessage: ResponseMessage) =>
        {
          this.brandModel = <BrandModel> responseMessage.data;
        },
(httpErrorResponse: HttpErrorResponse) =>
        {
          this.toastr.error('Failed to get requested brand','Brand')
          if (httpErrorResponse.error instanceof Error) {
            console.log("Client-side error occurred.");
          } else {
            console.log("Server-side error occurred.");
          }
        }
    );

    this.disablePageElementOnDetailsView=false;
    this.isPageInUpdateState=true;
    this.showEntryForm();
  }

  public onClickDelete(id){
    let deleteBrandModel: BrandModel;
    deleteBrandModel = _.find(this.brandModelList, {id});
    this.brandModel = deleteBrandModel;
    this.ngxSmartModalService.getModal('deleteConfirmationModal').open();
  }

  public onDeleteConfirm(id: string) {
    this.brandService.delete(id).subscribe
    (
(responseMessage: ResponseMessage) =>
        {
          this.toastr.success(responseMessage.message,'Brand');
          this.resetPage();
          this.hideEntryForm();
        },
(httpErrorResponse: HttpErrorResponse) =>
        {
          this.toastr.error('Failed to delete brand','Brand');
          if (httpErrorResponse.error instanceof Error) {
            console.log("Client-side error occurred.");
          } else {
            console.log("Server-side error occurred.");
          }
        }
    );
    return;
  }

  // ========== Data table button event =====================

  private saveProduct():void{
    let requestMessage: RequestMessage;
    requestMessage = Util.getRequestMessage(this.brandModel);
    this.brandService.save(requestMessage).subscribe
    (
(responseMessage: ResponseMessage) =>
        {
          if(responseMessage.httpStatus==HttpStatus.CREATED) {
            this.toastr.success( responseMessage.message,'Brand');
            this.brandModel = <BrandModel> responseMessage.data;
            this.getBrandList(this.dataTablesCallBackParameters, this.dataTableCallbackFunction);
          }else {
            this.toastr.error(responseMessage.message,'Brand');
          }
        },

(httpErrorResponse: HttpErrorResponse) =>
        {
          this.toastr.error('Failed to save brand','Brand');
          if (httpErrorResponse.error instanceof Error) {
            Util.logConsole(null,"Client-side error occurred.");
          } else {
            Util.logConsole(null,"Client-side error occurred.");
          }
        }
    );
    return;
  }

  private updateProduct():void{
    let requestMessage: RequestMessage;
    requestMessage = Util.getRequestMessage(this.brandModel);

    this.brandService.update(requestMessage).subscribe
    (
(responseMessage: ResponseMessage) =>
        {
          this.toastr.success(responseMessage.message,'Brand');
          this.resetPage();
        },

(httpErrorResponse: HttpErrorResponse) =>
        {
          this.toastr.error('Failed to update brand','Brand');
          if (httpErrorResponse.error instanceof Error) {
            Util.logConsole(null,"Client-side error occurred.");
          } else {
            Util.logConsole(null,"Client-side error occurred.");
          }
        }
    );
  }

  private resetPage():void {
    this.brandModel = new BrandModel();
    this.isPageInUpdateState = false;
    this.formSubmitted=false;
    this.getBrandList(this.dataTablesCallBackParameters, this.dataTableCallbackFunction);
    return;
  }

  private initializedPageStateVariable():void{
    this.isPageInUpdateState = false;
    this.hideInputForm = false;
    this.disablePageElementOnDetailsView = false;
    this.dataTablesCallBackParameters = new DataTableRequest();
    this.dataTablesCallBackParameters.start = 0;
    this.dataTablesCallBackParameters.length = 10;
  }

  private initializeReactiveFormValidation():void{
    this.entryForm = this.formBuilder.group({
      name: ['',  Validators.compose([Validators.required, Validators.maxLength(20)])],
      description: ['', Validators.maxLength(100)]
    });
  }

  private showEntryForm():void{
    jQuery('#collapseInputForm').collapse('show');
    jQuery('html, body').animate({scrollTop: '0px'}, 500);
    jQuery("#collapseInputForm").scrollTop();
  }

  private hideEntryForm():void{
      jQuery('#collapseInputForm').collapse('hide');
      setTimeout
      (
        () =>
          {
            this.disablePageElementOnDetailsView = false;
          }, 500
      );
      return;
  }

}
