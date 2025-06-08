document.addEventListener('DOMContentLoaded', () => {
  fetch('/metadata')
    .then(res => res.json())
    .then(metadata => {
      const tablas = Object.keys(metadata);
      generarMenu(tablas);
    })
    .catch(err => {
      console.error("Error cargando metadata para el menú:", err);
      generarMenu([]);
    });
});

function generarMenu(tablas) {
  const menu = document.getElementById('menu-principal');
  menu.innerHTML = `
    <button id="menu-toggle" aria-label="Abrir menú">☰</button>

    <div id="menu-overlay" class="hidden"></div>

    <div id="sidebar-menu" class="hidden">
      <div class="menu-header">🧺 <strong>LA CANASTA BRAVA</strong></div>
      <ul>
        <li><a href="/inicio">🏠 Inicio</a></li>
        <li>
          <details>
            <summary>📊 Tablas</summary>
            <ul>
              ${tablas.map(t => `<li><a href="/${t}">${capitalizar(t)}</a></li>`).join('')}
            </ul>
          </details>
        </li>
        <li><a href="/historial">📄 Historial</a></li>
        <li><a href="/backup">🗂️ Backup</a></li>
      </ul>
    </div>
  `;

  const toggleButton = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar-menu');
  const overlay = document.getElementById('menu-overlay');

  function abrirMenu() {
    sidebar.classList.remove('hidden');
    overlay.classList.remove('hidden');
    toggleButton.style.display = 'none';
  }

  function cerrarMenu() {
    sidebar.classList.add('hidden');
    overlay.classList.add('hidden');
    toggleButton.style.display = 'block';
  }

  toggleButton.addEventListener('click', abrirMenu);
  overlay.addEventListener('click', cerrarMenu);
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
