from flask import Flask, render_template
from flask_socketio import SocketIO
from movement_alerts import obtener_datos
import threading

app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html')

# # Iniciar proceso que envía mensajes
# def background_thread():
#     for alerta in movement_alerts.obtener_datos():  # Este es un generador o bucle que emite alertas
#         socketio.emit('nueva_alerta', alerta)

# # Ejecutar hilo al iniciar la app
# @socketio.on('connect')
# def handle_connect():
#     print('Cliente conectado')
#     threading.Thread(target=background_thread).start()

# if __name__ == '__main__':
#     socketio.run(app, debug=True)

def emitir_alertas():
    for data in obtener_datos():
        if isinstance(data, dict) and 'tipo' in data:
            socketio.emit('alerta', data)
        elif isinstance(data, dict) and 'mensaje' in data:
            socketio.emit('mensaje', data)

if __name__ == '__main__':
    threading.Thread(target=emitir_alertas).start()
    socketio.run(app, debug=True)