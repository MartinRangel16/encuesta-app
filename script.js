const API_URL = 'https://script.google.com/macros/s/AKfycbyIUFJoaerPGevfdGcwvJFDHdHtnhANFDEWg7WWiqiJ1EJWnadUOPgOHwRSXSKILWHC/exec';

// Manejo de errores mejorado
function mostrarError(mensaje) {

    console.error(mensaje);
    const errorElement = document.getElementById('error-msg') || document.createElement('div');
    errorElement.textContent = mensaje;
    errorElement.style.color = 'red';
    if (!document.getElementById('error-msg')) {
    errorElement.id = 'error-msg';
    document.body.prepend(errorElement);
    }
}

// Función mejorada para enviar datos
async function enviarDatos(endpoint, data) {
    try {
        const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
    }
    
    return await response.json();
    } catch (error) {
    mostrarError(`Error de conexión: ${error.message}`);
    throw error;
    }
}

// Registro
document.getElementById('registroForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Mostrar loader (opcional)
    document.getElementById('submitBtn').disabled = true;
    document.getElementById('submitBtn').textContent = 'Procesando...';
    
    const formData = {
        action: 'registro',
        numTicket: document.getElementById('numTicket').value,
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value || null,
        conociste: document.getElementById('conociste').value
    };
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Guardar datos temporalmente para usar en la encuesta
            sessionStorage.setItem('numTicket', formData.numTicket);
            sessionStorage.setItem('nombreUsuario', formData.nombre);
            
            // Redirigir a la encuesta
            window.location.href = 'encuesta.html';
        } else {
            alert(data.message || 'Error en el registro');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    } finally {
        // Restaurar botón
        document.getElementById('submitBtn').disabled = false;
        document.getElementById('submitBtn').textContent = 'Continuar a la encuesta';
    }
});

// Encuesta
if (document.getElementById('encuestaForm')) {
    document.getElementById('encuestaForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
        action: 'encuesta',
        numTicket: sessionStorage.getItem('numTicket'),
        p1: document.querySelector('input[name="p1"]:checked')?.value,
        // ... recoge todas las preguntas igual ...
        sugerencias: document.querySelector('textarea[name="sugerencias"]').value
    };
    
    try {
        const result = await enviarDatos(API_URL, formData);
        if (result.success) {
            sessionStorage.setItem('cupon', result.cupon);
            window.location.href = 'cupon.html';
        } else {
            mostrarError(result.message || 'Error al enviar encuesta');
        }
        } catch (error) {
        mostrarError('No se pudo enviar la encuesta');
        }
    });
}

// Mostrar cupón
if (document.getElementById('codigo-cupon')) {
    const cupon = sessionStorage.getItem('cupon');
    if (cupon) {
        document.getElementById('codigo-cupon').textContent = cupon;
        document.getElementById('contenido-cupon').style.display = 'block';
        document.getElementById('sin-cupones').style.display = 'none';
    } else {
        document.getElementById('contenido-cupon').style.display = 'none';
        document.getElementById('sin-cupones').style.display = 'block';
    }
}
