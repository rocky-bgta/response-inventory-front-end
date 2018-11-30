import {Component, OnInit} from '@angular/core';
import {CateogyModel} from "../model/cateogy-model";
import {CategoryService} from "../service/category.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {RequestMessage} from "../../core/model/request-message";
import {Util} from "../../core/Util";
import {HttpErrorResponse} from "@angular/common/http";
import {ResponseMessage} from "../../core/model/response-message";
import {ToastrService} from "ngx-toastr";

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
              private toastr: ToastrService)
  {

  }

  // convenience getter for easy access to form fields
  get f() {
    return this.categoryForm.controls;
  }


  ngOnInit() {
    this.categoryForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.maxLength(200)]
    })
  }

  save() {

  }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.categoryForm.invalid) {
      return;
    }


    this.requestMessage = Util.getRequestObject(this.categoryModel);

    this.categoryService.save(this.requestMessage).subscribe(
      (responseMessage:ResponseMessage) => {
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
