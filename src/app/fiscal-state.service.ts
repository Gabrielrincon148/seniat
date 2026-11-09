import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FiscalStateService {
  private montoAutoSource = new Subject<number>();
  montoAuto$ = this.montoAutoSource.asObservable();

  // Método para enviar el monto a la calculadora
  setMontoCalculadora(monto: number) {
    this.montoAutoSource.next(monto);
  }
}