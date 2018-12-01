import {DataTablesResponse} from "./data-table-response";

export class ResponseMessage{
  token:string;
  data:object;
  httpStatus:string;
  message:string;
  totalRow:number;

  dataTableResponse: DataTablesResponse;
}
