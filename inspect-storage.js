// Script para inspeccionar localStorage y encontrar el problema de redirección
console.log('=== INSPECTING LOCALSTORAGE ===');

// Mostrar todas las claves del localStorage
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const value = localStorage.getItem(key);
  console.log(`${key}:`, value);
}

// Buscar específicamente datos relacionados con tabs
const tabsData = localStorage.getItem('tabs');
if (tabsData) {
  console.log('\n=== TABS DATA ===');
  try {
    const parsed = JSON.parse(tabsData);
    console.log('Parsed tabs data:', parsed);
  } catch (e) {
    console.log('Error parsing tabs data:', e);
  }
}

// Buscar datos de Pinia
Object.keys(localStorage).forEach(key => {
  if (key.includes('pinia') || key.includes('tabs') || key.includes('store')) {
    console.log(`\n=== ${key.toUpperCase()} ===`);
    console.log(localStorage.getItem(key));
  }
});

console.log('\n=== CURRENT ROUTE ===');
console.log('Current path:', window.location.pathname);
console.log('Current hash:', window.location.hash);
console.log('Current search:', window.location.search);