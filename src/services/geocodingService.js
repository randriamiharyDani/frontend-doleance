/**
 * Service de géocodage (Nominatim / OpenStreetMap).
 *
 * Centralise les URL + la gestion d'erreur afin que le formulaire public
 * (DeposerDoleance) et le backoffice (Doléance téléphonique) partagent
 * exactement le même comportement, sans dupliquer les appels `fetch`.
 * La géolocalisation GPS navigateur n'est volontairement pas utilisée :
 * la position est définie uniquement par la carte ou la recherche.
 */

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const DEFAULT_LANG = "fr,mg";

export const DEFAULT_CENTER = [-18.8792, 47.5079];

/** Centre d'Antananarivo par défaut quand aucune position n'a encore été choisie. */
export const ANTANANARIVO_CENTER = DEFAULT_CENTER;

export function buildReverseUrl(lat, lng, lang = DEFAULT_LANG) {
  return `${NOMINATIM_BASE}/reverse?format=json&addressdetails=1&accept-language=${lang}&lat=${encodeURIComponent(
    lat,
  )}&lon=${encodeURIComponent(lng)}`;
}

export function buildSearchUrl(
  query,
  lang = DEFAULT_LANG,
  { limit = 5, viewbox = null } = {},
) {
  const params = new URLSearchParams({
    format: "json",
    addressdetails: "1",
    countrycodes: "mg",
    "accept-language": lang,
    limit: String(limit),
    q: query,
  });
  if (viewbox) params.set("viewbox", viewbox);
  return `${NOMINATIM_BASE}/search?${params.toString()}`;
}

/**
 * Renvoie l'adresse lisible d'un point, ou `null` si Nominatim
 * ne renvoie pas de `display_name` exploitable.
 */
export async function reverseGeocode(latlng, { signal, lang = DEFAULT_LANG } = {}) {
  const lat = Array.isArray(latlng) ? latlng[0] : latlng.lat;
  const lng = Array.isArray(latlng) ? latlng[1] : latlng.lng;

  const res = await fetch(buildReverseUrl(lat, lng, lang), { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();
  return data?.display_name ? data : null;
}

/**
 * Recherche d'adresses (limité à Madagascar pour rester pertinent).
 * `limit` et `viewbox` (biais géographique `x1,y1,x2,y2`) permettent d'affiner
 * la précision sans jamais exclure un résultat hors de la zone.
 */
export async function searchGeocode(
  query,
  { signal, lang = DEFAULT_LANG, limit, viewbox } = {},
) {
  const res = await fetch(buildSearchUrl(query, lang, { limit, viewbox }), { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/** Normalise une valeur en nombre exploitable, sinon `null`. */
export function toCoord(value) {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return Number.isFinite(n) ? n : null;
}

export function isValidLatLng(lat, lng) {
  const la = toCoord(lat);
  const ln = toCoord(lng);
  return la !== null && ln !== null && la >= -90 && la <= 90 && ln >= -180 && ln <= 180;
}
