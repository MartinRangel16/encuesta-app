// URL de tu Google Apps Script
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz7VuHS6pC5tL6Gw6u-omAvIRXdDFbCUsGjBiPsYxUUwLN5qw6qexYmCFCuH4uTkT-I/exec";

// Función para enviar datos mediante formulario oculto
function sendDataToGoogleSheets(data) {
  return new Promise((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.name = "hidden-iframe";
    iframe.style.display = "none";
    
    const form = document.createElement("form");
    form.action = GOOGLE_SCRIPT_URL;
    form.method = "POST";
    form.target = "hidden-iframe";
    form.style.display = "none";
    
    const input = document.createElement("input");
    input.name = "data";
    input.value = JSON.stringify(data);
    form.appendChild(input);
    
    iframe.onload = function() {
      try {
        const responseText = iframe.contentDocument.body.textContent;
        const response = JSON.parse(responseText);
        resolve(response);
        // Limpieza después de 3 segundos
        setTimeout(() => {
          document.body.removeChild(iframe);
          document.body.removeChild(form);
        }, 3000);
      } catch (e) {
        resolve({ success: false, error: "Error al procesar respuesta" });
      }
    };
    
    document.body.appendChild(iframe);
    document.body.appendChild(form);
    form.submit();
  });
}

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
  // 1. Manejar formulario de registro si existe
  const registroForm = document.getElementById('registroForm');
  if (registroForm) {
    registroForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      const registroData = {};
      formData.forEach((value, key) => registroData[key] = value);
      sessionStorage.setItem('registroData', JSON.stringify(registroData));
      window.location.href = 'encuesta.html';
    });
  }

  // 2. Manejar formulario de encuesta si existe
  const encuestaForm = document.getElementById('encuestaForm');
  if (encuestaForm) {
    encuestaForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Mostrar loader o mensaje de en
