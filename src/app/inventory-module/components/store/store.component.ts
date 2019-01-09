import {AfterViewInit, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {NgxSmartModalService} from "ngx-smart-modal";
import {ToastrService} from "ngx-toastr";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DataTableRequest} from "../../../core/model/data-table-request";
import {ResponseMessage} from "../../../core/model/response-message";
import {HttpErrorResponse} from "@angular/common/http";
import {Util} from "../../../core/Util";
import {RequestMessage} from "../../../core/model/request-message";

import * as _ from 'lodash';
import * as HttpStatus from 'http-status-codes'
import {StoreService} from "../../service/store.service";
import {StoreModel} from "../../model/store-model";
import {HttpStatusCode} from "../../../core/constants/HttpStatusCode";

declare var jQuery: any;


@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss']
})
export class StoreComponent implements OnInit, AfterViewInit {


  public pageTitle:string="Store";

  public storeModel: StoreModel = new StoreModel();

  public entryForm: FormGroup;
  public formSubmitted:boolean=false;

  public dataTableOptions: DataTables.Settings = {};
  public storeModelList: Array<StoreModel> = new Array<StoreModel>();

  public isPageInUpdateState: boolean;
  public hideInputForm: boolean;
  public disablePageElementOnDetailsView: boolean;

  private dataTablesCallBackParameters: DataTableRequest;
  private dataTableCallbackFunction: any;


  constructor(private storeService: StoreService,
              private formBuilder: FormBuilder,
              private toastr: ToastrService,
              public  ngxSmartModalService: NgxSmartModalService,
              private cdRef : ChangeDetectorRef ) {
  }

  ngOnInit() {
    this.initializeReactiveFormValidation();
    this.initializedPageStateVariable();
    this.populateDataTable();
  }

  ngAfterViewInit() {
    Util.logConsole("ngAfterViewInit Called");
    this.storeModel = this.storeModel;
  }


  public onClickSubmit(){
    this.formSubmitted = true;

    if(this.isPageInUpdateState && !this.entryForm.invalid){
      this.updateProduct();
      return;
    }

    if(!this.isPageInUpdateState){
      if(this.entryForm.invalid){
        this.toastr.info("Please provide required form data",this.pageTitle);
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
      this.storeModel = new StoreModel();
    }else {
      editItemId = this.storeModel.id;
      this.storeModel = new StoreModel();
      this.storeModel.id=editItemId;
    }
  }

  public onClickCancel(){
    this.storeModel = new StoreModel();
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
          this.getStoreList(dataTablesParameters, callback);
        },
        columns:
          [
            {data:'name'},
            {data:'owner'},
            {data:'phoneNo'},
            {data:'email'},
            {data:'address'},
            {data:'comment'}
          ]
      };
  }

  private getStoreList(dataTablesParameters: DataTableRequest, callback: any):Array<StoreModel> {
    this.dataTablesCallBackParameters = dataTablesParameters;
    this.dataTableCallbackFunction = callback;

    const request= this.storeService.getList(dataTablesParameters).subscribe
    (
      (response: ResponseMessage) =>
      {
        if(response.httpStatus==HttpStatusCode.FOUND) {
          this.storeModelList = <Array<StoreModel>>response.data;
          callback({
            recordsTotal: response.dataTableResponse.recordsTotal,
            recordsFiltered: response.dataTableResponse.recordsTotal,
            data: []
          });
          return;
        }
      },

      (httpErrorResponse: HttpErrorResponse) =>
      {
        if (httpErrorResponse.error instanceof Error) {
          this.toastr.error('Data Table population ',this.pageTitle);
          Util.logConsole(httpErrorResponse,"Client-side error occurred.");
        } else {
          this.toastr.error('Please try again later',this.pageTitle);
          Util.logConsole(httpErrorResponse,"Client-side error occurred.");
        }
        request.unsubscribe();
        return;
      }
    );
    return this.storeModelList;
  }

  public onClickDetails(id){
    this.storeModel = _.find(this.storeModelList,{id});
    this.disablePageElementOnDetailsView=true;
    this.isPageInUpdateState=false;
    this.showEntryForm();
  }

  public onClickEdit(id){

    this.storeService.getById(id).subscribe
    (
      (responseMessage: ResponseMessage) =>
      {
        if(responseMessage.httpStatus==HttpStatus.OK) {
          this.storeModel = <StoreModel> responseMessage.data;
          return;
        }else {
          this.toastr.error('Failed to get requested '+ this.pageTitle, this.pageTitle);
          return;
        }
      },
      (httpErrorResponse: HttpErrorResponse) =>
      {
        this.toastr.error('Failed to get requested brand','Brand')
        if (httpErrorResponse.error instanceof Error) {
          console.log("Client-side error occurred.");
        } else {
          console.log("Server-side error occurred.");
        }
        return;
      }
    );

    this.disablePageElementOnDetailsView=false;
    this.isPageInUpdateState=true;
    this.showEntryForm();
  }

  public onClickDelete(id){
    let selectedDeleteModel: StoreModel;
    selectedDeleteModel = _.find(this.storeModelList, {id});
    this.storeModel = selectedDeleteModel;
    this.ngxSmartModalService.getModal('deleteConfirmationModal').open();
  }

  public onDeleteConfirm(id: string) {
    this.storeService.delete(id).subscribe
    (
      (responseMessage: ResponseMessage) =>
      {
        if(responseMessage.httpStatus==HttpStatus.OK) {
          this.toastr.success(responseMessage.message, this.pageTitle);
          this.resetPage();
          this.hideEntryForm();
          return;
        }else {
          this.toastr.error(responseMessage.message, this.pageTitle);
          return
        }
      },
      (httpErrorResponse: HttpErrorResponse) =>
      {
        this.toastr.error('Failed to delete '+this.pageTitle, this.pageTitle);
        if (httpErrorResponse.error instanceof Error) {
          console.log("Client-side error occurred.");
        } else {
          console.log("Server-side error occurred.");
        }
        return;
      }
    );
    return;
  }

  // ========== Data table button event =====================

  private saveProduct():void{
    let requestMessage: RequestMessage;
    requestMessage = Util.getRequestMessage(this.storeModel);
    this.storeService.save(requestMessage).subscribe
    (
      (responseMessage: ResponseMessage) =>
      {
        if(responseMessage.httpStatus==HttpStatus.CONFLICT) {
          this.toastr.info(responseMessage.message,this.pageTitle);
        }else if(responseMessage.httpStatus==HttpStatus.FAILED_DEPENDENCY){
          this.toastr.error(responseMessage.message,this.pageTitle);
        }else if(responseMessage.httpStatus== HttpStatus.CREATED) {
          this.toastr.success( responseMessage.message,this.pageTitle);
          this.storeModel = <StoreModel> responseMessage.data;
          this.getStoreList(this.dataTablesCallBackParameters, this.dataTableCallbackFunction);
          return;
        }else {
          this.toastr.error(responseMessage.message,this.pageTitle);
          return;
        }
      },

      (httpErrorResponse: HttpErrorResponse) =>
      {
        this.toastr.error('Failed to save Store',this.pageTitle);
        if (httpErrorResponse.error instanceof Error) {
          Util.logConsole(null,"Client-side error occurred.");
        } else {
          Util.logConsole(null,"Client-side error occurred.");
        }
        return;
      }
    );
    return;
  }

  private updateProduct():void{
    let requestMessage: RequestMessage;
    requestMessage = Util.getRequestMessage(this.storeModel);
    this.storeService.update(requestMessage).subscribe
    (
      (responseMessage: ResponseMessage) =>
      {
        if(responseMessage.httpStatus==HttpStatus.CONFLICT) {
          this.toastr.info(responseMessage.message,this.pageTitle);
          return;
        }else if(responseMessage.httpStatus== HttpStatus.OK) {
          this.toastr.success(responseMessage.message, this.pageTitle);
          this.resetPage();
          return;
        }else {
          this.toastr.error(responseMessage.message,this.pageTitle);
          return;
        }
      },

      (httpErrorResponse: HttpErrorResponse) =>
      {
        this.toastr.error('Failed to update Store',this.pageTitle);
        if (httpErrorResponse.error instanceof Error) {
          Util.logConsole(null,"Client-side error occurred.");
        } else {
          Util.logConsole(null,"Client-side error occurred.");
        }
      }
    );
  }

  private resetPage():void {
    this.storeModel = new StoreModel();
    this.isPageInUpdateState = false;
    this.formSubmitted=false;
    this.getStoreList(this.dataTablesCallBackParameters, this.dataTableCallbackFunction);
    return;
  }

  private initializedPageStateVariable():void{
    this.isPageInUpdateState = false;
    //this.hideInputForm = false;
    this.disablePageElementOnDetailsView = false;
    this.dataTablesCallBackParameters = new DataTableRequest();
    this.dataTablesCallBackParameters.start = 0;
    this.dataTablesCallBackParameters.length = 10;
  }

  private initializeReactiveFormValidation():void{
    //let notAllowedCharacter = "^[A-Za-z0-9_.]+$";
    //let notAllowedCharacter = "^[A-Za-z0-9-_. \\\\ \\/ - \\n]+$";
    this.entryForm = this.formBuilder.group({
      name:     ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
      owner:     ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
      phoneNo:  ['', Validators.compose([Validators.required, Validators.maxLength(20)])],
      email:    ['', Validators.compose([Validators.email, Validators.maxLength(50)])],
      address: ['', Validators.compose([Validators.required,Validators.maxLength(200)])],
      comment: ['', Validators.compose([Validators.maxLength(200)])]

      //address: ['', Validators.compose([Validators.maxLength(200), Validators.pattern(notAllowedCharacter)])],
      //description: ['', Validators.compose([Validators.maxLength(200), Validators.pattern(notAllowedCharacter)])]

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
