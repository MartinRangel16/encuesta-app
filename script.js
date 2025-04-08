// script.js - Versión mejorada con validaciones y seguridad

/*********************
 * CONFIGURACIÓN FIREBASE
 *********************/
const DEBUG = true;
// Configuración de Firebase (reemplaza con tus datos)
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
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

// Objeto global para almacenar datos temporalmente
const datosEncuesta = {
  registro: null,
  respuestas: null
};

// Función para generar código de cupón
function generarCodigoCupon() {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let resultado = '';
  for (let i = 0; i < 8; i++) {
    resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return resultado;
}

// Manejar registro (index.html)
if (document.getElementById('registroForm')) {
  document.getElementById('registroForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Guardar datos de registro en el objeto temporal
    datosEncuesta.registro = {
      numTicket: document.getElementById('numTicket').value,
      nombre: document.getElementById('nombre').value,
      email: document.getElementById('email').value,
      telefono: document.getElementById('telefono').value || 'No proporcionado',
      conociste: document.getElementById('conociste').value,
      fechaRegistro: new Date()
    };
    
    // Guardar en sessionStorage por si se recarga la página
    sessionStorage.setItem('datosRegistro', JSON.stringify(datosEncuesta.registro));
    
    // Redirigir a la encuesta
    window.location.href = 'encuesta.html';
  });
}

// Manejar encuesta (encuesta.html)
if (document.getElementById('encuestaForm')) {
  // Recuperar datos de registro si existen
  const datosGuardados = sessionStorage.getItem('datosRegistro');
  if (datosGuardados) {
    datosEncuesta.registro = JSON.parse(datosGuardados);
  }
  
  document.getElementById('encuestaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!datosEncuesta.registro) {
      alert("No se encontraron datos de registro. Por favor completa el formulario de registro primero.");
      window.location.href = 'index.html';
      return;
    }
    
    // Recoger respuestas de la encuesta
    datosEncuesta.respuestas = {
      p1: document.querySelector('input[name="p1"]:checked').value,
      p2: document.querySelector('input[name="p2"]:checked').value,
      p3: document.querySelector('input[name="p3"]:checked').value,
      p4: document.querySelector('input[name="p4"]:checked').value,
      p5: document.querySelector('input[name="p5"]:checked').value,
      p6: document.querySelector('input[name="p6"]:checked').value,
      p7: document.querySelector('input[name="p7"]:checked').value,
      p8: document.querySelector('input[name="p8"]:checked')?.value || 'No respondida',
      sugerencias: document.querySelector('textarea[name="sugerencias"]').value,
      fechaEncuesta: new Date()
    };
    
    try {
      // Guardar datos completos en Firestore
      const docRef = await db.collection('encuestasCompletas').add(datosEncuesta);
      
      // Generar cupón
      const codigoCupon = generarCodigoCupon();
      const cuponData = {
        codigo: codigoCupon,
        email: datosEncuesta.registro.email,
        valor: 50,
        usado: false,
        fechaGeneracion: new Date(),
        fechaExpiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        encuestaId: docRef.id
      };
      
      await db.collection('cupones').add(cuponData);
      
      // Limpiar sessionStorage
      sessionStorage.removeItem('datosRegistro');
      
      // Redirigir a página de agradecimiento
      window.location.href = `cupon.html?cupon=${codigoCupon}`;
    } catch (error) {
      console.error("Error al guardar encuesta: ", error);
      alert("Ocurrió un error al enviar tu encuesta. Por favor intenta nuevamente.");
    }
  });
}
