import {RequestMessage} from "./model/request-message";
import {DataTableRequest} from "./model/data-table-request";

export class Util{

  public static getRequestObject(data:object, dataTableRequest?: DataTableRequest):RequestMessage{
    let requestMessage: RequestMessage = new RequestMessage();

    if(data!=null) {
      requestMessage.data = data;
      requestMessage.pageOffset = 0;
      requestMessage.pageSize = 0;
    }

    if(dataTableRequest!=null){
      requestMessage.dataTableRequest = dataTableRequest;
    }

    return requestMessage;

  }

  public static logConsole(data:any,message?:string) {
    if (message != null)
      console.log(message + ": " + JSON.stringify(data, null, 2));
    else console.log(JSON.stringify(data, null, 2));
  }

}
