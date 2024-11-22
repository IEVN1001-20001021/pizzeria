import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../pedido.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-resumen-ventas',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './resumen-ventas.component.html',
  styles: [],
})
export class ResumenVentasComponent {
  diaSeleccionado: string = 'lunes'; // Día predeterminado
  ventasPorDia: any[] = []; // Ventas filtradas
  totalVentas: number = 0; // Total del día

  constructor(private pedidoService: PedidoService) {}

  obtenerVentas(dia: string): void {
    this.pedidoService.obtenerVentasPorDia(dia, (ventas) => {
      this.ventasPorDia = ventas;
      this.totalVentas = ventas.reduce((suma, venta) => suma + venta.total, 0);
    });
  }
} 
