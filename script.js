// URL de tu Google Apps Script (reemplaza con la tuya)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz7VuHS6pC5tL6Gw6u-omAvIRXdDFbCUsGjBiPsYxUUwLN5qw6qexYmCFCuH4uTkT-I/exec";

// Manejo del formulario de encuesta
if (document.getElementById('encuestaForm')) {
  document.getElementById('encuestaForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Obtener datos del registro
    const registroData = JSON.parse(sessionStorage.getItem('registroData'));
    
    // Obtener datos de la encuesta
    const formData = new FormData(this);
    const encuestaData = {};
    formData.forEach((value, key) => {
      encuestaData[key] = value;
    });
    
    // Combinar datos
    const allData = {...registroData, ...encuestaData};
    
    // Crear formulario dinámico para enviar los datos
    const form = document.createElement('form');
    form.action = "https://script.google.com/macros/s/AKfycbz7VuHS6pC5tL6Gw6u-omAvIRXdDFbCUsGjBiPsYxUUwLN5qw6qexYmCFCuH4uTkT-I/exec";
    form.method = 'POST';
    form.target = 'hiddenFrame';
    form.style.display = 'none';
    
    // Agregar los datos al formulario
    for (const key in allData) {
      if (allData.hasOwnProperty(key)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = allData[key];
        form.appendChild(input);
      }
    }
    
    // Crear iframe oculto para la respuesta
    const iframe = document.createElement('iframe');
    iframe.name = 'hiddenFrame';
    iframe.style.display = 'none';
    iframe.onload = function() {
      try {
        const response = JSON.parse(iframe.contentWindow.document.body.textContent);
        if (response.result === 'success') {
          sessionStorage.setItem('couponCode', response.coupon);
          window.location.href = 'cupon.html';
        } else {
          alert('Error al enviar la encuesta. Por favor intenta nuevamente.');
        }
      } catch (e) {
        console.error('Error parsing response:', e);
        alert('Error al procesar la respuesta. Por favor intenta nuevamente.');
      }
    };
    
    document.body.appendChild(iframe);
    document.body.appendChild(form);
    form.submit();
    
    // Limpiar después de un tiempo
    setTimeout(() => {
      document.body.removeChild(iframe);
      document.body.removeChild(form);
    }, 5000);
  });
}
