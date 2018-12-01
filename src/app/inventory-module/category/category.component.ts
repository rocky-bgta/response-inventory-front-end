import {Component, OnInit} from '@angular/core';
import {CateogyModel} from "../model/cateogy-model";
import {CategoryService} from "../service/category.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {RequestMessage} from "../../core/model/request-message";
import {Util} from "../../core/Util";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {ResponseMessage} from "../../core/model/response-message";
import {ToastrService} from "ngx-toastr";
import {DataTableRequest} from "../../core/model/data-table-request";
import {InventoryApiEndPoint} from "../inventory-api-end-point";
import {DataTablesResponse} from "../../core/model/data-table-response";


class Person {
  id: number;
  firstName: string;
  lastName: string;
}


@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {

  public categoryModel: CateogyModel = new CateogyModel();

  private requestMessage: RequestMessage;

  public categoryForm: FormGroup;
  public submitted: boolean = false;

  constructor(private categoryService: CategoryService,
              private formBuilder: FormBuilder,
              private toastr: ToastrService,
              private http: HttpClient) {

  }

  // convenience getter for easy access to form fields
  get f() {
    return this.categoryForm.controls;
  }

  dtOptions: DataTables.Settings = {};
  categoryModelList: CateogyModel[];


  ngOnInit() {
    this.categoryForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.maxLength(200)]
    });


    const that = this;


    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: DataTableRequest, callback) => {
        this.categoryService.getList(InventoryApiEndPoint.category+"getAll",
          dataTablesParameters).subscribe((resp: DataTablesResponse) => {
          this.categoryModelList = resp.data;

          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: []
          });
        });
      },
      columns: [{data: 'id'}, {data: 'name'}, {data: 'description'}]
    };




   /* this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        that.http
          .post<any>(
            'https://angular-datatables-demo-server.herokuapp.com/',
            dataTablesParameters, {}
          ).subscribe((resp: any) => {
          that.persons = resp.data;

          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsFiltered,
            data: []
          });
        });
      },
      columns: [{data: 'id'}, {data: 'firstName'}, {data: 'lastName'},{data:'id'}]
    };*/


  }


  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.categoryForm.invalid) {
      return;
    }


    this.requestMessage = Util.getRequestObject(this.categoryModel);

    this.categoryService.save(this.requestMessage).subscribe(
      (responseMessage: ResponseMessage) => {
        this.toastr.success('Hello world!', 'Toastr fun!');
        this.categoryModel = <CateogyModel> responseMessage.data;
      },
      (httpErrorResponse: HttpErrorResponse) => {
        if (httpErrorResponse.error instanceof Error) {
          console.log("Client-side error occured.");
        } else {
          console.log("Server-side error occured.");
        }
      }
    );

    // alert('SUCCESS!! :-)\n\n' + JSON.stringify(this.categoryModel))
  }

}
