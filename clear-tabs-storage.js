// Script para limpiar el estado problemático de las tabs
console.log('Limpiando localStorage de tabs...');

// Mostrar estado actual
const currentTabs = localStorage.getItem('tabs');
console.log('Estado actual de tabs:', currentTabs);

// Limpiar específicamente las tabs
localStorage.removeItem('tabs');

// Verificar que se limpió
console.log('Estado después de limpiar:', localStorage.getItem('tabs'));

// Recargar la página para aplicar cambios
console.log('Recargando página...');
window.location.reload();