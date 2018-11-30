import {Component, OnInit} from '@angular/core';
import {NavigationEnd, NavigationStart, Router, RouterEvent} from "@angular/router";

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
  constructor(private _router:Router) {
    this._router.events.subscribe((routerEvent:RouterEvent)=>{

      if(routerEvent instanceof NavigationStart){
        this.showPageLoader=true;
      }

      if(routerEvent instanceof NavigationEnd){
        this.showPageLoader=false;
      }
    })
  }
}
