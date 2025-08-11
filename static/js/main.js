// --- Lógica para el Dashboard Dinámico (sin cambios) ---
let contador = 0;

function isJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

const socket = io();
let alertasActivas = false;

// Botón para activar sonido
document.getElementById('activarSonido').addEventListener('click', () => {
    alertasActivas = true;
    document.getElementById('activarSonido').disabled = true;
    document.getElementById('activarSonido').textContent = "✅ Alertas activadas";
});

// Reproduce sonido según tipo de alerta
function reproducirSonido(tipo) {
    if (!alertasActivas) return;
    const sonidos = {
        'LONG': document.getElementById('soundshort'),
        'SHORT': document.getElementById('soundshort'),
        'FAST SHORT': document.getElementById('soundlong')
    };
    const sonido = sonidos[tipo];
    if (sonido) {
        sonido.currentTime = 0;
        sonido.play().catch(console.warn);
    }
}


// Copia el tick al input de búsqueda
function copiarTick(headerElement) {
    const tick = headerElement.dataset.tick;
    const balance = headerElement.dataset.balance;
    const lastPrice = headerElement.dataset.lastprice;
    const tickerInput = document.getElementById("Ticker");
    const balanceInput = document.getElementById("Capital");
    const operableInput = document.getElementById("CapitalOperable");
    const valueInput = document.getElementById("EntryValue");
    const lastPriceInput = document.getElementById("LastPrice");
    const quantityInput = document.getElementById("Quantity");
    if (tickerInput) {
        tickerInput.value = tick.slice(0, -4); // Elimina el último "USDT" del ticker
        tickerInput.focus();
        // input.select();

        // Copiar al portapapeles
        navigator.clipboard.writeText(tick)
            .then(() => {
                console.log(`Ticker ${tick} copiado al portapapeles`);
            })
            .catch(err => {
                console.warn('No se pudo copiar al portapapeles:', err);
            });
    }
    if (balanceInput) {
        balanceInput.value = parseFloat(balance).toFixed(4);
        operableInput.value = (parseFloat(balance) / 2 ).toFixed(4); // Asignamos la mitad del balance al operable
        valueInput.value = (parseFloat(balance) / 2 * 0.1).toFixed(2); // Asignamos el 10% del balance operable al valor de entrada
    }
    if (quantityInput) {
        // Del balance, calculamos cantidad de monedas de entrada del 1% a 10x
        quantityInput.value = Math.floor(parseFloat(balance) / 2 * 0.1 / lastPrice);
        quantityInput.focus();
    }
    if (lastPriceInput) {
        lastPriceInput.value = lastPrice;   
    }
}


// Crea tarjeta en el DOM
function crearTarjeta(data) {
    const card = document.createElement('div');
    card.className = 'col-md col-lg-6 col-xl-4';
    card.style = 'text-align: -webkit-center';
    switch (data.tipo) {
        case 'LONG':
            card.innerHTML = `
                <div class="card border-success mb-3 shadow" style="max-width: 22rem;">
                    <div class="card-header bg-success text-white fw-bold" data-tick="${data.tick}" data-balance="${data.balance}" data-lastprice="${data.lastPrice}" onclick="copiarTick(this)">
                        <span class="w-100">${data.tipo} — ${data.tick}</span>
                        <button type="button" class="btn-close btn-close btn-sm float-end" aria-label="Cerrar" onclick="event.stopPropagation(); this.closest('.col-xl-4').remove()"></button>
                    </div>
                    <div class="card-body text-dark">
                        <h5 class="card-title mb-3">Variación: <span class="text-danger">${data.variacion}%</span></h5>
                        <p class="card-text mb-2">
                            <strong>Volumen:</strong> ${data.volumen}<br>
                            <strong>Precio máx:</strong> ${data.precio_max}<br>
                            <strong>Precio mín:</strong> ${data.precio_min}
                        </p>
                    </div>
                </div>
            `;
            break;
        case 'SHORT':
            card.innerHTML = `
                <div class="card border-danger mb-3 shadow" style="max-width: 22rem;">
                    <div class="card-header bg-danger text-white fw-bold" data-tick="${data.tick}" data-balance="${data.balance}" data-lastprice="${data.lastPrice}" onclick="copiarTick(this)">
                        <span class="w-100">${data.tipo} — ${data.tick}</span>
                        <button type="button" class="btn-close btn-close btn-sm float-end" aria-label="Cerrar" onclick="event.stopPropagation(); this.closest('.col-xl-4').remove()"></button>
                    </div>
                    <div class="card-body text-dark">
                        <h5 class="card-title mb-3">Variación: <span class="text-danger">${data.variacion}%</span></h5>
                        <p class="card-text mb-2">
                            <strong>Volumen:</strong> ${data.volumen}<br>
                            <strong>Precio máx:</strong> ${data.precio_max}<br>
                            <strong>Precio mín:</strong> ${data.precio_min}
                        </p>
                    </div>
                </div>
            `;
            break;
        case 'FAST SHORT':
            card.innerHTML = `
                <div class="card border-warning mb-3 shadow" style="max-width: 22rem;">
                    <div class="card-header bg-warning text-white fw-bold" data-tick="${data.tick}" data-balance="${data.balance}" data-lastprice="${data.lastPrice}" onclick="copiarTick(this)">
                        <span class="w-100">${data.tipo} — ${data.tick}</span>
                        <button type="button" class="btn-close btn-close btn-sm float-end" aria-label="Cerrar" onclick="event.stopPropagation(); this.closest('.col-xl-4').remove()"></button>
                    </div>
                    <div class="card-body text-dark">
                        <h5 class="card-title mb-3">Variación: <span class="text-danger">${data.variacion}%</span></h5>
                        <p class="card-text mb-2">
                            <strong>Volumen:</strong> ${data.volumen}<br>
                            <strong>Precio máx:</strong> ${data.precio_max}<br>
                            <strong>Precio mín:</strong> ${data.precio_min}
                        </p>
                    </div>
                </div>
            `;
            break;
        default: // Si el tipo no es reconocido, devolvemos el mensaje que traiga
            console.warn('Tipo de alerta desconocido:', data.tipo);
            console.warn(data);
            card.innerHTML = `${data.mensaje || 'Alerta desconocida'}`;
            return;
    }
    document.getElementById('alertas').appendChild(card);
    reproducirSonido(data.tipo);
}


// Función para agregar números dobles a un arreglo
function agregarDobles(numeroInicial) {
    const arreglo = [numeroInicial];
    for (let i = 0; i < 5; i++) {
        const ultimoNumero = arreglo[arreglo.length - 1];
        const doble = ultimoNumero * 2;
        arreglo.push(doble);
    }
    return arreglo;
}

const miArreglo = agregarDobles(5);


// Función para cambiar el color de fondo de los elementos de la lista
// Esta función se llama al hacer clic en un elemento de la lista
function backgroundColorChange(element) {
    let elems = element.parentNode.querySelectorAll('.list-group-item');
    for (let i = 0; i < elems.length; i++) {
        (elems[i].style.backgroundColor === 'lightslategray')? elems[i].style.backgroundColor = '': null;
    };
    (element.style.backgroundColor === 'gainsboro')? null: element.style.backgroundColor = 'lightslategray';
}


// Función para agregar tarjeta de recompras
// Esta función se llama al hacer clic en el botón "Calcular"
function agregarTarjetaRecompras() {
    const tickerInput = document.getElementById("Ticker");
    const lastPriceInput = document.getElementById("LastPrice");
    const quantityInput = document.getElementById("Quantity");
    let dobles = agregarDobles(parseInt(quantityInput.value));
    const tarjeta = document.createElement('div');
    tarjeta.className = 'col-md-12 mb-3 w-75'; // Usamos col-md-12 para que ocupe todo el ancho de la columna derecha
    tarjeta.innerHTML = `
        <div class="card shadow-sm">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">Coin <strong>${tickerInput.value}</strong></h5>
                    <button class="btn btn-sm btn-outline-danger" onclick="this.closest('.col-md-12').remove()"><strong>X</strong></button>
                </div>
                <ul class="px-5 list-group list-group-flush">
                    <li class="list-group-item d-flex align-items-center" onclick="backgroundColorChange(this)">
                        <div class="text-start">Recom 6</div>
                        <div class="flex-fill text-center">
                            <strong id="Recom6" class="text-danger">${dobles[5]}</strong>
                        </div>
                        <div id="Recom6usd" class="text-end">u$d ${(dobles[5] * parseFloat(lastPriceInput.value) / 10).toFixed(2)}</div>
                    </li>
                    
                    <li class="list-group-item d-flex align-items-center" onclick="backgroundColorChange(this)">
                        <div class="text-start">Recom 5</div>
                        <div class="flex-fill text-center">
                            <strong id="Recom5" class="text-warning">${dobles[4]}</strong>
                        </div>
                        <div id="Recom5usd" class="text-end">u$d ${(dobles[4] * parseFloat(lastPriceInput.value) / 10).toFixed(2)}</div>
                    </li>

                    <li class="list-group-item d-flex align-items-center" onclick="backgroundColorChange(this)">
                        <div class="text-start">Recom 4</div>
                        <div class="flex-fill text-center">
                            <strong id="Recom4" class="text-warning">${dobles[3]}</strong>
                        </div>
                        <div id="Recom4usd" class="text-end">u$d ${(dobles[3] * parseFloat(lastPriceInput.value) / 10).toFixed(2)}</div>
                    </li>

                    <li class="list-group-item d-flex align-items-center" onclick="backgroundColorChange(this)">
                        <div class="text-start">Recom 3</div>
                        <div class="flex-fill text-center">
                            <strong id="Recom3">${dobles[2]}</strong>
                        </div>
                        <div id="Recom3usd" class="text-end">u$d ${(dobles[2] * parseFloat(lastPriceInput.value) / 10).toFixed(2)}</div>
                    </li>

                    <li class="list-group-item d-flex align-items-center" onclick="backgroundColorChange(this)">
                        <div class="text-start">Recom 2</div>
                        <div class="flex-fill text-center">
                            <strong id="Recom2">${dobles[1]}</strong>
                        </div>
                        <div id="Recom2usd" class="text-end">u$d ${(dobles[1] * parseFloat(lastPriceInput.value) / 10).toFixed(2)}</div>
                    </li>

                    <li class="list-group-item d-flex align-items-center" onclick="backgroundColorChange(this)">
                        <div class="text-start">Recom 1</div>
                        <div class="flex-fill text-center">
                            <strong id="Recom1">${dobles[0]}</strong>
                        </div>
                        <div id="Recom1usd" class="text-end">u$d ${(dobles[0] * parseFloat(lastPriceInput.value) / 10).toFixed(2)}</div>
                    </li>
                    
                    <li class="list-group-item d-flex align-items-center bg-entry" onclick="backgroundColorChange(this)">
                        <div class="text-start">Entrada</div>
                        <div class="flex-fill text-center">
                            <strong id="Recom0">${dobles[0]}</strong>
                        </div>
                        <div id="Recom0usd" class="text-end">u$d ${(dobles[0] * parseFloat(lastPriceInput.value) / 10).toFixed(2)}</div>
                    </li>
                </ul>
            </div>
        </div>
        `;
    document.getElementById('tarjetas').appendChild(tarjeta);
    
}


function agregarTarjetaSL() {
    const id = contador++;
    const tarjeta = document.createElement('div');
    tarjeta.className = 'col-md-12 mb-3'; // Usamos col-md-12 para que ocupe todo el ancho de la columna derecha
    tarjeta.innerHTML = `
        <div class="card shadow-sm">
            <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">Coin ${id}</h5>
                <button class="btn btn-sm btn-outline-danger" onclick="this.closest('.col-md-12').remove()">Eliminar</button>
            </div>
            <p class="card-text mt-2" id="contenido-${id}">Cargando datos...</p>
            </div>
        </div>
        `;
    document.getElementById('tarjetas').appendChild(tarjeta);

    // Simulación de una llamada a un backend (como Flask)
    // En un futuro, esto sería: fetch('/get-info')
    setTimeout(() => {
        const mockData = {
            mensaje: "Dato cargado exitosamente",
            dato: Math.floor(Math.random() * 1000)
        };
        const tickerSL = document.getElementById('Ticker').value;
        const amountSL = document.getElementById('Amount').value; 
        socket.emit('colocar_orden_SL', { ticker: tickerSL, amount: amountSL });

        const contentElement = document.getElementById(`contenido-${id}`);
        if (contentElement) {
            contentElement.textContent = mockData.mensaje + ' - Dato: ' + mockData.dato;
        }
    }, 500); // Simula un pequeño retraso de red
    
}

// Tests Tarjetas
document.getElementById('simularAlerta')?.addEventListener('click', () => {
    const alertaFalsa = {
        tipo: 'SHORT',
        tick: 'FAKEUSDT',
        variacion: 6.66,
        volumen: '123.45M',
        precio_max: '0.01234',
        precio_min: '0.00987',
        balance: '100',
        lastPrice: '0.01111'
    };
    crearTarjeta(alertaFalsa);
});


// 🔔 Inserta texto simple (mensajes)
socket.on('mensaje', (msg) => {
    console.log(msg);
    const textareaConsola = document.getElementById('floatingTextarea2Disabled');
    textareaConsola.textContent += msg + '\n';
    // Esto fuerza el scroll al fondo:
    textareaConsola.scrollTop = textareaConsola.scrollHeight;
});

// 🔔 Cuando llega una alerta de Python => crear tarjeta
socket.on('alerta', crearTarjeta);
