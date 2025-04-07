// script.js - Versión mejorada
// Configuración
const API_URL = 'https://script.google.com/macros/s/AKfycbz7VuHS6pC5tL6Gw6u-omAvIRXdDFbCUsGjBiPsYxUUwLN5qw6qexYmCFCuH4uTkT-I/exec';
const DEBUG = true; // Cambiar a false en producción

// Utilidad para logging
function debugLog(message) {

    if (DEBUG) {
        console.log('[DEBUG]', message);
    }
}

// Inicialización segura
function initApp() {
    debugLog('Inicializando aplicación...');
    
    // Manejo del formulario de registro
    const registroForm = document.getElementById('registroForm');
    if (registroForm) {
        debugLog('Formulario de registro encontrado');
        registroForm.addEventListener('submit', handleRegistroSubmit);
    } else {
        debugLog('Formulario de registro NO encontrado');
    }
    
    // Manejo del formulario de encuesta
    const encuestaForm = document.getElementById('encuestaForm');
    if (encuestaForm) {
        debugLog('Formulario de encuesta encontrado');
        encuestaForm.addEventListener('submit', handleEncuestaSubmit);
    }
    
    // Mostrar cupón si estamos en esa página
    if (document.getElementById('codigo-cupon')) {
        debugLog('Página de cupón detectada');
        mostrarCupon();
    }
}

// Manejador de registro
async function handleRegistroSubmit(e) {
    e.preventDefault();
    debugLog('Manejando envío de registro');
    
    const formData = {
    action: 'registro',
    numTicket: getValue('#numTicket'),
    nombre: getValue('#nombre'),
    email: getValue('#email'),
    telefono: getValue('#telefono'),
    conociste: getValue('#conociste')
    };

try {
        const response = await enviarDatos(API_URL, formData);
        if (response.success) {
        sessionStorage.setItem('numTicket', formData.numTicket);
        window.location.href = 'encuesta.html';
        } else {
        mostrarError(response.message || 'Error en el registro');
        }
    } catch (error) {
        mostrarError('Error de conexión: ' + error.message);
    }
}

// Función segura para obtener valores
function getValue(selector) {
    const element = document.querySelector(selector);
    return element ? element.value : null;
}

// Función para mostrar errores
function mostrarError(mensaje) {
    const errorElement = document.getElementById('error-msg') || createErrorElement();
    errorElement.textContent = mensaje;
    errorElement.style.display = 'block';
    }

function createErrorElement() {
    const div = document.createElement('div');
    div.id = 'error-msg';
    div.style.color = 'red';
    div.style.margin = '10px 0';
    document.body.prepend(div);
    return div;
}

// Iniciar la aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
    } else {
    initApp();
    }
