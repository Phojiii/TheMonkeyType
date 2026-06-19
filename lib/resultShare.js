function formatMetaLabel(stats) {
  const testType = stats?.testType === "words" ? "words" : "time";
  if (testType === "words") {
    return `${Number(stats?.targetWordCount || 0)} words`;
  }
  return `${Number(stats?.duration || 60)}s`;
}

function drawRoundedRect(ctx, x, y, width, height, radius, fillStyle, strokeStyle = "") {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();

  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }

  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
  }
}

function drawStat(ctx, label, value, x, y) {
  ctx.fillStyle = "rgba(255,255,255,0.38)";
  ctx.font = "24px Roboto Mono, monospace";
  ctx.fillText(label, x, y);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 56px Roboto Mono, monospace";
  ctx.fillText(String(value), x, y + 62);
}

export async function buildResultShareAsset({ stats, username = "Typist" }) {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 900;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");

  const modeLabel = String(stats?.mode || "classic").toLowerCase() === "competitive" ? "Competitive" : "Classic";
  const testType = stats?.testType === "words" ? "words" : "time";
  const metaLabel = formatMetaLabel(stats);

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#232427");
  gradient.addColorStop(1, "#18191b");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawRoundedRect(ctx, 48, 48, canvas.width - 96, canvas.height - 96, 34, "rgba(255,255,255,0.035)", "rgba(255,255,255,0.08)");
  drawRoundedRect(ctx, 78, 78, 220, 58, 28, "#E2B714");
  ctx.fillStyle = "#232427";
  ctx.font = "bold 28px Roboto Mono, monospace";
  ctx.fillText(modeLabel, 116, 116);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 74px Roboto Mono, monospace";
  ctx.fillText(`${username}'s Result`, 80, 220);

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "28px Roboto Mono, monospace";
  ctx.fillText(`${metaLabel} • ${testType === "words" ? "Word mode" : "Timed mode"}`, 82, 268);

  drawRoundedRect(ctx, 82, 330, 680, 220, 28, "rgba(255,255,255,0.04)");
  drawRoundedRect(ctx, 840, 330, 680, 220, 28, "rgba(255,255,255,0.04)");

  drawStat(ctx, "WPM", Number(stats?.wpm || 0).toFixed(0), 128, 405);
  drawStat(ctx, "Accuracy", `${Number(stats?.accuracy || 0).toFixed(1)}%`, 400, 405);
  drawStat(
    ctx,
    testType === "words" ? "Time" : "Words",
    testType === "words" ? `${Number(stats?.elapsedSec || 0).toFixed(1)}s` : Number(stats?.words || 0).toFixed(0),
    930,
    405
  );
  drawStat(ctx, "Characters", Number(stats?.characters ?? stats?.hits ?? 0), 1200, 405);

  drawRoundedRect(ctx, 82, 590, 1438, 170, 28, "rgba(255,255,255,0.04)");
  drawStat(ctx, "Backspaces", Number(stats?.backspaces || 0), 130, 660);
  drawStat(
    ctx,
    testType === "words" ? "Target" : "Duration",
    testType === "words" ? `${Number(stats?.targetWordCount || 0)} words` : `${Number(stats?.duration || 60)}s`,
    610,
    660
  );

  ctx.fillStyle = "rgba(255,255,255,0.68)";
  ctx.font = "28px Roboto Mono, monospace";
  ctx.fillText(new Date().toLocaleString(), 82, 818);

  ctx.fillStyle = "#E2B714";
  ctx.font = "bold 30px Roboto Mono, monospace";
  ctx.fillText("TheMonkeyType.com", 1190, 818);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 1));
  if (!blob) throw new Error("Failed to generate result image.");

  const file = new File([blob], `themonkeytype-result-${Date.now()}.png`, { type: "image/png" });
  return { blob, file };
}
