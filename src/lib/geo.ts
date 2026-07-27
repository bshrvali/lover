export type GeoFix = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  source: "gps";
};

export function getGpsPosition(timeoutMs = 12000): Promise<GeoFix | null> {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Number.isFinite(pos.coords.accuracy) ? pos.coords.accuracy : null,
          altitude: pos.coords.altitude,
          source: "gps",
        });
      },
      () => resolve(null),
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 0,
      },
    );
  });
}
