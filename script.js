// URL de tu Google Apps Script
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz7VuHS6pC5tL6Gw6u-omAvIRXdDFbCUsGjBiPsYxUUwLN5qw6qexYmCFCuH4uTkT-I/exec";

// Función para manejar el registro
if (document.getElementById('registroForm')) {
  document.getElementById('registroForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
      numTicket: document.getElementById('numTicket').value,
      nombre: document.getElementById('nombre').value,
      email: document.getElementById('email').value,
      telefono: document.getElementById('telefono').value,
      conociste: document.getElementById('conociste').value
    };
    
    localStorage.setItem('registroData', JSON.stringify(formData));
    window.location.href = 'encuesta.html';
  });
}

// Función para manejar la encuesta
if (document.getElementById('encuestaForm')) {
  document.getElementById('encuestaForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.querySelector('#encuestaForm button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    
    try {
      const registroData = JSON.parse(localStorage.getItem('registroData'));
      if (!registroData) throw new Error('Datos de registro no encontrados');
      
      const encuestaData = {
        p1: getRadioValue('p1'),
        p2: getRadioValue('p2'),
        p3: getRadioValue('p3'),
        p4: getRadioValue('p4'),
        p5: getRadioValue('p5'),
        p6: getRadioValue('p6'),
        p7: getRadioValue('p7'),
        p8: getRadioValue('p8'),
        sugerencias: document.querySelector('textarea[name="sugerencias"]').value
      };
      
      const response = await fetch(`${SCRIPT_URL}?callback=guardarDatos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({...registroData, ...encuestaData})
      });
      
      const data = await response.json();
      
      if (!data.success) throw new Error(data.error || 'Error al procesar');
      
      let mensaje = "¡Gracias por completar la encuesta!";
      if (data.cupon !== "CUPONES AGOTADOS") {
        mensaje += `\n\nCUPÓN: ${data.cupon}\n(Quedan ${data.quedan} cupones)`;
      }
      
      alert(mensaje);
      localStorage.removeItem('registroData');
      window.location.href = 'index.html';
      
    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error.message}`);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar encuesta';
    }
  });
}

// Función auxiliar para obtener valores de radio buttons
function getRadioValue(name) {
  const selected = document.querySelector(`input[name="${name}"]:checked`);
  if (!selected) throw new Error(`Por favor responde la pregunta: ${name}`);
  return selected.value;
}
