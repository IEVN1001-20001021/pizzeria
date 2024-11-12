import { Component, OnInit } from '@angular/core';
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
export class ResumenVentasComponent implements OnInit {
  ventasPorDia: { ticketId: string; nombreCliente: string; total: number }[] =
    [];
  totalVentas: number = 0;
  diaSeleccionado: string = '';

  constructor(private pedidoService: PedidoService) {}

  ngOnInit(): void {}

  /* // Validar el día ingresado por el usuario
  validarDia(): void {
    const diaNormalizado = this.normalizarDia(this.diaSeleccionado);
    if (diaNormalizado) {
      this.diaSeleccionado = diaNormalizado;
    }
  }

  // Normaliza el texto ingresado para que coincida con un día de la semana
  normalizarDia(dia: string): string | null {
    const dias = {
      lunes: ['lunes', 'lunez', 'luns'],
      martes: ['martes', 'martes', 'marte', 'martez'],
      miercoles: ['miercoles', 'miercoles', 'miercole', 'miercolez'],
      jueves: ['jueves', 'jueves', 'juevez'],
      viernes: ['viernes', 'viernes', 'vierne', 'viernex'],
      sabado: ['sabado', 'sabado', 'sabao', 'sabao'],
      domingo: ['domingo', 'domingo', 'doming', 'domingz']
    };

    for (const [diaCorrecto, variantes] of Object.entries(dias)) {
      if (
        variantes.some((variacion) => dia.toLowerCase().includes(variacion))
      ) {
        return diaCorrecto;
      }
    }

    return null; // Si no se encuentra coincidencia, no se normaliza
  } */

  obtenerVentas(dia: string): void {
    this.ventasPorDia = this.pedidoService.obtenerVentasPorDia(dia);
    this.totalVentas = this.ventasPorDia.reduce(
      (total, venta) => total + venta.total,
      0
    );
  }
}
