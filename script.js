
// Configuración global
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz7VuHS6pC5tL6Gw6u-omAvIRXdDFbCUsGjBiPsYxUUwLN5qw6qexYmCFCuH4uTkT-I/exec";
// Function to get radio button values
function getRadioValue(name) {
  const selected = document.querySelector(`input[name="${name}"]:checked`);
  if (!selected) {
    throw new Error(`Por favor responde la pregunta: ${name}`);
  }
  return selected.value;
}

// Function to send data to Google Sheet
async function sendDataToSheet(data) {
  try {
    // First make a test GET request to verify connection
    const testResponse = await fetch(SCRIPT_URL);
    if (!testResponse.ok) {
      throw new Error('No se pudo conectar con el servidor');
    }

    // Then make the POST request
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      redirect: 'follow' // Important for Google Apps Script
    });

    // Check for redirection
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

// Registration form handling
if (document.getElementById('registroForm')) {
  document.getElementById('registroForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Validate terms and conditions
    if (!document.getElementById('terminos').checked) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }

    // Collect form data
    const formData = {
      numTicket: document.getElementById('numTicket').value,
      nombre: document.getElementById('nombre').value,
      email: document.getElementById('email').value,
      telefono: document.getElementById('telefono').value,
      conociste: document.getElementById('conociste').value
    };

    // Save data and redirect
    localStorage.setItem('registroData', JSON.stringify(formData));
    window.location.href = 'encuesta.html';
  });
}

// Survey form handling
if (document.getElementById('encuestaForm')) {
  document.getElementById('encuestaForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.querySelector('#encuestaForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    try {
      // Get registration data
      const registroData = JSON.parse(localStorage.getItem('registroData'));
      if (!registroData) {
        throw new Error('Sesión expirada. Por favor comienza de nuevo.');
      }

      // Get survey responses
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

      // Combine data and send to sheet
      const result = await sendDataToSheet({...registroData, ...encuestaData});

      if (!result.success) {
        throw new Error(result.error || 'Error al procesar la encuesta');
      }

      // Handle coupon or redirect
      if (result.cupon && result.cupon !== "CUPONES AGOTADOS") {
        localStorage.setItem('cuponData', JSON.stringify({
          codigo: result.cupon,
          quedan: result.quedan,
          nombre: registroData.nombre
        }));
        window.location.href = 'cupon.html';
      } else {
        localStorage.setItem('encuestaMessage', 'Gracias por participar. Los cupones se han agotado.');
        window.location.href = 'index.html';
      }

    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error.message}`);
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}
