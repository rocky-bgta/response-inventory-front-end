import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {CustomObject} from "./interface/CustomObject";

@Injectable({ providedIn: 'root' })
export class MessageService {
  private subject = new Subject<any>();

  sendMessage(message: CustomObject) {
    this.subject.next(message);
  }

  clearMessage() {
    this.subject.next();
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }
}
