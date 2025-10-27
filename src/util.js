export function calculateSpeedKmH(p1, p2) {
  const R = 6371; // Earth radius in km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(p1.lat * Math.PI / 180) *
      Math.cos(p2.lat * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // in km
  const timeDiff = (new Date(p2.timestamp) - new Date(p1.timestamp)) / 3600000;
  return distance / timeDiff || 0;
}
