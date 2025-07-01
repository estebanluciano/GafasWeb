from flask import Flask, render_template
from flask_socketio import SocketIO
import threading
import movement_alerts

app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html')

# Iniciar proceso que envía mensajes
def background_thread():
    for alerta in movement_alerts.obtener_datos():  # Este es un generador o bucle que emite alertas
        socketio.emit('nueva_alerta', alerta)

# Ejecutar hilo al iniciar la app
@socketio.on('connect')
def handle_connect():
    print('Cliente conectado')
    threading.Thread(target=background_thread).start()

if __name__ == '__main__':
    socketio.run(app, debug=True)
