import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  private pedidosSubject = new BehaviorSubject<any[]>([]);
  pedidos$ = this.pedidosSubject.asObservable();

  private preciosPizza: { [key: string]: number } = {
    Chica: 40,
    Mediana: 80,
    Grande: 120,
  };

  private preciosIngredientes: { [key: string]: number } = {
    jamon: 10,
    pina: 10,
    champinones: 10,
  };

  constructor() {
    this.pedidosSubject.next([]);
  }

  private obtenerPedidos(): any[] {
    return JSON.parse(localStorage.getItem('pedidos') || '[]');
  }

  /* FormPedidos */
  agregarPedido(nuevoPedido: any): void {
    const pedidos = this.pedidosSubject.value;
    const pedidoExistente = pedidos.find(
      (pedido) =>
        pedido.name === nuevoPedido.name &&
        pedido.direccion === nuevoPedido.direccion &&
        pedido.pizzaSize === nuevoPedido.pizzaSize &&
        JSON.stringify(pedido.ingredientes.sort()) ===
          JSON.stringify(nuevoPedido.ingredientes.sort())
    );

    const precioPizza = this.preciosPizza[nuevoPedido.pizzaSize];
    const precioIngredientes = nuevoPedido.ingredientes.reduce(
      (total: number, ingrediente: string) =>
        total + this.preciosIngredientes[ingrediente],
      0
    );

    const precioIndividualPizza = precioPizza + precioIngredientes;
    const pedidoConPrecio = {
      ...nuevoPedido,
      precio: precioIndividualPizza * nuevoPedido.cantidad,
      cantidad: nuevoPedido.cantidad,
    };

    if (pedidoExistente) {
      pedidoExistente.cantidad += nuevoPedido.cantidad;
      pedidoExistente.precio += precioIndividualPizza * nuevoPedido.cantidad;
    } else {
      pedidos.push(pedidoConPrecio);
    }

    this.pedidosSubject.next(pedidos);
  }

  /* TablaPedidos */
  terminarPedido(): void {
    const pedidos = this.pedidosSubject.value;
    const total = pedidos.reduce((sum, pedido) => sum + pedido.precio, 0);
    if (
      confirm(`El costo total es: $${total}. ¿Está de acuerdo con el pedido?`)
    ) {
      const fecha = new Date(pedidos[0].fecha);
      const fechaUTC = new Date(
        fecha.getTime() + fecha.getTimezoneOffset() * 60000
      );
      const diasSemana = [
        'domingo',
        'lunes',
        'martes',
        'miércoles',
        'jueves',
        'viernes',
        'sábado',
      ];
      const diaSemana = diasSemana[fechaUTC.getUTCDay()];

      const detallesPedido = pedidos.map((pedido) => ({
        cliente: pedido.name,
        direccion: pedido.direccion,
        telefono: pedido.telefono,
        pizza: pedido.pizzaSize,
        ingredientes: pedido.ingredientes.join(', '),
        cantidad: pedido.cantidad,
        subtotal: pedido.precio,
        fecha: pedido.fecha,
      }));
      const pedidoCompleto = {
        pedidos: detallesPedido,
        total: total,
        fecha: pedidos[0].fecha,
        diaSemana: diaSemana,
      };
      const pedidosGuardados = JSON.parse(
        localStorage.getItem('pedidos') || '[]'
      );
      pedidosGuardados.push(pedidoCompleto);
      localStorage.setItem('pedidos', JSON.stringify(pedidosGuardados));
      this.pedidosSubject.next([]);
    }
  }

  eliminarPedido(pedido: any): void {
    const pedidos = this.pedidosSubject.value.filter((p) => p !== pedido);
    this.pedidosSubject.next(pedidos);
  }

  /* ResumenVentas */
  obtenerVentasPorDia(dia: string): any[] {
    const pedidos = this.obtenerPedidos();
    const pedidosPorDia = pedidos.filter(
      (pedidos) => pedidos.diaSemana === dia
    );

    const ventasPorDia = pedidosPorDia.map((pedido, index) => ({
      ticketId: `Ticket ${index + 1}`,
      nombreCliente: pedido.pedidos[0].cliente,
      total: pedido.total,
    }));
    return ventasPorDia;
  }
}