export async function getGeojsonFile(fileLocation) {
  const response = await fetch(fileLocation);
  if (!response.ok) {
    throw new Error(`Error getting ${fileLocation} file`);
  }
  return await response.json();
}

export function getDistance(latlng1, latlng2) {
  const R = 6371000; // Earth's radius in meters
  const rad = Math.PI / 180;
  const lat1 = latlng1.lat * rad;
  const lat2 = latlng2.lat * rad;
  const a =
    Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos((latlng2.lng - latlng1.lng) * rad);
  const maxMeters = R * Math.acos(Math.min(a, 1));
  return maxMeters;
}

export function getZoomFromDistance(dist) {
  var zoom = 10;
  return zoom
}

export function getRoundNum(num) {
  const pow10 = Math.pow(10, (Math.floor(num) + "").length - 1);
  let d = num / pow10;
  d = d >= 10 ? 10 : d >= 5 ? 5 : d >= 3 ? 3 : d >= 2 ? 2 : 1;
  return pow10 * d;
}
