const API_BASE = 'http://localhost:5000/api/v1';

export async function fetchPersonalizedHome(persona = 'STUDENT', lat = 28.6139, lon = 77.2090, userId = null) {
  let url = `${API_BASE}/personalized-home?persona=${encodeURIComponent(persona)}&lat=${lat}&lon=${lon}`;
  if (userId) url += `&userId=${encodeURIComponent(userId)}`;

  const res = await fetch(url, {
    headers: userId ? { 'x-user-id': userId } : {},
  });
  if (!res.ok) throw new Error(`Failed to fetch personalized home: ${res.statusText}`);
  return res.json();
}

export async function fetchWeatherDashboard(persona = 'STUDENT', lat = 28.6139, lon = 77.2090) {
  const res = await fetch(`${API_BASE}/weather/dashboard?lat=${lat}&lon=${lon}&persona=${encodeURIComponent(persona)}`);
  if (!res.ok) throw new Error(`Failed to fetch weather dashboard: ${res.statusText}`);
  return res.json();
}

export async function fetchStations(search = '') {
  const url = search ? `${API_BASE}/stations?search=${encodeURIComponent(search)}` : `${API_BASE}/stations`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch stations: ${res.statusText}`);
  const data = await res.json();
  return data.data || [];
}

export async function fetchNearestStation(lat = 28.6139, lon = 77.2090) {
  const res = await fetch(`${API_BASE}/stations/nearest?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error(`Failed to fetch nearest station: ${res.statusText}`);
  const data = await res.json();
  return data.data;
}

export async function triggerAlertProcess(lat = 28.6139, lon = 77.2090, weatherData = null) {
  const res = await fetch(`${API_BASE}/alerts/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lon, weatherData }),
  });
  if (!res.ok) throw new Error(`Alert simulation failed: ${res.statusText}`);
  const data = await res.json();
  return data.data;
}

export async function fetchUserAlerts(userId = 'usr_guest') {
  const res = await fetch(`${API_BASE}/alerts`, {
    headers: { 'x-user-id': userId },
  });
  if (!res.ok) throw new Error(`Failed to fetch alerts: ${res.statusText}`);
  const data = await res.json();
  return data.data || [];
}

export async function generatePacking(destination, startDate = '', endDate = '') {
  const res = await fetch(`${API_BASE}/packing/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ destination, startDate, endDate }),
  });
  if (!res.ok) throw new Error(`Packing generation failed: ${res.statusText}`);
  const data = await res.json();
  return data.data;
}

export async function saveUserProfile(userData, userId = null) {
  const uid = userId || userData.uid || `usr_${Date.now()}`;
  const res = await fetch(`${API_BASE}/users/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': uid,
    },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error(`Failed to save profile: ${res.statusText}`);
  const data = await res.json();
  return data.data;
}

export async function fetchUserProfile(userId) {
  const res = await fetch(`${API_BASE}/users/profile`, {
    headers: { 'x-user-id': userId },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.data;
}
