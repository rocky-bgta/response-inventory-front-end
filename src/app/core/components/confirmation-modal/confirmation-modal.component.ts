import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent implements OnInit {

  @Input() deleteObjectType: string;
  @Input() deletedObjectName: string;
  @Input() id: string;


  @Output() deleteProductId = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

  onClickDeleteOfModal(){
    this.deleteProductId.emit(this.id);
  }

}
