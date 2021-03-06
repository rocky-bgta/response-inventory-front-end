import {Component, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {LoaderState} from './loader.model';
import {LoaderService} from "./loader.service";
import {NgxSpinnerService} from "ngx-spinner";

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit {

  show = false;

  private subscription: Subscription;

  constructor(private loaderService: LoaderService, private ngxSpinnerService: NgxSpinnerService) { }

  ngOnInit() {
    this.subscription = this.loaderService.loaderState
      .subscribe((state: LoaderState) => {
        this.show = state.show;

       /*
        if(this.show==true)
          this.ngxSpinnerService.show();
        if(this.show==false)
          this.ngxSpinnerService.hide();

        */
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
