import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// =============================================
// Configuración de Firebase
// =============================================
const firebaseConfig = {
  apiKey: "AIzaSyBbQ9V1EeAMFqShg_ScqO3ALE2UsGXRSjc",
  authDomain: "encuestashanty12.firebaseapp.com",
  projectId: "encuestashanty12",
  storageBucket: "encuestashanty12.firebasestorage.app",
  messagingSenderId: "692171791223",
  appId: "1:692171791223:web:f1e799d155820ac7389f72",
  measurementId: "G-MF4K1QHYXG"
};

// Inicializar Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// =============================================
// Funciones Auxiliares
// =============================================
function getRadioValue(name) {
  const selected = document.querySelector(`input[name="${name}"]:checked`);
  if (!selected) {
    const questionElement = selected.closest('.pregunta');
    questionElement.style.backgroundColor = '#fff3f3';
    setTimeout(() => questionElement.style.backgroundColor = '', 2000);
    throw new Error(`Por favor responde: ${name}`);
  }
  return selected.value;
}

function showError(message) {
  const errorElement = document.getElementById('error-message') || document.createElement('div');
  errorElement.id = 'error-message';
  errorElement.style.color = 'red';
  errorElement.textContent = message;
  document.body.prepend(errorElement);
}

// =============================================
// Manejo del Formulario de Registro (index.html)
// =============================================
if (document.getElementById('registroForm')) {
  document.getElementById('registroForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.querySelector('#registroForm button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registrando...';

    try {
      const formData = {
        numTicket: document.getElementById('numTicket').value.trim(),
        nombre: document.getElementById('nombre').value.trim(),
        email: document.getElementById('email').value.trim(),
        telefono: document.getElementById('telefono').value.trim() || null,
        conociste: document.getElementById('conociste').value,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };

      // Validar campos obligatorios
      if (!formData.numTicket || !formData.nombre || !formData.email) {
        throw new Error('Todos los campos marcados como * son obligatorios');
      }

      // Guardar en Firestore
      await db.collection('registros').add(formData);
      
      // Guardar datos temporalmente para la encuesta
      localStorage.setItem('registroData', JSON.stringify(formData));
      window.location.href = 'encuesta.html';

    } catch (error) {
      showError(error.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Continuar a la encuesta';
    }
  });
}

// =============================================
// Manejo del Formulario de Encuesta (encuesta.html)
// =============================================
if (document.getElementById('encuestaForm')) {
  document.getElementById('encuestaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.querySelector('#encuestaForm button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    try {
      const registroData = JSON.parse(localStorage.getItem('registroData'));
      if (!registroData) throw new Error('Datos de registro no encontrados');

      // Obtener respuestas
      const encuestaData = {
        p1: getRadioValue('p1'),
        p2: getRadioValue('p2'),
        p3: getRadioValue('p3'),
        p4: getRadioValue('p4'),
        p5: getRadioValue('p5'),
        p6: getRadioValue('p6'),
        p7: getRadioValue('p7'),
        p8: getRadioValue('p8'),
        sugerencias: document.querySelector('textarea[name="sugerencias"]').value.trim(),
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };

      // Usar Batch para transacción atómica
      const batch = db.batch();
      const encuestaRef = db.collection('encuestas').doc();
      
      batch.set(encuestaRef, { ...registroData, ...encuestaData });

      // Verificar y actualizar cupones (solo si hay disponibilidad)
      const cuponesRef = db.collection('cupones').doc('contador');
      const cuponesDoc = await cuponesRef.get();
      const cuponesDisponibles = cuponesDoc.data().disponibles;

      if (cuponesDisponibles > 0) {
        const cupon = "SHNT" + Math.floor(1000 + Math.random() * 9000);
        batch.set(db.collection('cuponesGenerados').doc(encuestaRef.id), { 
          codigo: cupon,
          usado: false
        });
        batch.update(cuponesRef, { 
          disponibles: firebase.firestore.FieldValue.increment(-1),
          usados: firebase.firestore.FieldValue.increment(1)
        });
        localStorage.setItem('cuponData', JSON.stringify({ 
          codigo: cupon, 
          disponibles: cuponesDisponibles - 1 
        }));
      }

      await batch.commit();
      window.location.href = 'cupon.html';

    } catch (error) {
      showError(`Error: ${error.message}`);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar encuesta';
    }
  });
}

// =============================================
// Mostrar Cupón (cupon.html)
// =============================================
if (document.getElementById('contenido-cupon')) {
  document.addEventListener('DOMContentLoaded', async () => {
    const cuponData = JSON.parse(localStorage.getItem('cuponData'));
    
    if (cuponData?.codigo) {
      document.getElementById('codigo-cupon').textContent = cuponData.codigo;
      document.getElementById('disponibles').textContent = cuponData.disponibles;
    } else {
      document.getElementById('contenido-cupon').style.display = 'none';
      document.getElementById('sin-cupones').style.display = 'block';
    }

    // Limpiar almacenamiento local
    localStorage.removeItem('registroData');
    localStorage.removeItem('cuponData');
  });
}
