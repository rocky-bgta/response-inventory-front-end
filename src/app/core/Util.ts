import {RequestMessage} from "./model/request-message";
import {DataTableRequest} from "./model/data-table-request";
import {HttpErrorResponse} from "@angular/common/http";
import {ToastrService} from "ngx-toastr";
import * as _ from 'lodash';

declare var jQuery: any;

export class Util{

  public static toasterService:ToastrService;
  constructor(private toastr: ToastrService,){
    Util.toasterService = toastr;
  }
  public static getRequestMessage(data?:object, givenDataTableRequest?: DataTableRequest):RequestMessage{
    let requestMessage: RequestMessage = new RequestMessage();

    if(data!=null) {
      requestMessage.data = data;
    }

    if(givenDataTableRequest!=null){
      requestMessage.dataTableRequest = givenDataTableRequest;
    }

    requestMessage.pageOffset = 0;
    requestMessage.pageSize = 0;

    return requestMessage;
  }

  public static logConsole(data?:any,message?:string) {
    if(!_.isObject(data)){
      console.info(data)
      return;
      //console.log("Normal %cStyled %clorem %cipsum", "color: blue; font-weight: bold", "color: red", "background-image: linear-gradient(red, blue); color: white; padding: 5px;");
    }
    if(jQuery.isEmptyObject(data) && (typeof message === "string")) {
      console.log(message);
      return
    }
    if (message != null && data!=null) {
      console.log(message + ": " + JSON.stringify(data, null, 2));
      return;
    }
    if(data==null && message!=null) {
      console.error(message);
      return;
    }
    if(data!=null) {
      console.log(data);
      return;
    }
    return;
  }

  public static errorHandler(httpErrorResponse: HttpErrorResponse){
    if (httpErrorResponse.error instanceof Error) {
      this.toasterService.success('Error', "Client-side error occured.");
      //console.log("Client-side error occured.");
    } else {
      this.toasterService.success('Error', "Server-side error occured.");
      //console.log("Server-side error occured.");
    }
  }

 /* static getStartDateFromYearMonth(year: number, month: number) {
    let temDate = new Date(year, month - 1, 1);
    let formatDate = moment(temDate).format('YYYY-MM-DD');
    let buildDate = new Date(formatDate);
    return buildDate;
  }

  static getEndDateFromYearMonth(year: number, month: number) {
    let temDate;
    temDate = new Date(year, month, 0);
    let formatDate = moment(temDate).format('YYYY-MM-DD');
    let buildDate = new Date(formatDate);
    return buildDate;
  }*/


/*

  static getDate(year: number = null, month: number = null, day: number = null) {
    let temDate, dateFromat = null;

    if (year != null && month != null && day != null)
      temDate = new Date(year, month, day);
    else
      temDate = new Date();

    dateFromat = 'YYYY-MM-DD';

    let formatDate = moment(temDate).format(dateFromat);
    let buildDate = new Date(formatDate);
    return buildDate;
  }
*/

/*
  static getKeyValueFromEnum(providedEnum: any) {
    let buildKeyValuePair: ICustomType = {};
    let i: number = 1;
    let enumProperties: any[] = new Array<any>();
    for (let enumMember in providedEnum) {
      let isValueProperty = parseInt(enumMember, 10) >= 0;
      if (isValueProperty) {
        buildKeyValuePair = new Object();
        buildKeyValuePair.key = i;
        buildKeyValuePair.value = providedEnum[enumMember];
        enumProperties.push(buildKeyValuePair);
        i++;
      }
    }
    return enumProperties;
  }

  */
  public static getBase64Image(event:any){
    const file = event.target.files[0];
    if (file) {
      const reader:FileReader = new FileReader();
      reader.onload = Util.handleReaderLoaded.bind(this);
      reader.readAsBinaryString(file);
    }
  }

  private static handleReaderLoaded(e) {
    let base64Image:string="";
    base64Image+= btoa(e.target.result);
    //Util.logConsole(base64Image);
    //base64Image = btoa(e.target.result);
    //his.base64textString.push('data:image/png;base64,' + btoa(e.target.result));
    //return base64Image.trim();
  }

  public static getInvoiceNo():string{
    let invoiceNo:string;
    let date = new Date();
    let timestamp = date.getTime();
    invoiceNo = "INV-"+timestamp;
    return invoiceNo;
  }

  public static isNullOrUndefined(value):boolean{
    let isNullOrUndefined:boolean;
    if(value===undefined || value==null){
      isNullOrUndefined = true;
    }else {
      isNullOrUndefined = false;
    }
     return isNullOrUndefined;
  }

}
