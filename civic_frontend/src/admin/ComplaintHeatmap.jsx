import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import axios from "axios";

const HeatLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {

    if (!points.length) return;

    // ✅ DEFINE FIRST
    const heatPoints = points.map(p => [
      p.lat,
      p.lng,
      p.intensity
    ]);

    // optional debug
    console.log("Heatmap points:", heatPoints);

    const heat = L.heatLayer(heatPoints, {
      radius: 50,
      blur: 35,
      maxZoom: 18,
      gradient: {
        0.1: "blue",
        0.3: "lime",
        0.5: "yellow",
        0.7: "orange",
        1.0: "red"
      }
    });

    heat.addTo(map);

    return () => {
      map.removeLayer(heat);
    };

  }, [points, map]);

  return null;
};
export default function ComplaintHeatmap() {

  const [points, setPoints] = useState([]);

  useEffect(() => {
 
    const fetchHeatmap = () => {
      axios
        .get("http://127.0.0.1:8000/api/complaints/heatmap/")
        .then(res => {
          setPoints(res.data.points);
        })
        .catch(err => console.error(err));
    };

    fetchHeatmap();

    const interval = setInterval(fetchHeatmap, 5000);

    return () => clearInterval(interval);

  }, []);

  return (
    <MapContainer
  center={[23.2599, 77.4126]}
  zoom={12}
  scrollWheelZoom={true}
  style={{ height: "1000px", width: "100%" }}
>
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <HeatLayer points={points} />

    </MapContainer>
  );
}