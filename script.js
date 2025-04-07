// URL de tu Google Apps Script (reemplaza con la tuya)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz7VuHS6pC5tL6Gw6u-omAvIRXdDFbCUsGjBiPsYxUUwLN5qw6qexYmCFCuH4uTkT-I/exec";
// Función para enviar datos mediante un formulario oculto
function enviarDatos(datos) {
  return new Promise((resolve) => {
    // Crear iframe para la respuesta
    const iframe = document.createElement('iframe');
    iframe.name = 'hidden-response';
    iframe.style.display = 'none';
    
    // Escuchar cuando cargue el iframe
    iframe.onload = function() {
      try {
        const response = JSON.parse(iframe.contentDocument.body.textContent);
        resolve(response);
      } catch(e) {
        resolve({ error: "Error al procesar respuesta" });
      }
    };
    
    // Crear formulario oculto
    const form = document.createElement('form');
    form.action = GOOGLE_SCRIPT_URL;
    form.method = 'POST';
    form.target = 'hidden-response';
    form.style.display = 'none';
    
    // Agregar campo con los datos
    const input = document.createElement('input');
    input.name = 'data';
    input.value = JSON.stringify(datos);
    form.appendChild(input);
    
    // Agregar al documento y enviar
    document.body.appendChild(iframe);
    document.body.appendChild(form);
    form.submit();
    
    // Limpiar después de 5 segundos
    setTimeout(() => {
      document.body.removeChild(iframe);
      document.body.removeChild(form);
    }, 5000);
  });
}

// Uso en tu formulario de encuesta
document.getElementById('encuestaForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  // Obtener datos del formulario
  const registroData = JSON.parse(sessionStorage.getItem('registroData'));
  const encuestaData = {};
  new FormData(this).forEach((value, key) => encuestaData[key] = value);
  
  // Combinar datos
  const allData = { ...registroData, ...encuestaData };
  
  // Enviar y manejar respuesta
  const response = await enviarDatos(allData);
  
  if (response.coupon) {
    sessionStorage.setItem('couponCode', response.coupon);
    window.location.href = 'cupon.html';
  } else {
    alert(response.error || 'Error al enviar la encuesta');
  }
});
