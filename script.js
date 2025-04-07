
// Configuración global
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz7VuHS6pC5tL6Gw6u-omAvIRXdDFbCUsGjBiPsYxUUwLN5qw6qexYmCFCuH4uTkT-I/exec";

// Función para inicializar el formulario de registro
function initRegistroForm() {
  const registroForm = document.getElementById('registroForm');
  
  if (!registroForm) {
    console.log('Formulario de registro no encontrado (página actual no es index.html)');
    return;
  }

  registroForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validar términos y condiciones
    if (!document.getElementById('terminos').checked) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }

    // Validar campos requeridos
    const requiredFields = ['numTicket', 'nombre', 'email', 'conociste'];
    for (const fieldId of requiredFields) {
      const field = document.getElementById(fieldId);
      if (!field || !field.value.trim()) {
        alert(`El campo ${fieldId} es obligatorio`);
        return;
      }
    }

    // Guardar datos
    const formData = {
      numTicket: document.getElementById('numTicket').value.trim(),
      nombre: document.getElementById('nombre').value.trim(),
      email: document.getElementById('email').value.trim(),
      telefono: document.getElementById('telefono').value.trim(),
      conociste: document.getElementById('conociste').value
    };
    
    localStorage.setItem('registroData', JSON.stringify(formData));
    window.location.href = 'encuesta.html';
  });
}

// Función para manejar el envío de la encuesta
async function submitEncuesta(formData) {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en submitEncuesta:', error);
    throw error;
  }
}

// Función para inicializar el formulario de encuesta
function initEncuestaForm() {
  const encuestaForm = document.getElementById('encuestaForm');
  
  if (!encuestaForm) {
    console.log('Formulario de encuesta no encontrado (página actual no es encuesta.html)');
    return;
  }

  encuestaForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    
    try {
      // Obtener datos de registro
      const registroData = JSON.parse(localStorage.getItem('registroData'));
      if (!registroData) {
        throw new Error('Datos de registro no encontrados. Por favor comienza desde el inicio.');
      }

      // Validar que todas las preguntas estén respondidas
      const encuestaData = {};
      const preguntas = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'];
      
      for (const pregunta of preguntas) {
        encuestaData[pregunta] = getRadioValue(pregunta);
      }
      
      encuestaData.sugerencias = document.querySelector('textarea[name="sugerencias"]').value.trim();

      // Enviar datos
      const result = await submitEncuesta({...registroData, ...encuestaData});
      
      if (!result.success) {
        throw new Error(result.error || 'Error al procesar la encuesta');
      }

      // Manejar cupón
      if (result.cupon && result.cupon !== "CUPONES AGOTADOS") {
        localStorage.setItem('cuponData', JSON.stringify({
          codigo: result.cupon,
          disponibles: result.quedan
        }));
        window.location.href = 'cupon.html';
      } else {
        localStorage.setItem('encuestaMessage', 'Gracias por participar. Los cupones se han agotado.');
        window.location.href = 'index.html';
      }
      
    } catch (error) {
      console.error('Error al enviar encuesta:', error);
      alert(`Error: ${error.message}\n\nPor favor intenta nuevamente.`);
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

// Función auxiliar mejorada para radio buttons
function getRadioValue(name) {
  const selected = document.querySelector(`input[name="${name}"]:checked`);
  if (!selected) {
    // Hacer scroll a la pregunta no respondida
    const preguntaElement = document.querySelector(`input[name="${name}"]`).closest('.pregunta');
    if (preguntaElement) {
      preguntaElement.scrollIntoView({ behavior: 'smooth' });
      preguntaElement.style.backgroundColor = '#fff3f3';
      setTimeout(() => {
        preguntaElement.style.backgroundColor = '';
      }, 2000);
    }
    throw new Error(`Por favor responde la pregunta: ${name}`);
  }
  return selected.value;
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  initRegistroForm();
  initEncuestaForm();
  
  // Mostrar mensaje si existe
  const message = localStorage.getItem('encuestaMessage');
  if (message) {
    alert(message);
    localStorage.removeItem('encuestaMessage');
  }
});
