from flask import Flask, render_template
from flask_socketio import SocketIO
from movement_alerts import obtener_datos
from automatic_stop_loss import colocar_orden_SL
import os
import webbrowser
# import threading

# Sincronizar hora con w32tm desde Python
import subprocess

def sync_windows_time():
    try:
        # Inicia el servicio de hora de Windows
        subprocess.run("net start w32time", shell=True, check=False)

        # Sincroniza con el servidor NTP configurado
        subprocess.run("w32tm /resync", shell=True, check=True)
        print("✅ Hora sincronizada con el servidor NTP")
    except subprocess.CalledProcessError as e:
        print("❌ Error al sincronizar hora:", e)

sync_windows_time()


app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html')

# # Iniciar proceso que envía mensajes
def emitir_alertas():
    for data in obtener_datos():
        if isinstance(data, dict) and 'tipo' in data:
            socketio.emit('alerta', data)
        else:
            socketio.emit('mensaje', data)
            print(f"Mensaje enviado: {data}")

        # elif isinstance(data, dict) and 'mensaje' in data:
        #     socketio.emit('mensaje', data)

@socketio.on('colocar_orden_SL')
def procesar_orden(data):
    tick = data.get('ticker', '').upper()
    stop_loss = data.get('amount', 0)
    print(f"Datos recibidos para colocar orden de stop loss: {tick} - {stop_loss} ")
    if tick and int(stop_loss) > 0:
        # Aquí se llamaría a la función que maneja el stop loss
        print(f"Colocando orden de stop loss para {tick} con un límite de {stop_loss} USDT")
        colocar_orden_SL(tick, stop_loss)

    else:
        print("Datos insuficientes para colocar la orden de stop loss.")


if __name__ == '__main__':
    # Sólo arrancar el thread en el proceso que hace el trabajo real
    # if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
    #     threading.Thread(target=emitir_alertas, daemon=True).start()
    # socketio.run(app, debug=True)

    # En lugar de crear tu propio threading.Thread, usá el helper de SocketIO para tareas en background, que se integra mejor con el loop:
    if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
        socketio.start_background_task(emitir_alertas)
        webbrowser.open('http://127.0.0.1:5000')
    socketio.run(app, debug=True)