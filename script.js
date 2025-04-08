/ script.js - Versión mejorada con validaciones y seguridad

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
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

/*********************
 * UTILIDADES
 *********************/
// Logging mejorado
function debugLog(message, data = null) {
    if (DEBUG) {
        console.log(`[DEBUG][${new Date().toISOString()}]`, message, data || '');
    }
}

// Sanitización de inputs
function sanitizeInput(input) {
    if (!input) return '';
    return input.toString()
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .trim();
}

// Validación de email
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validación de teléfono (opcional)
function isValidPhone(phone) {
    if (!phone) return true; // Opcional
    return /^[0-9+\-() ]{8,15}$/.test(phone);
}

// Obtener valor sanitizado
function getValue(selector) {
    const element = document.querySelector(selector);
    return element ? sanitizeInput(element.value) : null;
}

// Mostrar/ocultar errores
const errorHandler = {
    show: function(message) {
        let errorElement = document.getElementById('error-msg');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'error-msg';
            errorElement.className = 'error-message';
            document.querySelector('.container').prepend(errorElement);
        }
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    },
    hide: function() {
        const errorElement = document.getElementById('error-msg');
        if (errorElement) errorElement.style.display = 'none';
    }
};

/*********************
 * MANEJADORES
 *********************/
async function handleRegistroSubmit(e) {
    e.preventDefault();
    errorHandler.hide();
    
    const submitBtn = document.getElementById('submitBtn');
    const originalBtnText = submitBtn.innerHTML;
    
    try {
        // Feedback visual
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Enviando...';
        
        // Obtener y validar datos
        const formData = {
            numTicket: getValue('#numTicket'),
            nombre: getValue('#nombre'),
            email: getValue('#email'),
            telefono: getValue('#telefono'),
            conociste: getValue('#conociste')
        };

        // Validaciones
        if (!formData.numTicket || !formData.nombre || !formData.email) {
            throw new Error('Todos los campos requeridos deben completarse');
        }
        
        if (!isValidEmail(formData.email)) {
            throw new Error('Ingrese un email válido');
        }
        
        if (!isValidPhone(formData.telefono)) {
            throw new Error('Teléfono no válido (solo números y + - ( ) )');
        }
        
        if (!document.getElementById('terminos').checked) {
            throw new Error('Debe aceptar los términos y condiciones');
        }

        debugLog('Datos del formulario validados:', formData);
        
        // Envío de datos (reemplazar por Firebase luego)
        const response = await enviarDatos(API_URL, {
            action: 'registro',
            ...formData
        });

        if (response.success) {
            sessionStorage.setItem('numTicket', formData.numTicket);
            window.location.href = 'encuesta.html';
        } else {
            throw new Error(response.message || 'Error en el registro');
        }
    } catch (error) {
        debugLog('Error en registro:', error);
        errorHandler.show(error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

/*********************
 * FUNCIONES AUXILIARES
 *********************/
async function enviarDatos(url, data) {
    try {
        debugLog('Registrando usuario en Firebase Auth');
        
        // 1. Crear usuario en Firebase Authentication
        const userCredential = await auth.createUserWithEmailAndPassword(
            data.email,
            data.numTicket // Usamos el número de ticket como contraseña temporal
        );
        
        debugLog('Usuario registrado en Auth:', userCredential.user.uid);

        // 2. Guardar datos adicionales en Firestore
        await db.collection('usuarios').doc(userCredential.user.uid).set({
            numTicket: data.numTicket,
            nombre: data.nombre,
            email: data.email,
            telefono: data.telefono || null,
            conociste: data.conociste,
            fechaRegistro: firebase.firestore.FieldValue.serverTimestamp()
        });

        debugLog('Datos guardados en Firestore');
        
        return { 
            success: true,
            userId: userCredential.user.uid
        };
    } catch (error) {
        debugLog('Error en Firebase:', error);
        let errorMessage = 'Error en el registro';
        
        // Manejo de errores específicos de Firebase
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'Este email ya está registrado';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Email no válido';
                break;
            case 'auth/weak-password':
                errorMessage = 'El número de ticket debe tener al menos 6 caracteres';
                break;
        }
        
        throw new Error(errorMessage);
    }
}

/*********************
 * INICIALIZACIÓN
 *********************/
function initApp() {
    debugLog('Inicializando aplicación...');
    
    // Manejo del formulario de registro
    const registroForm = document.getElementById('registroForm');
    if (registroForm) {
        debugLog('Formulario de registro encontrado');
        registroForm.addEventListener('submit', handleRegistroSubmit);
        
        // Validación en tiempo real
        registroForm.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('blur', () => errorHandler.hide());
        });
    }
    
    // Otras inicializaciones...
}

// Iniciar la aplicación
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
