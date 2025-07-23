import config
import time
from pybit.unified_trading import HTTP
from decimal import Decimal, ROUND_DOWN, ROUND_FLOOR

symbol = ''  # Puedes ajustar el símbolo según tus necesidades
estado = False
# capital = 100
# stop_loss = 10  # Valor en USDT

session = HTTP(
    testnet=False,
    api_key=config.api_key,
    api_secret=config.api_secret,
    recv_window=10000  # Aumenta el margen de error permitido
)

# Intentar obtener el capital inicial y establecer un stop loss
try:
    wallet = session.get_wallet_balance(accountType="UNIFIED")
    capital = float(wallet['result']['list'][0]['totalAvailableBalance'])
    stop_loss = capital * 0.10  # 10% del capital inicial
    print(f"Capital inicial obtenido: {capital} USDT")
    time.sleep(3)
except Exception as e:
    print(f"Error al obtener el capital inicial: {e}, se usara por defecto 100 USDT y 10 USDT de stop loss!")
    capital = 100
    stop_loss = 10
    time.sleep(1)


def qty_step(symbol, price):
    step = session.get_instruments_info(category="linear", symbol=symbol)
    ticksize = float(step['result']['list'][0]['priceFilter']['tickSize'])
    scala_precio = int(step['result']['list'][0]['priceScale'])
    precision = Decimal(f"{10**scala_precio}")
    tickdec = Decimal(f"{ticksize}")
    precio_final = (Decimal(f"{price}")*precision)/precision
    precide = precio_final.quantize(Decimal(f"{1/precision}"),rounding=ROUND_FLOOR)
    operaciondec = (precide / tickdec).quantize(Decimal('1'), rounding=ROUND_FLOOR) * tickdec
    result = float(operaciondec)

    return result


def establecer_stop_loss(symbol, price):
    price = qty_step(symbol, price)
    print(price)

    # PONER ORDEN STOP LOSS
    order = session.set_trading_stop(
        category="linear",
        symbol=symbol,
        stopLoss=price,
        slTriggerB="LastPrice",
        positionIdx=0,
    )

    return order


# Lógica del bot (ejemplo simple: compra y venta cada 60 segundos)
def colocar_orden_SL(tick, stop):
    balance = session.get_wallet_balance(accountType="UNIFIED")
    print(f"Saldo disponible: {float(balance['result']['list'][0]['totalAvailableBalance'])}")
    try:
        print('INICIANDO PROCESO DE STOP LOSS AUTOMATICO')
        if estado:
            # Posiciones Abiertas
            posiciones = session.get_positions(category="linear", symbol=symbol)
            if float(posiciones['result']['list'][0]['size']) != 0:
                precio_de_entrada = float(posiciones['result']['list'][0]['avgPrice'])
                USDT = float(posiciones['result']['list'][0]['positionValue'])
                porcentaje = (stop_loss * 100) / USDT
                aumento = precio_de_entrada * (porcentaje / 100)
                if posiciones['result']['list'][0]['side'] == 'Buy':
                    stop_price = precio_de_entrada - aumento
                else:
                    stop_price = precio_de_entrada + aumento
                if stop_price < 0:
                    print('TU STOP LOSS NO ES POSIBLE, SE ENCUENTRA POR DEBAJO DE CERO')
                else:
                    # poner stop loss
                    if USDT != capital:
                        print('MODIFICANDO STOP LOSS')
                        establecer_stop_loss(symbol, stop_price)
                        capital = USDT
            else:
                session.cancel_all_orders(category="linear", symbol=symbol)
                estado = False
                capital = 0

        else:
            # tick = input('INGRESE EL TICK QUE DESEA OPERAR: ').upper()
            # dato tomado del propio def
            if tick != '':
                tick = tick + 'USDT'
                symbol = tick
                # stop = float(input('INGRESE EL VALOR MAXIMO EN USDT QUE DESEA PERDER: '))
                # mismo caso anterior dato tomado del def
                if stop != '':
                    stop_loss = stop
                    # Posiciones Abiertas
                    posiciones = session.get_positions(category="linear", symbol=symbol)
                    if float(posiciones['result']['list'][0]['size']) != 0:
                        print('POSICION ABIERTA EN ' + symbol)
                        estado = True

                    else:
                        print('NO HAY NINGUNA POSICION ABIERTA EN ' + symbol)
                else:
                    print('EL DATO INGRESADO NO ES VALIDO')
            else:
                print('EL DATO INGRESADO NO ES VALIDO')

    except Exception as e:
        print(f"Error: {e}")
        stop_loss = 0
        estado = False
        capital = 0
        time.sleep(5)
    time.sleep(1)
