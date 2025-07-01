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

function agregarTarjeta() {
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