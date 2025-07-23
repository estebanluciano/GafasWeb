from binance.client import Client
# from flask import Flask, render_template, render_template_string
import time
from pybit.unified_trading import HTTP
from automatic_stop_loss import session

variacion = 5  # Variacion en los ultimos 30 minutos en porcentaje
variacion_100 = 7  # Variacion en los ultimos 30 minutos en porcentaje si tiene menos de 100k de volumen
variacionfast = 2  # Variacion en los ultimos 2 minutos en porcentaje


client = Client('','', tld='com')

def buscarticks():
    ticks = []
    lista_ticks = client.futures_symbol_ticker() # traer todas las monedas de futuros de binace
    print('Numero de monedas encontradas #' + str(len(lista_ticks)))
        
    for tick in lista_ticks:
        if tick['symbol'][-4:] != 'USDT': # seleccionar todas las monedas en el par USDT
            continue
        ticks.append(tick['symbol'])

    print('Numero de monedas encontradas en el par USDT: #' + str(len(ticks)))

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

    # obtener el capital inicial
    def obtener_capital():
        try:
            wallet = session.get_wallet_balance(accountType="UNIFIED")
            capital = float(wallet['result']['list'][0]['totalAvailableBalance'])
            return capital
        except Exception as e:
            print(f"Error al obtener el capital inicial: {e}, se usara por defecto 100 USDT!")
            return 100

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
                    "precio_min": info['lowPrice'],
                    "balance": obtener_capital()
                }
                print(f"Alerta LONG: {data}")
                return data

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
                    "precio_min": info['lowPrice'],
                    "balance": obtener_capital()
                }
                print(f"Alerta SHORT: {data}")
                return data

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
                    "tipo": "FAST SHORT",
                    "tick": tick,
                    "variacion": result,
                    "volumen": human_format(volumen),
                    "precio_max": info['highPrice'],
                    "precio_min": info['lowPrice'],
                    "balance": obtener_capital()
                }
                print(f"Alerta FAST SHORT: {data}")
                return data


# por si lo quiero hacer ejecutar despues
def obtener_datos():
    executions = 0  # Contador de ejecuciones
    
    while True:
        logs = []
        executions += 1
        logs.append('Ejecucion #' + str(executions))
        
        ticks = buscarticks()
        logs.append('Escaneando monedas...')
        
        for log in logs:
            yield log

        for tick in ticks:
            klines = get_klines(tick)
            knumber = len(klines)
            if knumber > 0:
                knumber = knumber - 1
                values = porcentaje_klines(tick, klines, knumber)
                if values:
                    yield(values)

        print('Esperando 30 segundos...')
        yield('Esperando 30 segundos...')
        print('')
        time.sleep(30)