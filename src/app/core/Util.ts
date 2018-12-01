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

}
