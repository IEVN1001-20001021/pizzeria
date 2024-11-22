from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# Configuración de conexión a la base de datos
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'pizzeria_db'
}

@app.route('/terminar-pedido', methods=['POST'])
def terminar_pedido():
    try:
        data = request.json  # Recibir datos como JSON
        if not data:
            return jsonify({'status': 'error', 'message': 'No se proporcionaron datos'}), 400
        
        cliente = data.get('cliente')
        if not cliente:
            return jsonify({'status': 'error', 'message': 'El campo "cliente" es obligatorio'}), 400
        
        # Extraer datos del cliente
        nombre = cliente.get('nombre')
        direccion = cliente.get('direccion')
        telefono = cliente.get('telefono')
        if not all([nombre, direccion, telefono]):
            return jsonify({'status': 'error', 'message': 'Faltan datos del cliente'}), 400

        # Conectar a la base de datos
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Insertar cliente o encontrar su ID
        cursor.execute("""
            INSERT INTO clientes (nombre, direccion, telefono)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id);
        """, (nombre, direccion, telefono))
        cliente_id = cursor.lastrowid

        # Insertar ticket
        total = data.get('total')
        fecha = data.get('fecha')  # Formato YYYY-MM-DD
        dia_semana = data.get('dia_semana')
        cursor.execute("""
            INSERT INTO tickets (cliente_id, fecha, dia_semana, total)
            VALUES (%s, %s, %s, %s);
        """, (cliente_id, fecha, dia_semana, total))
        ticket_id = cursor.lastrowid

        # Insertar detalles del pedido
        detalles = data.get('detalles', [])
        for detalle in detalles:
            pizza = detalle.get('pizza')
            ingredientes = ', '.join(detalle.get('ingredientes', []))
            cantidad = detalle.get('cantidad')
            subtotal = detalle.get('subtotal')
            cursor.execute("""
                INSERT INTO detalles_pedido (ticket_id, pizza, ingredientes, cantidad, subtotal)
                VALUES (%s, %s, %s, %s, %s);
            """, (ticket_id, pizza, ingredientes, cantidad, subtotal))

        conn.commit()
        return jsonify({'status': 'success', 'message': 'Pedido guardado correctamente'}), 200

    except mysql.connector.Error as err:
        return jsonify({'status': 'error', 'message': str(err)}), 500
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
            
@app.route('/ventas-por-dia', methods=['GET'])
def ventas_por_dia():
    dia = request.args.get('dia')
    if not dia:
        return jsonify({'status': 'error', 'message': 'El parámetro "dia" es obligatorio'}), 400

    try:
        # Conectar a la base de datos
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        # Consultar tickets por día
        cursor.execute("""
            SELECT t.id AS ticket_id, c.nombre AS nombreCliente, t.total
            FROM tickets t
            JOIN clientes c ON t.cliente_id = c.id
            WHERE t.dia_semana = %s;
        """, (dia,))
        resultados = cursor.fetchall()

        return jsonify(resultados), 200

    except mysql.connector.Error as err:
        return jsonify({'status': 'error', 'message': str(err)}), 500
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()    

if __name__ == '__main__':
    app.run(debug=True)
