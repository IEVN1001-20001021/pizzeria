import { Component } from '@angular/core';
import { FormControl,FormBuilder } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ResumenVentasComponent } from "./componentes/resumen-ventas/resumen-ventas.component";
import { TablaPedidosComponent } from "./componentes/tabla-pedidos/tabla-pedidos.component";
import { FormVentaComponent } from "./componentes/form-venta/form-venta.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ResumenVentasComponent,
    TablaPedidosComponent,
    FormVentaComponent
],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
}