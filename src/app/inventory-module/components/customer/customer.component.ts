import { Component, OnInit } from '@angular/core';
import {CustomerModel} from "../../model/customer-model";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DataTableRequest} from "../../../core/model/data-table-request";
import {NgxSmartModalService} from "ngx-smart-modal";
import {ToastrService} from "ngx-toastr";
import {CustomerService} from "../../service/customer.service";
import {ResponseMessage} from "../../../core/model/response-message";
import {HttpErrorResponse} from "@angular/common/http";
import {Util} from "../../../core/Util";
import {RequestMessage} from "../../../core/model/request-message";
import {CustomObject} from "../../../core/interface/CustomObject";

declare var jQuery: any;
import * as _ from 'lodash';
import * as HttpStatus from 'http-status-codes'
import {HttpStatusCode} from "../../../core/constants/HttpStatusCode";


@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements OnInit {

  public pageTitle:string="Customer";

  public customerModel: CustomerModel = new CustomerModel();
  public entryFromModel: CustomObject = <CustomerModel> this.customerModel;

  public entryForm: FormGroup;
  public formSubmitted:boolean=false;

  public dataTableOptions: DataTables.Settings = {};
  public customerModelList: Array<CustomerModel> = new Array<CustomerModel>();

  public isPageInUpdateState: boolean;
  public hideInputForm: boolean;
  public disablePageElementOnDetailsView: boolean;

  private dataTablesCallBackParameters: DataTableRequest;
  private dataTableCallbackFunction: any;

  constructor(private customerService: CustomerService,
              private formBuilder: FormBuilder,
              private toastr: ToastrService,
              public  ngxSmartModalService: NgxSmartModalService) {
  }

  ngOnInit() {
    this.initializeReactiveFormValidation();
    this.initializedPageStateVariable();
    this.populateDataTable();
  }

  public onClickSubmit(){
    this.formSubmitted = true;

    if(this.isPageInUpdateState && !this.entryForm.invalid){
      this.updateCustomer();
      return;
    }

    if(!this.isPageInUpdateState){
      if(this.entryForm.invalid){
        this.toastr.info("Please provide required form data",this.pageTitle);
        return;
      }
    }
    //======== now we safely save entry form data
    this.saveCustomer();
    return;
  }

  public onClickReset(){
    let editItemId:string;
    if(!this.isPageInUpdateState){
      this.customerModel = new CustomerModel();
    }else {
      editItemId = this.customerModel.id;
      this.customerModel = new CustomerModel();
      this.customerModel.id=editItemId;
    }
  }

  public onClickCancel(){
    this.customerModel = new CustomerModel();
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
          this.getCustomerList(dataTablesParameters, callback);
        },
        columns: [
          {data:'name'},
          {data:'phoneNo1'},
          {data:'phoneNo2'},
          {data:'email'},
          {data:'address'},
          {data:'activity'},
          {data:'comment'}
          ]
      };
  }

  private getCustomerList(dataTablesParameters: DataTableRequest, callback: any):Array<CustomerModel> {
    this.dataTablesCallBackParameters = dataTablesParameters;
    this.dataTableCallbackFunction = callback;

    this.customerService.getList(dataTablesParameters).subscribe
    (
      (response: ResponseMessage) =>
      {
        if(response.httpStatus==HttpStatusCode.FOUND) {
          this.customerModelList = <Array<CustomerModel>>response.data;
          //Util.logConsole(this.customerModelList,"get Customer Model: ");
          callback({
            recordsTotal: response.dataTableResponse.recordsTotal,
            recordsFiltered: response.dataTableResponse.recordsTotal,
            data: []
          });
          return;
        }else if(response.httpStatus == HttpStatusCode.NOT_FOUND){
          this.toastr.info(response.message,this.pageTitle);
          return;
        }else {
          this.toastr.error(response.message,this.pageTitle);
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
        return;
      }
    );
    return this.customerModelList;
  }

  public onClickDetails(id){
    this.customerModel = _.find(this.customerModelList,{id});
    this.disablePageElementOnDetailsView=true;
    this.isPageInUpdateState=false;
    this.showEntryForm();
  }

  public onClickEdit(id){

    this.customerService.getById(id).subscribe
    (
      (responseMessage: ResponseMessage) =>
      {
        if(responseMessage.httpStatus==HttpStatus.OK) {
          this.customerModel = <CustomerModel> responseMessage.data;
          return;
        }else {
          this.toastr.error('Failed to get requested '+ this.pageTitle, this.pageTitle);
          return;
        }
      },
      (httpErrorResponse: HttpErrorResponse) =>
      {
        this.toastr.error('Failed to get requested brand',this.pageTitle)
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
    let selectedDeleteModel: CustomerModel;
    selectedDeleteModel = _.find(this.customerModelList, {id});
    this.customerModel = selectedDeleteModel;
    this.ngxSmartModalService.getModal('deleteConfirmationModal').open();
  }

  public onDeleteConfirm(id: string) {
    this.customerService.delete(id).subscribe
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


  private saveCustomer():void{
    let requestMessage: RequestMessage;
    //this.replaceCharacterFromModelField();
    requestMessage = Util.getRequestMessage(this.customerModel);
    this.customerService.save(requestMessage).subscribe
    (
      (responseMessage: ResponseMessage) =>
      {
        if(responseMessage.httpStatus== HttpStatus.CONFLICT) {
          this.toastr.info(responseMessage.message, this.pageTitle);
        }else if(responseMessage.httpStatus==HttpStatus.FAILED_DEPENDENCY) {
          this.toastr.error(responseMessage.message,this.pageTitle);
        }else if(responseMessage.httpStatus==HttpStatus.CREATED){
          this.toastr.success( responseMessage.message,this.pageTitle);
          this.customerModel = <CustomerModel> responseMessage.data;
          this.getCustomerList(this.dataTablesCallBackParameters, this.dataTableCallbackFunction);
          return;
        }else {
          this.toastr.error(responseMessage.message,this.pageTitle);
          return;
        }
      },

      (httpErrorResponse: HttpErrorResponse) =>
      {
        this.toastr.error('Failed to save' + this.pageTitle,this.pageTitle);
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

  private updateCustomer():void{
    let requestMessage: RequestMessage;
    //this.replaceCharacterFromModelField();
    requestMessage = Util.getRequestMessage(this.customerModel);
    //requestMessage = Util.getRequestMessage(this.vendorModel);

    this.customerService.update(requestMessage).subscribe
    (
      (responseMessage: ResponseMessage) =>
      {
        if(responseMessage.httpStatus==HttpStatus.CONFLICT) {
          this.toastr.info(responseMessage.message,this.pageTitle);
          return;
        }else if(responseMessage.httpStatus==HttpStatus.OK){
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
        this.toastr.error('Failed to update '+this.pageTitle,this.pageTitle);
        if (httpErrorResponse.error instanceof Error) {
          Util.logConsole(null,"Client-side error occurred.");
        } else {
          Util.logConsole(null,"Client-side error occurred.");
        }
      }
    );
  }

  private resetPage():void {
    this.customerModel = new CustomerModel();
    this.isPageInUpdateState = false;
    this.formSubmitted=false;
    this.getCustomerList(this.dataTablesCallBackParameters, this.dataTableCallbackFunction);
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
    //let notAllowedCharacter = "^[A-Za-z0-9_.]+$";
    //let notAllowedCharacter = "^[A-Za-z0-9-_. \\\\ \\/ - \\n]+$";
    this.entryForm = this.formBuilder.group({
      name:     ['',  Validators.compose([Validators.required, Validators.maxLength(50)])],
      phoneNo1: ['',  Validators.compose([Validators.required, Validators.maxLength(20)])],
      phoneNo2: ['',  Validators.compose([Validators.maxLength(20)])],
      email:    ['',  Validators.compose([Validators.email, Validators.maxLength(50)])],
      address:  ['',  Validators.compose([Validators.maxLength(200)])],
      activity: ['',  Validators.compose([Validators.min(1), Validators.max(5)])],
      comment:  ['',  Validators.compose([Validators.maxLength(200)])]

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
