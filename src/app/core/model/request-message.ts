import {DataTableRequest} from "./data-table-request";

export class RequestMessage{
  token:string;
  data:object;
  list:object;
  pageOffset:number;
  pageSize:number;

  dataTableRequest: DataTableRequest;
}
