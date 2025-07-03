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
  const input = document.getElementById("Ticker");
  if (input) {
    input.value = tick;
    input.focus();
    // input.select();
  }
}


// Crea tarjeta en el DOM
function crearTarjeta(data) {
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4';
    switch (data.tipo) {
        case 'LONG':
            card.innerHTML = `
                <div class="card border-success mb-3 shadow" style="max-width: 22rem;">
                    <div class="card-header bg-success text-white fw-bold" data-tick="${data.tick.slice(0, -4)}" onclick="copiarTick(this)">
                        <span>${data.tipo} — ${data.tick}</span>
                        <button type="button" class="btn-close btn-close btn-sm float-end" aria-label="Cerrar" onclick="event.stopPropagation(); this.closest('.col-md-6').remove()"></button>
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
                    <div class="card-header bg-danger text-white fw-bold" data-tick="${data.tick.slice(0, -4)}" onclick="copiarTick(this)">
                        <span>${data.tipo} — ${data.tick}</span>
                        <button type="button" class="btn-close btn-close btn-sm float-end" aria-label="Cerrar" onclick="event.stopPropagation(); this.closest('.col-md-6').remove()"></button>
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
                    <div class="card-header bg-warning text-white fw-bold" data-tick="${data.tick.slice(0, -4)}" onclick="copiarTick(this)">
                        <span>${data.tipo} — ${data.tick}</span>
                        <button type="button" class="btn-close btn-close btn-sm float-end" aria-label="Cerrar" onclick="event.stopPropagation(); this.closest('.col-md-6').remove()"></button>
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
        const contentElement = document.getElementById(`contenido-${id}`);
        if (contentElement) {
            contentElement.textContent = mockData.mensaje + ' - Dato: ' + mockData.dato;
        }
    }, 500); // Simula un pequeño retraso de red
}

// Tests Tarjetas
document.getElementById('simularAlerta').addEventListener('click', () => {
  const alertaFalsa = {
    tipo: 'SHORT',
    tick: 'FAKEUSDT',
    variacion: 6.66,
    volumen: '123.45M',
    precio_max: '0.01234',
    precio_min: '0.00987'
  };
  crearTarjeta(alertaFalsa);
});



// Inserta texto simple (mensajes)
socket.on('mensaje', (msg) => {
    const div = document.createElement('div');
    div.textContent = msg.texto;
    document.getElementById('mensajes').appendChild(div);
});

// 🔔 Cuando llega una alerta de Python => crear tarjeta
socket.on('alerta', crearTarjeta);
