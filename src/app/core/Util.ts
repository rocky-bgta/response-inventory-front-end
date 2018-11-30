import {RequestMessage} from "./model/request-message";

export class Util{

  public static getRequestObject(data:object):RequestMessage{
    let requestMessage: RequestMessage = new RequestMessage();
    requestMessage.data=data;
    requestMessage.pageOffset=0;
    requestMessage.pageSize=0;
    return requestMessage;

  }

}
