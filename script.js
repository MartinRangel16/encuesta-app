document.addEventListener('DOMContentLoaded', function() {
    const registroForm = document.getElementById('registroForm');

    if (registroForm) {
        registroForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Evita que el formulario se envíe de la manera tradicional (recargando la página)
            console.log('Formulario de registro enviado. Redirigiendo a encuesta.html...');
            window.location.href = 'encuesta.html'; // Redirige a la página de la encuesta
        });
    } else {
        console.error('No se encontró el formulario de registro con el ID "registroForm".');
    }
});