"use client";

// Design tokens: map surfaces, borders, and marker colors inherit Altamar's
// olive/ivory system from globals.css so the control stays visually unified.

import { useEffect, useRef } from "react";

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

interface LocationPickerProps {
  value: LocationCoordinates | null;
  onChange: (coordinates: LocationCoordinates) => void;
}

const DOMINICAN_REPUBLIC_CENTER: [number, number] = [18.7357, -70.1627];

/**
 * Lightweight OpenStreetMap picker. It loads Leaflet only in the browser so
 * the admin form stays fast and the server never needs a maps API key.
 */
export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);
  const iconRef = useRef<import("leaflet").DivIcon | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let cancelled = false;

    async function initializeMap() {
      const leafletModule = await import("leaflet");
      if (cancelled || !containerRef.current) return;

      const L = leafletModule.default;
      const initialCenter: [number, number] = value
        ? [value.latitude, value.longitude]
        : DOMINICAN_REPUBLIC_CENTER;
      const map = L.map(containerRef.current, {
        center: initialCenter,
        zoom: value ? 14 : 7,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      const pinIcon = L.divIcon({
        className: "altamar-map-pin",
        html: "<span aria-hidden=\"true\"></span>",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      iconRef.current = pinIcon;

      const placeMarker = (latitude: number, longitude: number, notify = false) => {
        if (!markerRef.current) {
          markerRef.current = L.marker([latitude, longitude], {
            icon: pinIcon,
            keyboard: false,
          }).addTo(map);
        } else {
          markerRef.current.setLatLng([latitude, longitude]);
        }
        map.setView([latitude, longitude], Math.max(map.getZoom(), 14));
        if (notify) onChangeRef.current({ latitude, longitude });
      };

      if (value) placeMarker(value.latitude, value.longitude);
      map.on("click", (event) => placeMarker(event.latlng.lat, event.latlng.lng, true));
      mapRef.current = map;

      window.setTimeout(() => map.invalidateSize(), 0);
    }

    void initializeMap();

    return () => {
      cancelled = true;
      markerRef.current = null;
      iconRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // The picker mounts once per form. Value changes are handled below so the
    // map instance does not get recreated while the owner moves the pin.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!value || !mapRef.current || !iconRef.current) return;
    const nextPosition: [number, number] = [value.latitude, value.longitude];
    if (!markerRef.current) {
      // This branch is only reached when an existing product loads just after
      // Leaflet finishes initializing.
      return;
    }
    markerRef.current.setLatLng(nextPosition);
    mapRef.current.setView(nextPosition, Math.max(mapRef.current.getZoom(), 14));
  }, [value]);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Selector de ubicación"
      className="mt-4 h-[280px] w-full overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bone)] sm:h-[340px]"
    />
  );
}
