import {DataTablesResponse} from "./data-table-response";

export class ResponseMessage{
  token:string;
  data:object;
  httpStatus:number;
  message:string;
  totalRow:number;

  dataTableResponse: DataTablesResponse;
}
