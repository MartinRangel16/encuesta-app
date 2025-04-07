// URL de tu Google Apps Script (reemplaza con la tuya)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz7VuHS6pC5tL6Gw6u-omAvIRXdDFbCUsGjBiPsYxUUwLN5qw6qexYmCFCuH4uTkT-I/exec";

// Envía los datos usando un FORMULARIO OCULTO (evita CORS)
function sendDataToGoogleSheets(data) {
  return new Promise((resolve) => {
    // 1. Crea un iframe invisible para recibir la respuesta
    const iframe = document.createElement("iframe");
    iframe.name = "hidden-iframe";
    iframe.style.display = "none";
    
    // 2. Crea un formulario oculto
    const form = document.createElement("form");
    form.action = GOOGLE_SCRIPT_URL;
    form.method = "POST";
    form.target = "hidden-iframe";
    form.style.display = "none";
    
    // 3. Agrega los datos como un input oculto
    const input = document.createElement("input");
    input.name = "data";
    input.value = JSON.stringify(data);
    form.appendChild(input);
    
    // 4. Escucha cuando el iframe carga la respuesta
    iframe.onload = function() {
      try {
        const responseText = iframe.contentDocument.body.textContent;
        const response = JSON.parse(responseText);
        resolve(response);
      } catch (e) {
        resolve({ success: false, error: "Error al leer respuesta" });
      }
    };
    
    // 5. Agrega el formulario e iframe al DOM y envía
    document.body.appendChild(iframe);
    document.body.appendChild(form);
    form.submit();
  });
}

// Maneja el envío del formulario de encuesta
document.getElementById("encuestaForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  // 1. Recopila datos del registro (guardados en sessionStorage)
  const registroData = JSON.parse(sessionStorage.getItem("registroData"));
  
  // 2. Recopila datos de la encuesta
  const encuestaData = {};
  new FormData(e.target).forEach((value, key) => encuestaData[key] = value);
  
  // 3. Combina los datos
  const allData = { ...registroData, ...encuestaData };
  
  // 4. Envía a Google Sheets
  const result = await sendDataToGoogleSheets(allData);
  
  if (result.success) {
    sessionStorage.setItem("couponCode", result.coupon);
    window.location.href = "cupon.html";
  } else {
    alert("Error al enviar: " + (result.error || "Intenta de nuevo"));
  }
});
