import {Component, OnInit} from '@angular/core';
import {NavigationEnd, NavigationStart, Router, RouterEvent} from "@angular/router";
import {NgxSpinnerService} from "ngx-spinner";

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

    collapedSideBar: boolean;

    ngOnInit() {}

    receiveCollapsed($event) {
        this.collapedSideBar = $event;
    }

  showPageLoader:boolean=false;
  constructor(private _router:Router, private ngxSpinnerService: NgxSpinnerService) {
    this._router.events.subscribe((routerEvent:RouterEvent)=>{

      if(routerEvent instanceof NavigationStart){
        this.showPageLoader=true;
        this.ngxSpinnerService.show();
      }

      if(routerEvent instanceof NavigationEnd){
        this.showPageLoader=false;
        this.ngxSpinnerService.hide();
      }
    })
  }
}
