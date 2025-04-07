// URL de tu Google Apps Script
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz7VuHS6pC5tL6Gw6u-omAvIRXdDFbCUsGjBiPsYxUUwLN5qw6qexYmCFCuH4uTkT-I/exec";

// Función mejorada para enviar datos
async function sendDataToSheet(data) {
  try {
    // Primero hacemos una prueba GET para verificar la conexión
    const testResponse = await fetch(SCRIPT_URL);
    if (!testResponse.ok) {
      throw new Error('No se pudo conectar con el servidor');
    }
    
    // Luego hacemos el POST
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      redirect: 'follow' // Importante para Google Apps Script
    });
    
    // Verificar redirección
    if (response.redirected) {
      const redirectedResponse = await fetch(response.url);
      return await redirectedResponse.json();
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en sendDataToSheet:', error);
    throw error;
  }
}

// En tu event listener de la encuesta:
document.getElementById('encuestaForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const submitBtn = document.querySelector('#encuestaForm button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando...';
  
  try {
    // Obtener y validar datos
    const registroData = JSON.parse(localStorage.getItem('registroData'));
    if (!registroData) throw new Error('Sesión expirada. Por favor comienza de nuevo.');
    
    const encuestaData = {
      p1: getRadioValue('p1'),
      // ... resto de tus campos ...
      sugerencias: document.querySelector('textarea[name="sugerencias"]').value
    };
    
    // Enviar datos
    const result = await sendDataToSheet({...registroData, ...encuestaData});
    
    if (!result.success) {
      throw new Error(result.error || 'Error al procesar la encuesta');
    }
    
    // Mostrar resultado
    showResult(result);
    
  } catch (error) {
    alert(`Error: ${error.message}`);
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

// Función auxiliar para mostrar resultados
function showResult(result) {
  let message = '¡Gracias por tu participación!';
  
  if (result.cupon && result.cupon !== "CUPONES AGOTADOS") {
    message += `\n\nTu cupón de descuento es: ${result.cupon}`;
    message += `\nCupones restantes: ${result.quedan}`;
  }
  
  alert(message);
  localStorage.removeItem('registroData');
  window.location.href = 'index.html';
}
