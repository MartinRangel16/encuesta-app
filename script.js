document.addEventListener('DOMContentLoaded', function() {
    const registroForm = document.getElementById('registroForm');
    const encuestaForm = document.getElementById('encuestaForm');
    const scriptURL = 'https://script.google.com/macros/s/AKfycbwQTFemL1JatyAoXSxqDp91HKfpI6vOT5yere7awveRQ9U4MRUtKsBlnEED8wkd93F_nA/exec'; // ¡REEMPLAZA CON TU URL REAL!

    if (registroForm) {
        registroForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(registroForm);
            const datosRegistro = {};
            formData.forEach((value, key) => {
                datosRegistro[key] = value;
            });
            localStorage.setItem('datosRegistro', JSON.stringify(datosRegistro));
            console.log('Datos de registro guardados en localStorage:', datosRegistro);
            console.log('Redirigiendo a encuesta.html...');
            window.location.href = 'encuesta.html';
        });
    }

    if (encuestaForm) {
        encuestaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const datosRegistroGuardados = localStorage.getItem('datosRegistro');
            if (!datosRegistroGuardados) {
                alert('Por favor, completa el registro primero.');
                window.location.href = '/';
                return;
            }
            const datosRegistro = JSON.parse(datosRegistroGuardados);
            const formData = new FormData(encuestaForm);
            const datosEncuesta = {};
            formData.forEach((value, key) => {
                datosEncuesta[key] = value;
            });
            const datosTotales = {...datosRegistro, ...datosEncuesta};

            fetch(scriptURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosTotales)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Respuesta del script:', data);
                localStorage.removeItem('datosRegistro');
                alert('¡Gracias por completar la encuesta!');
            })
            .catch((error) => {
                console.error('Error al enviar los datos:', error);
                alert('Hubo un error al enviar los datos. Por favor, inténtalo de nuevo.');
            });
        });
    }
});
