// Este script genera dinámicamente la tabla según la entidad activa y configuración cargada

document.addEventListener('DOMContentLoaded', async () => {
  await esperarConfiguracion();
  generarMenuEntidades();
  generarSelectFiltro();
  generarTablaDinamica();
  actualizarTitulo();
});

function esperarConfiguracion() {
  return new Promise(resolve => {
    const intervalo = setInterval(() => {
      if (Object.keys(configuracionTablas).length > 0) {
        clearInterval(intervalo);
        resolve();
      }
    }, 100);
  });
}

function generarTablaDinamica() {
  const entidad = entidadActiva;
  const config = configuracionTablas[entidad];
  if (!config) {
    console.error(`❌ No hay configuración para la entidad "${entidad}"`);
    return;
  }

  const columnas = obtenerColumnasDesdeConfig(config);
  const headers = columnas.map(col => `<th>${formatearNombreCampo(col.nombre)}</th>`).join('');
  const tablaHTML = `
    <table border="1">
      <thead>
        <tr>${headers}</tr>
      </thead>
      <tbody id="tabla"></tbody>
    </table>
  `;
  document.getElementById('contenedor-tabla').innerHTML = tablaHTML;
}

function generarSelectFiltro() {
  const filtroSelect = document.getElementById('filtro-columna');
  const config = configuracionTablas[entidadActiva];
  filtroSelect.innerHTML = '';

  if (!config.camposOrden || !config.camposBusqueda) {
    console.warn("⚠️ Faltan camposOrden o camposBusqueda en la configuración.");
    return;
  }

  config.camposOrden.forEach(nombreCampo => {
    if (config.camposBusqueda[nombreCampo]) {
      const label = formatearNombreCampo(nombreCampo);
      filtroSelect.innerHTML += `<option value="${nombreCampo}">${label}</option>`;
    }
  });
}

function formatearNombreCampo(campo) {
  return campo
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function actualizarTitulo() {
  const entidad = entidadActiva;
  const nombreFormateado = entidad.charAt(0).toUpperCase() + entidad.slice(1);
  document.querySelector('h1').textContent = `Tabla de ${nombreFormateado}`;
}

function generarMenuEntidades() {
  const menu = document.getElementById('menu-entidades');
  menu.innerHTML = ''; // limpiar por si se vuelve a generar

  Object.keys(configuracionTablas).forEach(entidad => {
    const boton = document.createElement('button');
    boton.textContent = entidad.charAt(0).toUpperCase() + entidad.slice(1);
    boton.addEventListener('click', () => {
      window.location.href = `/${entidad}`;
    });
    menu.appendChild(boton);
  });
}