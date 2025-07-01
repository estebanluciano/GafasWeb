from binance.client import Client
from flask import Flask, render_template, render_template_string
import time

variacion = 5  # Variacion en los ultimos 30 minutos en porcentaje
variacion_100 = 7  # Variacion en los ultimos 30 minutos en porcentaje si tiene menos de 100k de volumen
variacionfast = 2  # Variacion en los ultimos 2 minutos en porcentaje
executions = 0  # Para que solo muestre usa sola vez los datos de buscarticks

client = Client('','', tld='com')

def buscarticks(yield_emisor):
    ticks = []
    lista_ticks = client.futures_symbol_ticker() # traer todas las monedas de futuros de binace
    print('Numero de monedas encontradas #' + str(len(lista_ticks)))
    # yield_emisor('Numero de monedas encontradas #' + str(len(lista_ticks)))
        
    for tick in lista_ticks:
        if tick['symbol'][-4:] != 'USDT': # seleccionar todas las monedas en el par USDT
            continue
        ticks.append(tick['symbol'])

    print('Numero de monedas encontradas en el par USDT: #' + str(len(ticks)))
    # yield_emisor('Numero de monedas encontradas en el par USDT: #' + str(len(ticks)))

    return ticks

def get_klines(tick):
    klines = client.futures_klines(symbol=tick, interval=Client.KLINE_INTERVAL_1MINUTE, limit=30)
    return klines

def infoticks(tick):
    info = client.futures_ticker(symbol=tick)
    return info

def human_format(volumen):
    magnitude = 0
    while abs(volumen) >= 1000:
        magnitude += 1
        volumen /= 1000.0
    return '%.2f%s' % (volumen, ['', 'K', 'M', 'G', 'T', 'P'][magnitude])

def porcentaje_klines(tick, klines, knumber):
    inicial = float(klines[0][4])
    final = float(klines[knumber][4])

    # LONG
    if inicial > final:
        result = round(((inicial - final) / inicial) * 100, 2)
        if result >= variacion:
            info = infoticks(tick)
            volumen = float(info['quoteVolume'])
            if volumen > 100000000 or result >= variacion_100:
                data = {
                    "tipo": "LONG",
                    "tick": tick,
                    "variacion": result,
                    "volumen": human_format(volumen),
                    "precio_max": info['highPrice'],
                    "precio_min": info['lowPrice']
                }
                html = render_template_string("""
                    <div class="alert alert-info">
                        <strong>Alerta de Movimiento:</strong> {{ data.tipo }} - {{ data.tick }}
                    </div>
                    <ul>
                        <li>Variación: {{ data.variacion }}%</li>
                        <li>Volumen: {{ data.volumen }}</li>
                        <li>Precio Máx: {{ data.precio_max }}</li>
                        <li>Precio Mín: {{ data.precio_min }}</li>
                    </ul>
                    <div class="card border-danger mb-3 shadow" style="max-width: 22rem;">
                        <div class="card-header bg-danger text-white fw-bold">
                            {{ data.tipo }} — {{ data.tick }}
                        </div>
                        <div class="card-body text-dark">
                            <h5 class="card-title mb-3">Variación: <span class="text-danger">{{ data.variacion }}%</span></h5>
                            <p class="card-text mb-2">
                                <strong>Volumen:</strong> <span class="text-dark">{{ data.volumen }}</span><br>
                                <strong>Precio máx:</strong> <span class="text-success">{{ data.precio_max }}</span><br>
                                <strong>Precio mín:</strong> <span class="text-danger">{{ data.precio_min }}</span>
                            </p>
                        </div>
                    </div>
                """, data=data)     
                return html

    # SHORT
    if final > inicial:
        result = round(((final - inicial) / inicial) * 100, 2)
        if result >= variacion:
            info = infoticks(tick)
            volumen = float(info['quoteVolume'])
            if volumen > 100000000 or result >= variacion_100:
                data = {
                    "tipo": "SHORT",
                    "tick": tick,
                    "variacion": result,
                    "volumen": human_format(volumen),
                    "precio_max": info['highPrice'],
                    "precio_min": info['lowPrice']
                }
                html = render_template_string("""
                    <div class="alert alert-info">
                        <strong>Alerta de Movimiento:</strong> {{ tipo }} - {{ tick }}
                    </div>
                    <ul>
                        <li>Variación: {{ variacion }}%</li>
                        <li>Volumen: {{ volumen }}</li>
                        <li>Precio Máx: {{ precio_max }}</li>
                        <li>Precio Mín: {{ precio_min }}</li>
                    </ul>
                    <div class="card border-danger mb-3 shadow" style="max-width: 22rem;">
                        <div class="card-header bg-danger text-white fw-bold">
                            {{ tipo }} — {{ tick }}
                        </div>
                        <div class="card-body text-dark">
                            <h5 class="card-title mb-3">Variación: <span class="text-danger">{{ variacion }}%</span></h5>
                            <p class="card-text mb-2">
                                <strong>Volumen:</strong> <span class="text-dark">{{ volumen }}</span><br>
                                <strong>Precio máx:</strong> <span class="text-success">{{ precio_max }}</span><br>
                                <strong>Precio mín:</strong> <span class="text-danger">{{ precio_min }}</span>
                            </p>
                        </div>
                    </div>
                """, **data)
                return html
                
    # FAST
    if knumber >= 3:
        inicial = float(klines[knumber-2][4])
        final = float(klines[knumber][4])
        if inicial < final:
            result = round(((final - inicial) / inicial) * 100, 2)
            if result >= variacionfast:
                info = infoticks(tick)
                volumen = float(info['quoteVolume'])
                data = {
                    "tipo": "FAST SHORT !!",
                    "tick": tick,
                    "variacion": result,
                    "volumen": human_format(volumen),
                    "precio_max": info['highPrice'],
                    "precio_min": info['lowPrice']
                }
                html = render_template_string("""
                    <div class="alert alert-info">
                        <strong>Alerta de Movimiento:</strong> {{ tipo }} - {{ tick }}
                    </div>
                    <ul>
                        <li>Variación: {{ variacion }}%</li>
                        <li>Volumen: {{ volumen }}</li>
                        <li>Precio Máx: {{ precio_max }}</li>
                        <li>Precio Mín: {{ precio_min }}</li>
                    </ul>
                    <div class="card border-danger mb-3 shadow" style="max-width: 22rem;">
                        <div class="card-header bg-danger text-white fw-bold">
                            {{ tipo }} — {{ tick }}
                        </div>
                        <div class="card-body text-dark">
                            <h5 class="card-title mb-3">Variación: <span class="text-danger">{{ variacion }}%</span></h5>
                            <p class="card-text mb-2">
                                <strong>Volumen:</strong> <span class="text-dark">{{ volumen }}</span><br>
                                <strong>Precio máx:</strong> <span class="text-success">{{ precio_max }}</span><br>
                                <strong>Precio mín:</strong> <span class="text-danger">{{ precio_min }}</span>
                            </p>
                        </div>
                    </div>
                """, **data)
                return html



# while True:
#     ticks = buscarticks()
#     print('Escaneando monedas...')
#     print('')
#     for tick in ticks:
#         klines = get_klines(tick)
#         knumber = len(klines)
#         if knumber > 0:
#             knumber = knumber - 1
#             values = porcentaje_klines(tick, klines, knumber)
#             print (values)
#     print('Esperando 30 segundos...')
#     print('')
#     time.sleep(30)


# por si lo quiero hacer ejecutar despues
def obtener_datos():
    
    def yield_emisor(alerta):
        yield_emisor.yielded.append(alerta)
    while True:
        yield_emisor.yielded = []
        # executions += 1
        # yield_emisor('Ejecucion #' + str(executions))
        ticks = buscarticks(yield_emisor)
        # for alerta in yield_emisor.yielded:
        #     yield alerta
        print('Escaneando monedas...')
        yield('Escaneando monedas...')
        for tick in ticks:
            klines = get_klines(tick)
            knumber = len(klines)
            if knumber > 0:
                knumber = knumber - 1
                values = porcentaje_klines(tick, klines, knumber)
                if values:
                    print(values)
                    yield(values)
        print('Esperando 30 segundos...')
        yield('Esperando 30 segundos...')
        print('')
        time.sleep(30)