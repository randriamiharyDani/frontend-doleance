import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Circle,
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  ScaleControl,
  TileLayer,
  ZoomControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { MapPinIcon, ArrowsPointingOutIcon, MapIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { ANTANANARIVO_CENTER, isValidLatLng } from "../../services/geocodingService";

/* -------------------------------------------------------------------------- */
/* Design tokens — charte institutionnelle CUA                                  */
/* navy #0F172A · blue #1E3A8A · gold #D4AF37                                    */
/* -------------------------------------------------------------------------- */

const CUA = {
  navy: "#0F172A",
  blue: "#1E3A8A",
  blueLight: "#2E4FA3",
  gold: "#D4AF37",
  goldDark: "#B8860B",
  gps: "#2563EB",
};

const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

/** Halo GPS pulsé, rendu sous le marqueur principal (zIndexOffset négatif). */
const gpsPulseIcon = L.divIcon({
  className: "lp-gps-icon",
  html: '<span class="lp-gps-pulse"></span><span class="lp-gps-core"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const LABEL_DEFAULTS = {
  coordinates: "Coordonnées",
  copy: "Copier",
  copied: "Coordonnées copiées !",
  copyError: "Copie impossible",
  noPosition: "Aucune position sélectionnée",
  hint: "",
  recenter: "Recentrer sur le marqueur",
  locateMe: "Me localiser",
  showQuartiers: "Afficher les quartiers",
  hideQuartiers: "Masquer les quartiers",
  refLabel: "Référence :",
};

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]),
  );

const formatCoord = (value) => Number(value).toFixed(6);

/* -------------------------------------------------------------------------- */
/* Styles du composant (tous scopés sous .lp-map)                              */
/* -------------------------------------------------------------------------- */

const STYLES = `
.lp-map { position: relative; }
.lp-map .leaflet-container { font-family: inherit; background: #e8eaed; outline: none; }
.lp-map .leaflet-container:focus-visible { box-shadow: inset 0 0 0 3px rgba(30, 58, 138, 0.35); }

.lp-map .leaflet-bar, .lp-map .leaflet-control-scale-line {
  border: 0 !important;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.18) !important;
  border-radius: 10px; overflow: hidden;
}
.lp-map .leaflet-control-zoom a {
  width: 34px; height: 34px; line-height: 34px;
  color: ${CUA.navy}; font-weight: 700; font-size: 18px;
  background: rgba(255, 255, 255, 0.96);
  border-bottom: 1px solid #E2E8F0;
  transition: background-color 0.15s ease, color 0.15s ease;
}
.lp-map .leaflet-control-zoom a:last-child { border-bottom: 0; }
.lp-map .leaflet-control-zoom a:hover { background: #F8FAFC; color: ${CUA.blue}; }
.lp-map .leaflet-control-scale-line {
  background: rgba(15, 23, 42, 0.72); color: #fff; border-radius: 999px;
  padding: 2px 8px; font-size: 10px; font-weight: 600; letter-spacing: 0.02em; backdrop-filter: blur(4px);
}
.lp-map .leaflet-control-attribution {
  background: rgba(255, 255, 255, 0.82) !important; color: #64748B;
  font-size: 10px; padding: 1px 6px; border-radius: 6px 0 0 0; backdrop-filter: blur(4px);
}
.lp-map .leaflet-control-attribution a { color: ${CUA.blue}; }
.lp-map .leaflet-popup-content-wrapper { border-radius: 12px; box-shadow: 0 10px 30px -8px rgba(15,23,42,0.35); }
.lp-map .leaflet-popup-content { margin: 10px 12px; font-size: 12px; line-height: 1.5; }
.lp-map .leaflet-popup-tip { box-shadow: none; }
.lp-map .lp-dot-icon { background: none; border: 0; }

.lp-map--dark .leaflet-tile-pane { filter: invert(1) hue-rotate(180deg) brightness(0.92) contrast(0.86) saturate(0.35); }
.lp-map--dark .leaflet-control-attribution { background: rgba(15, 23, 42, 0.8) !important; color: #94A3B8; }
.lp-map--dark .leaflet-control-attribution a { color: #93C5FD; }
.lp-map--dark .leaflet-control-zoom a { background: rgba(30, 41, 59, 0.96); color: #E2E8F0; border-bottom-color: #334155; }
.lp-map--dark .leaflet-control-zoom a:hover { background: #1E40AF; color: #fff; }

.lp-overlay { position: absolute; top: 10px; right: 10px; z-index: 500; display: flex; flex-direction: column; gap: 8px; }
.lp-fab {
  display: inline-flex; align-items: center; justify-content: center;
  width: 38px; height: 38px; border-radius: 11px;
  background: rgba(255, 255, 255, 0.96); color: ${CUA.navy};
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.18);
  cursor: pointer; transition: transform 0.15s ease, background-color 0.15s ease, color 0.15s ease;
}
.lp-fab:hover:not(:disabled) { background: #fff; color: ${CUA.blue}; transform: translateY(-1px); }
.lp-fab:disabled { opacity: 0.6; cursor: not-allowed; }
.lp-fab:focus-visible { outline: 2px solid ${CUA.gold}; outline-offset: 2px; }
.lp-fab--active { background: ${CUA.blue}; color: #fff; border-color: ${CUA.blueLight}; }
.lp-map--dark .lp-fab { background: rgba(30, 41, 59, 0.94); color: #E2E8F0; border-color: #334155; }
.lp-map--dark .lp-fab:hover:not(:disabled) { background: #1E40AF; color: #fff; }
.lp-map--dark .lp-fab--active { background: #1E40AF; color: #fff; }

.lp-gps-icon { background: none; border: 0; }
.lp-gps-core {
  position: absolute; inset: 4px; border-radius: 50%;
  background: ${CUA.gps}; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(37, 99, 235, 0.55);
}
.lp-gps-pulse {
  position: absolute; inset: 0; border-radius: 50%; background: ${CUA.gps}; opacity: 0.35;
  animation: lp-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes lp-pulse {
  0%   { transform: scale(0.45); opacity: 0.45; }
  70%  { transform: scale(1.9);  opacity: 0; }
  100% { transform: scale(1.9);  opacity: 0; }
}
@media (prefers-reduced-motion: reduce) { .lp-gps-pulse { animation: none; opacity: 0.25; } }

.lp-skeleton {
  position: absolute; inset: 0; z-index: 450; pointer-events: none; border-radius: 12px;
  background: linear-gradient(100deg, #e2e8f0 30%, #f1f5f9 50%, #e2e8f0 70%);
  background-size: 220% 100%; animation: lp-shimmer 1.4s ease-in-out infinite;
  transition: opacity 0.35s ease;
}
.lp-map--dark .lp-skeleton { background-image: linear-gradient(100deg, #1e293b 30%, #334155 50%, #1e293b 70%); }
@keyframes lp-shimmer { 0% { background-position: 180% 0; } 100% { background-position: -80% 0; } }
@media (prefers-reduced-motion: reduce) { .lp-skeleton { animation: none; } }

.lp-hint {
  position: absolute; top: 10px; left: 10px; z-index: 500; pointer-events: none;
  max-width: calc(100% - 70px);
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px);
  color: #fff; font-size: 11px; font-weight: 600; line-height: 1.4;
  padding: 5px 10px; border-radius: 999px;
}
.lp-hint svg { flex-shrink: 0; }

.lp-bar {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
  gap: 8px; margin-top: 10px; padding: 8px 12px; border-radius: 12px;
  background: #F8FAFC; border: 1px solid #E2E8F0;
}
.lp-map--dark .lp-bar { background: rgba(15, 23, 42, 0.6); border-color: #334155; }
.lp-bar-label {
  display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em; color: #64748B;
}
.lp-bar-coords {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px;
  font-weight: 600; color: ${CUA.navy}; font-variant-numeric: tabular-nums;
}
.lp-map--dark .lp-bar-coords { color: #E2E8F0; }
.lp-bar-chip {
  display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 999px;
  background: rgba(37, 99, 235, 0.1); color: #1D4ED8; font-size: 11px; font-weight: 700;
}
.lp-map--dark .lp-bar-chip { background: rgba(59, 130, 246, 0.2); color: #93C5FD; }
.lp-bar-btn {
  display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 8px;
  font-size: 11px; font-weight: 700; color: ${CUA.blue}; transition: background-color 0.15s ease;
}
.lp-bar-btn:hover:not(:disabled) { background: rgba(30, 58, 138, 0.08); }
.lp-bar-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.lp-map--dark .lp-bar-btn { color: #93C5FD; }
.lp-map--dark .lp-bar-btn:hover:not(:disabled) { background: rgba(59, 130, 246, 0.16); }
.lp-bar-empty { color: #94A3B8; font-size: 12px; font-style: italic; }
`;

/* -------------------------------------------------------------------------- */
/* Sous-composants Leaflet                                                     */
/* -------------------------------------------------------------------------- */

/** Recalcule la taille au montage / redimensionnement (corrige les tuiles grises). */
function MapResizer() {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize({ animate: false }), 80);
    const onResize = () => map.invalidateSize({ animate: false });
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [map]);

  return null;
}

/** Vol animé vers `position`, déclenché uniquement quand `signal` change. */
function FlyController({ signal, position, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (!signal || !isValidLatLng(position?.[0], position?.[1])) return;
    const target = zoom ?? Math.max(map.getZoom(), 17);
    map.flyTo([position[0], position[1]], target, { duration: 0.85, easeLinearity: 0.25 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signal]);

  return null;
}

/** Recentre sur le marqueur principal (bouton flottant). */
function RecenterController({ signal, position, zoom = 16 }) {
  const map = useMap();

  useEffect(() => {
    if (!signal || !isValidLatLng(position?.[0], position?.[1])) return;
    map.flyTo([position[0], position[1]], zoom, { duration: 0.7, easeLinearity: 0.25 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signal]);

  return null;
}

/** Clic sur la carte = déplacer le marqueur. */
function ClickPicker({ onPick }) {
  useMapEvents({
    click(e) {
      onPick?.({ lat: e.latlng.lat, lng: e.latlng.lng }, "click");
    },
  });
  return null;
}

/** Marqueur : déplaçable en mode édition, statique en lecture seule. */
function DraggableMarker({ position, onPick, readOnly }) {
  const markerRef = useRef(null);

  return (
    <Marker
      ref={markerRef}
      draggable={!readOnly}
      position={position}
      autoPan={!readOnly}
      eventHandlers={
        readOnly
          ? undefined
          : {
              dragend() {
                const marker = markerRef.current;
                if (!marker) return;
                const ll = marker.getLatLng();
                onPick?.({ lat: ll.lat, lng: ll.lng }, "drag");
              },
            }
      }
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Composant principal                                                        */
/* -------------------------------------------------------------------------- */

export default function LocationPickerMap({
  position = null,
  onPick,
  center = ANTANANARIVO_CENTER,
  zoom = 15,
  gps = null,
  locating = false,
  flyToSignal = 0,
  geojson = null,
  markers = [],
  dark = false,
  className = "",
  labels,
  onLocate,
  showQuartiers = true,
  initialQuartiers = true,
  showCoordinates = true,
  showCoordinateBar = true,
  showHint = true,
  readOnly = false,
  heightClass = "h-64 sm:h-96",
}) {
  const [ready, setReady] = useState(false);
  const [quartiersVisible, setQuartiersVisible] = useState(initialQuartiers);
  const [recenterSignal, setRecenterSignal] = useState(0);

  const txt = useMemo(() => ({ ...LABEL_DEFAULTS, ...(labels || {}) }), [labels]);

  useEffect(() => {
    if (showQuartiers) setQuartiersVisible(initialQuartiers);
  }, [showQuartiers, initialQuartiers]);

  const hasPosition = isValidLatLng(position?.[0], position?.[1]);
  const resolvedPosition = hasPosition ? [Number(position[0]), Number(position[1])] : center;
  const hasGps = isValidLatLng(gps?.lat, gps?.lng);
  const accuracy = hasGps && Number.isFinite(gps.accuracy) ? Math.round(gps.accuracy) : null;
  const hasGeo = Boolean(geojson && Array.isArray(geojson.features) && geojson.features.length > 0);

  const geoJsonKey = useMemo(
    () => (hasGeo ? JSON.stringify(geojson.features.map((f) => f.properties ?? {})) : "none"),
    [geojson, hasGeo],
  );

  const handleRecenter = useCallback(() => setRecenterSignal((n) => n + 1), []);

  /* Retrait du voile de chargement : à la 1re vague de tuiles, ou après 3 s max. */
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyCoords = useCallback(async () => {
    const text = `${formatCoord(resolvedPosition[0])}, ${formatCoord(resolvedPosition[1])}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toast.success(txt.copied);
    } catch {
      toast.error(txt.copyError);
    }
  }, [resolvedPosition, txt.copied, txt.copyError]);

  return (
    <div className={`lp-map ${dark ? "lp-map--dark" : ""} ${className}`}>
      <style>{STYLES}</style>

      <div
        className={`relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-600 ${heightClass}`}
      >
        <MapContainer
          center={resolvedPosition}
          zoom={zoom}
          className="h-full w-full"
          scrollWheelZoom
          zoomControl={false}
          maxZoom={19}
        >
          <TileLayer
            url={TILE_URL}
            attribution={TILE_ATTRIBUTION}
            eventHandlers={{ load: () => setReady(true) }}
          />

          <ZoomControl position="bottomright" />
          {showCoordinates && <ScaleControl position="bottomleft" imperial={false} />}

          <MapResizer />
          <FlyController signal={flyToSignal} position={resolvedPosition} />
          <RecenterController signal={recenterSignal} position={resolvedPosition} />
          {!readOnly && <ClickPicker onPick={onPick} />}

          {showQuartiers && quartiersVisible && hasGeo && (
            <GeoJSON
              key={geoJsonKey}
              data={geojson}
              style={{
                fillColor: CUA.gold,
                weight: 2,
                opacity: 1,
                color: CUA.goldDark,
                dashArray: "3",
                fillOpacity: 0.15,
              }}
              onEachFeature={(feature, layer) => {
                const props = feature.properties || {};
                const name = escapeHtml(props.nom_quartier ?? props.NOM_QUARTIER);
                const district = escapeHtml(props.nom_arrondissement ?? props.NOM_ARRONDISSEMENT);
                if (name) {
                  layer.bindPopup(
                    `<div style="text-align:center"><b>${name}</b>${
                      district ? `<br/><span style="color:#666">${district}</span>` : ""
                    }</div>`,
                  );
                }
                layer.on("mouseover", function onOver() {
                  this.setStyle({ fillOpacity: 0.35, weight: 3 });
                });
                layer.on("mouseout", function onOut() {
                  this.setStyle({ fillOpacity: 0.15, weight: 2 });
                });
              }}
            />
          )}

          {/* Cercle de précision GPS */}
          {hasGps && accuracy !== null && (
            <Circle
              center={[Number(gps.lat), Number(gps.lng)]}
              radius={Math.max(accuracy, 10)}
              pathOptions={{
                color: CUA.gps,
                weight: 1,
                opacity: 0.55,
                fillColor: CUA.gps,
                fillOpacity: 0.12,
              }}
            />
          )}

          {/* Halo pulsé de la position GPS (sous le marqueur principal) */}
          {hasGps && (
            <Marker
              position={[Number(gps.lat), Number(gps.lng)]}
              icon={gpsPulseIcon}
              interactive={false}
              zIndexOffset={-100}
            />
          )}

          {/* Marqueur de l'incident */}
          <DraggableMarker position={resolvedPosition} onPick={onPick} readOnly={readOnly} />

          {/* Autres doléances déjà enregistrées */}
          {markers.map((m) =>
            isValidLatLng(m.lat, m.lng) ? (
              <Marker
                key={m.id ?? `${m.lat}-${m.lng}`}
                position={[Number(m.lat), Number(m.lng)]}
                icon={L.divIcon({
                  className: "lp-dot-icon",
                  html: `<span style="display:block;background:${m.color || CUA.gold};width:12px;height:12px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></span>`,
                  iconSize: [12, 12],
                  iconAnchor: [6, 6],
                })}
              >
                <Popup>
                  <div className="text-xs">
                    {m.title && <p className="font-bold">{m.title}</p>}
                    {m.subtitle && <p className="text-slate-500">{m.subtitle}</p>}
                    {m.reference && (
                      <p className="text-slate-400">
                        {txt.refLabel} {m.reference}
                      </p>
                    )}
                    {m.badge && <p className="text-emerald-600 font-semibold mt-1">{m.badge}</p>}
                  </div>
                </Popup>
              </Marker>
            ) : null,
          )}
        </MapContainer>

        <div className="lp-skeleton" style={{ opacity: ready ? 0 : 1 }} aria-hidden={ready} />

        {/* Boutons flottants : GPS / recentrage / quartiers */}
        {!readOnly && (
          <div className="lp-overlay">
            {onLocate && (
              <button
                type="button"
                onClick={onLocate}
                disabled={locating}
                title={txt.locateMe}
                aria-label={txt.locateMe}
                className={`lp-fab lp-fab--gps ${hasGps ? "lp-fab--active" : ""}`}
              >
                {locating ? (
                  <span className="block w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                ) : (
                  <ArrowsPointingOutIcon className="w-5 h-5" />
                )}
              </button>
            )}
            {hasPosition && (
              <button
                type="button"
                onClick={handleRecenter}
                title={txt.recenter}
                aria-label={txt.recenter}
                className="lp-fab"
              >
                <MapPinIcon className="w-5 h-5" />
              </button>
            )}
            {showQuartiers && hasGeo && (
              <button
                type="button"
                onClick={() => setQuartiersVisible((v) => !v)}
                title={quartiersVisible ? txt.hideQuartiers : txt.showQuartiers}
                aria-label={quartiersVisible ? txt.hideQuartiers : txt.showQuartiers}
                aria-pressed={quartiersVisible}
                className={`lp-fab ${quartiersVisible ? "lp-fab--active" : ""}`}
              >
                <MapIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {showHint && txt.hint ? (
          <div className="lp-hint">
            <MapPinIcon className="w-3 h-3" />
            <span>{txt.hint}</span>
          </div>
        ) : null}
      </div>

      {/* Barre de coordonnées */}
      {showCoordinateBar && (
        <div className="lp-bar">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span className="lp-bar-label">
              <MapPinIcon className="w-3.5 h-3.5" />
              {txt.coordinates}
            </span>
            {hasPosition ? (
              <span className="lp-bar-coords">
                {formatCoord(resolvedPosition[0])}, {formatCoord(resolvedPosition[1])}
              </span>
            ) : (
              <span className="lp-bar-empty">{txt.noPosition}</span>
            )}
            {accuracy !== null && <span className="lp-bar-chip">± {accuracy} m</span>}
          </div>
          <button type="button" onClick={handleCopyCoords} disabled={!hasPosition} className="lp-bar-btn">
            {txt.copy}
          </button>
        </div>
      )}
    </div>
  );
}