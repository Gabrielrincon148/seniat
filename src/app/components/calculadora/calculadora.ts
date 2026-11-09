import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FiscalStateService } from '../../fiscal-state.service'; // Ajusta la ruta si es necesario

interface HistorialCalculo {
  monto: number;
  impuesto: number;
  detalle: string;
  fecha: Date;
}

@Component({
  selector: 'app-calculadora',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calculadora.html',
  styleUrl: './calculadora.css'
})
export class Calculadora implements OnInit, OnDestroy {
  montoIngreso: number | null = null;
  impuestoEstimado: number | null = null;
  detalleCalculo: string = '';

  // Arreglo para almacenar el historial de simulaciones
  historialSimulaciones: HistorialCalculo[] = [];
  private sub!: Subscription;

  constructor(private fiscalState: FiscalStateService) {}

  ngOnInit() {
    // Nos suscribimos al servicio para recibir el monto automáticamente desde el chat
    this.sub = this.fiscalState.montoAuto$.subscribe(monto => {
      this.montoIngreso = monto;
      this.calcularImpuesto(); // Dispara el cálculo automático al recibir el dato
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  // Métodos calculados para el Resumen Ejecutivo
  get totalSimulaciones(): number {
    return this.historialSimulaciones.length;
  }

  get impuestoPromedio(): number {
    if (this.totalSimulaciones === 0) return 0;
    const suma = this.historialSimulaciones.reduce((acc, curr) => acc + curr.impuesto, 0);
    return suma / this.totalSimulaciones;
  }

  calcularImpuesto() {
    if (this.montoIngreso !== null && this.montoIngreso > 0) {
      const ut = this.montoIngreso; 
      let impuesto = 0;

      if (ut <= 1000) {
        impuesto = ut * 0.06;
        this.detalleCalculo = 'Primer tramo (6%)';
      } else if (ut <= 1500) {
        impuesto = 1000 * 0.06 + (ut - 1000) * 0.09;
        this.detalleCalculo = 'Segundo tramo (9%)';
      } else if (ut <= 2000) {
        impuesto = 1000 * 0.06 + 500 * 0.09 + (ut - 1500) * 0.12;
        this.detalleCalculo = 'Tercer tramo (12%)';
      } else if (ut <= 2500) {
        impuesto = 1000 * 0.06 + 500 * 0.09 + 500 * 0.12 + (ut - 2000) * 0.16;
        this.detalleCalculo = 'Cuarto tramo (16%)';
      } else if (ut <= 3000) {
        impuesto = 1000 * 0.06 + 500 * 0.09 + 500 * 0.12 + 500 * 0.16 + (ut - 2500) * 0.20;
        this.detalleCalculo = 'Quinto tramo (20%)';
      } else if (ut <= 4000) {
        impuesto = 1000 * 0.06 + 500 * 0.09 + 500 * 0.12 + 500 * 0.16 + 500 * 0.20 + (ut - 3000) * 0.24;
        this.detalleCalculo = 'Sexto tramo (24%)';
      } else if (ut <= 6000) {
        impuesto = 1000 * 0.06 + 500 * 0.09 + 500 * 0.12 + 500 * 0.16 + 500 * 0.20 + 1000 * 0.24 + (ut - 4000) * 0.29;
        this.detalleCalculo = 'Séptimo tramo (29%)';
      } else {
        impuesto = 1000 * 0.06 + 500 * 0.09 + 500 * 0.12 + 500 * 0.16 + 500 * 0.20 + 1000 * 0.24 + 2000 * 0.29 + (ut - 6000) * 0.34;
        this.detalleCalculo = 'Octavo tramo (34%)';
      }

      this.impuestoEstimado = impuesto;

      this.historialSimulaciones.unshift({
        monto: ut,
        impuesto: impuesto,
        detalle: this.detalleCalculo,
        fecha: new Date()
      });

    } else {
      this.impuestoEstimado = null;
      this.detalleCalculo = '';
    }
  }

  limpiarHistorial() {
    this.historialSimulaciones = [];
  }
}