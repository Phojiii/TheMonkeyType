'use client';

import Snowfall from "react-snowfall";

export default function SnowfallClient() {
  return (
    <Snowfall
      color="#E2B714"
      snowflakeCount={80}
      style={{
        position: "fixed",
        width: "100vw",
        height: "100vh",
        zIndex: 1,
        pointerEvents: "none",
      }}
    />
  );
}
