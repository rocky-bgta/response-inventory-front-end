import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DataTableRequest} from "../../../core/model/data-table-request";
import {CustomerPaymentModel} from "../../model/customer-payment-model";
import {NgxSmartModalService} from "ngx-smart-modal";
import {ToastrService} from "ngx-toastr";
import {CustomerPaymentService} from "../../service/customer-payment.service";
import {ResponseMessage} from "../../../core/model/response-message";
import {HttpErrorResponse} from "@angular/common/http";
import {HttpStatusCode} from "../../../core/constants/HttpStatusCode";
import {RequestMessage} from "../../../core/model/request-message";
import {Util} from "../../../core/Util";

import * as _ from 'lodash';
declare var jQuery: any;

@Component({
  selector: 'app-customer-payment',
  templateUrl: './customer-payment.component.html',
  styleUrls: ['./customer-payment.component.scss']
})
export class CustomerPaymentComponent implements OnInit {


  public pageTitle:string="Customer Payment";

  public customerPaymentModel: CustomerPaymentModel = new CustomerPaymentModel();

  public entryForm: FormGroup;
  public formSubmitted:boolean=false;

  public dataTableOptions: DataTables.Settings = {};
  public customerPaymentModelList: Array<CustomerPaymentModel> = new Array<CustomerPaymentModel>();

  public isPageInUpdateState: boolean;
  public hideInputForm: boolean;
  //public disablePageElementOnDetailsView: boolean;

  private dataTablesCallBackParameters: DataTableRequest;
  private dataTableCallbackFunction: any;

  //======= save modal text ======================================
  public modalHeader: string;
  public modalBodyText: string;// = "You are about to confirm Payment";
  //======= save modal text ======================================



  constructor(private customerPaymentService: CustomerPaymentService,
              private formBuilder: FormBuilder,
              private toaster: ToastrService,
              public  ngxSmartModalService: NgxSmartModalService) {
  }

  ngOnInit() {
    this.initializeReactiveFormValidation();
    this.initializedPageStateVariable();
    this.populateDataTable();
  }

  public onClickPayment(id){
    this.customerPaymentModel = _.clone(_.find(this.customerPaymentModelList,{id}));
    //this.customerPaymentModel.paidAmount=null;
    this.customerPaymentModel.paymentDate = new Date();
    //this.disablePageElementOnDetailsView=true;
    //this.isPageInUpdateState=false;
    this.showEntryForm();
  }

  public onClickCancel(){
    this.resetPage();
  }

  public onFocusOutCurrentPayment(currentPayment: number) {
    let dueAmount: number;
    dueAmount = this.customerPaymentModel.dueAmount;
    if (currentPayment > dueAmount) {
      this.customerPaymentModel.currentPayment = dueAmount;
    }
  }

  public onClickClickConfirmPayment(){
    this.formSubmitted = true;

    if(!this.entryForm.invalid){
      this.setModelForSave();
      //this.updateCustomerPayment();
      return;
    }else {
      this.toaster.info("Please provide required form data",this.pageTitle);
    }
  }

  private setModelForSave() {
    this.modalHeader=this.pageTitle;
    this.modalBodyText = "Your about pay due amount " +this.customerPaymentModel.currentPayment+ " Taka";
    this.ngxSmartModalService.getModal('saveConfirmationModal').open();
  }

  public onClickSaveConfirmationOfModal(isConfirm: boolean) {
    if (isConfirm) {
      this.updateCustomerPayment();
    }
  }

  private updateCustomerPayment():void{
    let requestMessage: RequestMessage;
    //this.replaceCharacterFromModelField();
    requestMessage = Util.getRequestMessage(this.customerPaymentModel);
    //requestMessage = Util.getRequestMessage(this.vendorModel);

    this.customerPaymentService.update(requestMessage).subscribe
    (
      (responseMessage: ResponseMessage) =>
      {
        if(responseMessage.httpStatus==HttpStatusCode.CONFLICT) {
          this.toaster.info(responseMessage.message,this.pageTitle);
          return;
        }else if(responseMessage.httpStatus==HttpStatusCode.OK){
          this.toaster.success(responseMessage.message, this.pageTitle);
          this.resetPage();
          this.getCustomerPaymentList(this.dataTablesCallBackParameters, this.dataTableCallbackFunction);
          return;
        }else {
          this.toaster.error(responseMessage.message,this.pageTitle);
          return;
        }
      },

      (httpErrorResponse: HttpErrorResponse) =>
      {
        this.toaster.error('Failed to update brand',this.pageTitle);
        if (httpErrorResponse.error instanceof Error) {
          Util.logConsole(null,"Client-side error occurred.");
        } else {
          Util.logConsole(null,"Client-side error occurred.");
        }
      }
    );
  }

  private resetPage():void {
    this.customerPaymentModel = new CustomerPaymentModel();
    //this.isPageInUpdateState = false;
    this.formSubmitted=false;
    this.hideEntryForm();
    return;
  }



  private getCustomerPaymentList(dataTablesParameters: DataTableRequest, callback: any):Array<CustomerPaymentModel> {
    this.dataTablesCallBackParameters = dataTablesParameters;
    this.dataTableCallbackFunction = callback;

    this.customerPaymentService.getList(dataTablesParameters).subscribe
    (
      (response: ResponseMessage) =>
      {
        if(response.httpStatus==HttpStatusCode.FOUND) {
          this.customerPaymentModelList = <Array<CustomerPaymentModel>>response.data;
          callback({
            recordsTotal: response.dataTableResponse.recordsTotal,
            recordsFiltered: response.dataTableResponse.recordsTotal,
            data: []
          });
          return;
        }else if(response.httpStatus == HttpStatusCode.NOT_FOUND){
          this.customerPaymentModelList.splice(0,this.customerPaymentModelList.length);
          //this.customerPaymentModelList = <Array<CustomerPaymentModel>>response.data;
          //this.toaster.error(response.message,this.pageTitle);
          return;
        }else {
          return;
        }
      },

      (httpErrorResponse: HttpErrorResponse) =>
      {
        if (httpErrorResponse.error instanceof Error) {
          this.toaster.error('Datatable population ',this.pageTitle);
          Util.logConsole(httpErrorResponse,"Client-side error occurred.");
        } else {
          this.toaster.error('Please try again later',this.pageTitle);
          Util.logConsole(httpErrorResponse,"Client-side error occurred.");
        }
        return;
      }
    );
    return this.customerPaymentModelList;
  }

  private populateDataTable():void{

    this.dataTableOptions =
      {
        pagingType: 'full_numbers',
        pageLength: 10,
        serverSide: true,
        processing: false,
        searching: true,
        ajax: (dataTablesParameters: DataTableRequest, callback) => {
          this.getCustomerPaymentList(dataTablesParameters, callback);
        },
        columns: [
          {data: 'invoiceNo'},
          {data: 'customerName'},
          {data: 'grandTotal'},
          {data: 'paidAmount'},
          {data: 'dueAmount'},
          {data: 'invoiceDate'}
          ]
      };
  }

  private initializedPageStateVariable():void{
    //this.isPageInUpdateState = false;
    this.hideInputForm = false;
    //this.disablePageElementOnDetailsView = false;
    this.dataTablesCallBackParameters = new DataTableRequest();
    this.dataTablesCallBackParameters.start = 0;
    this.dataTablesCallBackParameters.length = 10;
  }

  private initializeReactiveFormValidation():void{
    //let notAllowedCharacter = "^[A-Za-z0-9_.]+$";
    //let notAllowedCharacter = "^[A-Za-z0-9-_. \\\\ \\/ - \\n]+$";
    let decimalNumberValidationRexPattern = "^(\\d*\\.)?\\d+$";
    this.entryForm = this.formBuilder.group({
      customerName:  [''],
      invoiceNo:     [''],
      paidAmount:  ['', Validators.compose([Validators.required,
        Validators.pattern(decimalNumberValidationRexPattern)])],
      dueAmount:  [''],
      grandTotal:  [''],
      paymentDate:    ['', Validators.compose([Validators.required])],
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
        //this.disablePageElementOnDetailsView = false;
      }, 500
    );
    return;
  }
}
