const API_URL = 'https://script.google.com/macros/s/AKfycbz7VuHS6pC5tL6Gw6u-omAvIRXdDFbCUsGjBiPsYxUUwLN5qw6qexYmCFCuH4uTkT-I/exec';

async function enviarDatos(data) {
  try {
    // Primero hacemos una solicitud OPTIONS para verificar CORS
    await fetch(API_URL, {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      }
    });
    
    // Luego hacemos la solicitud POST real
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      redirect: 'follow' // Importante para Google Apps Script
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al enviar datos:', error);
    throw error;
  }
}
