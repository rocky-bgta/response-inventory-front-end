import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'save-confirmation-modal',
  templateUrl: './save-confirmation-modal.component.html',
  styleUrls: ['./save-confirmation-modal.component.scss']
})
export class SaveConfirmationModalComponent implements OnInit {

  @Input() header:string;
  @Input() body:string;

  @Output() isConfirm = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

  onClickConfirmOfModal(){
    this.isConfirm.emit(true);
  }

}
