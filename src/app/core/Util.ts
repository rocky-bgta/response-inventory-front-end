import {RequestMessage} from "./model/request-message";
import {DataTableRequest} from "./model/data-table-request";
import {HttpErrorResponse} from "@angular/common/http";
import {ToastrService} from "ngx-toastr";

export class Util{

  public static toasterService:ToastrService;
  constructor(private toastr: ToastrService,){
    Util.toasterService = toastr;
  }
  public static getRequestMessage(data?:object, dataTableRequest?: DataTableRequest):RequestMessage{
    let requestMessage: RequestMessage = new RequestMessage();

    if(data!=null) {
      requestMessage.data = data;
    }

    if(dataTableRequest!=null){
      requestMessage.dataTableRequest = dataTableRequest;
    }

    requestMessage.pageOffset = 0;
    requestMessage.pageSize = 0;

    return requestMessage;
  }

  public static logConsole(data:any,message?:string) {
    if (message != null)
      console.log(message + ": " + JSON.stringify(data, null, 2));
    else console.log(JSON.stringify(data, null, 2));
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
}
