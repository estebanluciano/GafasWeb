### Movement Alerts (Alertas de Movimiento)

Este script fue desarrollado para detectar movimientos del mercado de criptomonedas en futuros de binance, con este script usted podra tener en vivo y en directo una alerta cuando un crypto activo este teniendo un movimiento inusal tanto al alza o la baja.

**Como usar el script**
- Descargar python [Aqui](https://www.python.org/ "Aqui")
- Descargar y modificar el Archivo, lo puedes modificar con sublime text, o cualquier otro editor de codigo bajo lso parametros que tu quieras.
```python
variacion = 5  # Variacion en los ultimos 30 minutos en porcentaje
variacion_100 = 7  # Variacion en los ultimos 30 minutos en porcentaje si tiene menos de 100k de volumen
variacionfast = 2  # Variacion en los ultimos 2 minutos en porcentaje
```
- Antes de ejecutar el Script deberas instalar la libreria de Python de Binance `pip install python-binance`
- Una vez guardado el archivo debes ejecutarlo desde una terminal de windows o de tu sistema operativo que uses con el siguiente comando.
`python script.py`

#### ----------------------------------------------------------------------------------

### Stop Loss Automatico para Futuros de BYBIT

El Script fue desarrollado para proteger las operaciones en futuros de Bybit, solo debes de poner la moneda que deseas operar donde ya tengas una posicion abierta, ejemplo (btc), y luego poner en monto maximo a perder en dolares, ejemplo (10)

**NOTA: Este script es solo para los pares USDT**

**Como usar el script**
- Descargar python [Aqui](https://www.python.org/ "Aqui")
- Descargar y modificar el Archivo config.py, el archivo lo puedes modificar con sublime text, el cual puedes descargar [Aqui](https://www.sublimetext.com/ "Aqui"), o modificarlo con el block de notas.
- Agrega la API KEY y la API SECRET
- Para obtener tu API KEY y API SECRET debes ingresar [Aqui](https://partner.bybit.com/b/GafasTrading "Aqui")
```python
api_key = ''
api_secret = ''
```
- Antes de ejecutar el Script deberas instalar la libreria de Python de BYBIT `pip install pybit`
- Una vez guardado el archivo debes ejecutarlo desde una terminal de windows o de tu sistema operativo que uses con el siguiente comando.
`python script.py`

**NOTA: Para que funcione bien no debes estar en modo Cobertura**

#### Contact
- Twitter: [https://twitter.com/ElGafasTrading](https://twitter.com/ElGafasTrading "https://twitter.com/ElGafasTrading")
- Instagram: [https://www.instagram.com/elgafastrading/](https://www.instagram.com/elgafastrading/ "https://www.instagram.com/elgafastrading/")
- Youtube: [https://www.youtube.com/@ElGafasTrading](https://www.youtube.com/@ElGafasTrading "https://www.youtube.com/@ElGafasTrading")
