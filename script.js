// URL de tu Google Apps Script
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz7VuHS6pC5tL6Gw6u-omAvIRXdDFbCUsGjBiPsYxUUwLN5qw6qexYmCFCuH4uTkT-I/exec";
document.addEventListener('DOMContentLoaded', function() {
    // Manejo del formulario de registro
    if (document.getElementById('registroForm')) {

        document.getElementById('registroForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Guardar datos en sessionStorage para usarlos después
        const formData = new FormData(this);
        const registroData = {};
        formData.forEach((value, key) => {
            registroData[key] = value;
        });
        
        sessionStorage.setItem('registroData', JSON.stringify(registroData));
        
        // Redirigir a la encuesta
        window.location.href = 'encuesta.html';
        });
    }
    
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
        
        // Enviar a Google Sheets
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(allData),
            headers: {
            'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.result === 'success') {
            // Guardar código de cupón y redirigir
            sessionStorage.setItem('couponCode', data.coupon);
            window.location.href = 'cupon.html';
            } else {
            alert('Error al enviar la encuesta. Por favor intenta nuevamente.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al enviar la encuesta. Por favor intenta nuevamente.');
        });
        });
    }
    
    // Mostrar cupón en la página final
    if (document.getElementById('codigo-cupon')) {
        const couponCode = sessionStorage.getItem('couponCode');
        if (couponCode) {
        document.getElementById('codigo-cupon').textContent = couponCode;
        } else {
        document.getElementById('contenido-cupon').style.display = 'none';
        document.getElementById('sin-cupones').style.display = 'block';
        }
    }
    });
