// High-precision canvas artwork for Hash Quest hero section
// Rendered in the Field Notes visual identity: warm ivory, charcoal lines, orange accents,
// depicting hash tables, memory slots, collision vectors, chaining links, and algorithm metrics.

export function createHashQuestHeroCanvas(width: number = 1200, height: number = 900): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Background
  ctx.fillStyle = '#FAF6EE';
  ctx.fillRect(0, 0, width, height);

  // Tech Grid Background
  ctx.strokeStyle = 'rgba(24, 24, 24, 0.06)';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Grid Points
  ctx.fillStyle = 'rgba(24, 24, 24, 0.12)';
  for (let x = 20; x < width; x += 40) {
    for (let y = 20; y < height; y += 40) {
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Outer Border
  ctx.strokeStyle = 'rgba(24, 24, 24, 0.25)';
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  // Corner Crosshairs
  const drawCrosshair = (cx: number, cy: number) => {
    ctx.strokeStyle = '#E85A1D';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy);
    ctx.lineTo(cx + 10, cy);
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx, cy + 10);
    ctx.stroke();
  };
  drawCrosshair(30, 30);
  drawCrosshair(width - 30, 30);
  drawCrosshair(30, height - 30);
  drawCrosshair(width - 30, height - 30);

  // Header Stamp
  ctx.fillStyle = '#181818';
  ctx.fillRect(60, 60, 240, 30);
  ctx.fillStyle = '#FAF6EE';
  ctx.font = 'bold 12px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText('FIELD NOTE // ARCH-01', 75, 80);

  ctx.fillStyle = '#66625B';
  ctx.font = 'bold 12px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText('COLLISION RESOLUTION TOPOLOGY', 320, 80);

  // Dimension lines
  ctx.strokeStyle = 'rgba(24, 24, 24, 0.2)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(60, 110);
  ctx.lineTo(width - 60, 110);
  ctx.moveTo(60, height - 70);
  ctx.lineTo(width - 60, height - 70);
  ctx.stroke();
  ctx.setLineDash([]);

  // -------------------------------------------------------------
  // Left: Hash Table Structure
  // -------------------------------------------------------------
  const tableX = 80;
  const tableY = 150;
  const tableW = 460;

  // Table Title Bar
  ctx.fillStyle = '#181818';
  ctx.fillRect(tableX + 4, tableY + 5, tableW, 46); // Shadow
  ctx.fillStyle = '#ECE5D8';
  ctx.strokeStyle = '#181818';
  ctx.lineWidth = 2;
  ctx.fillRect(tableX, tableY, tableW, 46);
  ctx.strokeRect(tableX, tableY, tableW, 46);

  ctx.fillStyle = '#181818';
  ctx.font = 'bold 16px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText('HASH_TABLE [SIZE = 10]', tableX + 20, tableY + 28);

  ctx.fillStyle = '#E85A1D';
  ctx.font = 'bold 13px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText('h(k) = k % 10', tableX + 320, tableY + 28);

  // Slots
  const slots = [
    { idx: '0', val: 'KEY: 50', calc: 'h(50)=0', state: 'occupied' },
    { idx: '1', val: '-- EMPTY --', calc: '', state: 'empty' },
    { idx: '2', val: 'KEY: 42', calc: 'h(42)=2', state: 'occupied' },
    { idx: '3', val: 'KEY: 83', calc: 'h(83)=3', state: 'occupied' },
    { idx: '4', val: 'KEY: 14 [COLLISION!]', calc: 'h(14)=4', state: 'collision' },
    { idx: '5', val: 'KEY: 94 [RESOLVED]', calc: 'probe: +1', state: 'resolved' },
    { idx: '6', val: 'KEY: 26', calc: 'h(26)=6', state: 'occupied' },
  ];

  let currentY = tableY + 58;
  slots.forEach((s) => {
    const slotH = 50;

    // Drop shadow
    ctx.fillStyle = '#181818';
    ctx.fillRect(tableX + 3, currentY + 3, tableW, slotH);

    // Slot Box
    if (s.state === 'collision') {
      ctx.fillStyle = '#FFF5F0';
    } else if (s.state === 'resolved') {
      ctx.fillStyle = '#F4EFEB';
    } else {
      ctx.fillStyle = '#FAF6EE';
    }
    ctx.fillRect(tableX, currentY, tableW, slotH);
    ctx.strokeStyle = s.state === 'collision' ? '#E85A1D' : '#181818';
    ctx.lineWidth = 2;
    ctx.strokeRect(tableX, currentY, tableW, slotH);

    // Index Box
    ctx.fillStyle = s.state === 'collision' ? '#E85A1D' : '#181818';
    ctx.fillRect(tableX, currentY, 60, slotH);

    ctx.fillStyle = '#FAF6EE';
    ctx.font = 'bold 15px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillText(`[${s.idx}]`, tableX + 18, currentY + 31);

    // Value & Status
    if (s.state === 'empty') {
      ctx.fillStyle = '#8C827A';
      ctx.font = 'italic 13px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.fillText(s.val, tableX + 80, currentY + 30);
    } else {
      ctx.fillStyle = s.state === 'collision' ? '#E85A1D' : '#181818';
      ctx.font = 'bold 14px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.fillText(s.val, tableX + 80, currentY + 30);

      if (s.calc) {
        ctx.fillStyle = '#66625B';
        ctx.font = '12px ui-monospace, SFMono-Regular, Menlo, monospace';
        ctx.fillText(s.calc, tableX + 330, currentY + 30);
      }
    }

    currentY += slotH + 8;
  });

  // -------------------------------------------------------------
  // Right Top: Collision Resolution Probe Leap (Vector Flow)
  // -------------------------------------------------------------
  const flowX = 600;
  const flowY = 150;
  const flowW = 520;
  const flowH = 290;

  // Box
  ctx.fillStyle = '#181818';
  ctx.fillRect(flowX + 4, flowY + 5, flowW, flowH);
  ctx.fillStyle = '#FAF6EE';
  ctx.fillRect(flowX, flowY, flowW, flowH);
  ctx.strokeStyle = '#181818';
  ctx.lineWidth = 2;
  ctx.strokeRect(flowX, flowY, flowW, flowH);

  // Flow Title
  ctx.fillStyle = '#181818';
  ctx.fillRect(flowX, flowY, flowW, 36);
  ctx.fillStyle = '#FAF6EE';
  ctx.font = 'bold 13px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText('COLLISION PROBING TRAJECTORY', flowX + 18, flowY + 23);

  ctx.fillStyle = '#E85A1D';
  ctx.fillText('LINEAR // QUADRATIC // DOUBLE', flowX + 270, flowY + 23);

  // Incoming Key 94
  ctx.fillStyle = '#181818';
  ctx.fillRect(flowX + 30, flowY + 70, 110, 40);
  ctx.fillStyle = '#FAF6EE';
  ctx.font = 'bold 14px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText('INSERT: 94', flowX + 45, flowY + 95);

  // Hash Function Arrow
  ctx.strokeStyle = '#181818';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(flowX + 140, flowY + 90);
  ctx.lineTo(flowX + 210, flowY + 90);
  ctx.stroke();

  // Modulo Box
  ctx.fillStyle = '#ECE5D8';
  ctx.fillRect(flowX + 210, flowY + 68, 120, 44);
  ctx.strokeStyle = '#181818';
  ctx.strokeRect(flowX + 210, flowY + 68, 120, 44);
  ctx.fillStyle = '#181818';
  ctx.font = 'bold 13px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText('94 % 10 = 4', flowX + 225, flowY + 94);

  // Arrow to Slot 4 (Collision)
  ctx.strokeStyle = '#E85A1D';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(flowX + 330, flowY + 90);
  ctx.lineTo(flowX + 410, flowY + 90);
  ctx.stroke();

  // Collision Badge
  ctx.fillStyle = '#E85A1D';
  ctx.fillRect(flowX + 410, flowY + 70, 90, 40);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 12px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText('SLOT [4]', flowX + 425, flowY + 88);
  ctx.fillText('OCCUPIED', flowX + 420, flowY + 102);

  // Curved Leap Arc to Slot 5
  ctx.strokeStyle = '#E85A1D';
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 3]);
  ctx.beginPath();
  ctx.moveTo(flowX + 455, flowY + 115);
  ctx.bezierCurveTo(flowX + 480, flowY + 180, flowX + 320, flowY + 200, flowX + 250, flowY + 180);
  ctx.stroke();
  ctx.setLineDash([]);

  // Probing Leap Formula
  ctx.fillStyle = '#181818';
  ctx.fillRect(flowX + 30, flowY + 150, 460, 32);
  ctx.fillStyle = '#FAF6EE';
  ctx.font = 'bold 12px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText('PROBE STEP: h(k, 1) = (h(k) + 1) % 10 = 5  →  FREE SLOT!', flowX + 45, flowY + 171);

  // Mathematical Specs
  ctx.fillStyle = '#66625B';
  ctx.font = '12px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText('Linear Probing:    h(k, i) = (h(k) + i) % m', flowX + 30, flowY + 215);
  ctx.fillText('Quadratic Probing: h(k, i) = (h(k) + c1·i + c2·i²) % m', flowX + 30, flowY + 235);
  ctx.fillText('Double Hashing:    h(k, i) = (h1(k) + i · h2(k)) % m', flowX + 30, flowY + 255);

  // Status Bar
  ctx.fillStyle = '#E85A1D';
  ctx.fillRect(flowX + 30, flowY + 265, flowW - 60, 16);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 10px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText('✓ COLLISION SAFELY RESOLVED IN 1 HOP (i=1)', flowX + 45, flowY + 277);

  // -------------------------------------------------------------
  // Right Bottom: Algorithm Complexity & Load Factor Metrics
  // -------------------------------------------------------------
  const metricsX = 600;
  const metricsY = 470;
  const metricsW = 520;
  const metricsH = 260;

  ctx.fillStyle = '#181818';
  ctx.fillRect(metricsX + 4, metricsY + 5, metricsW, metricsH);
  ctx.fillStyle = '#ECE5D8';
  ctx.fillRect(metricsX, metricsY, metricsW, metricsH);
  ctx.strokeStyle = '#181818';
  ctx.lineWidth = 2;
  ctx.strokeRect(metricsX, metricsY, metricsW, metricsH);

  // Complexity Circle Diagram
  const circleX = metricsX + 90;
  const circleY = metricsY + 130;

  ctx.strokeStyle = 'rgba(24, 24, 24, 0.3)';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(circleX, circleY, 65, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = '#E85A1D';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(circleX, circleY, 45, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#E85A1D';
  ctx.font = 'bold 22px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText('Θ(1)', circleX - 22, circleY + 8);

  ctx.fillStyle = '#181818';
  ctx.font = 'bold 10px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText('AVG LOOKUP', circleX - 32, circleY + 28);

  // Metric Text details
  const textX = metricsX + 180;
  ctx.fillStyle = '#181818';
  ctx.font = 'bold 16px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText('ASYMPTOTIC SPECIFICATIONS', textX, metricsY + 45);

  ctx.fillStyle = '#44403C';
  ctx.font = '13px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText('• Search / Insert / Delete (Avg):  O(1) Constant', textX, metricsY + 80);
  ctx.fillText('• Worst Case Clustering:          O(N) Linear', textX, metricsY + 110);
  ctx.fillText('• Current Load Factor α (N/M):    0.60 (6/10)', textX, metricsY + 140);
  ctx.fillText('• Dynamic Rehash Threshold:       α ≥ 0.75', textX, metricsY + 170);

  // Progress Bar for Load factor
  ctx.fillStyle = '#FAF6EE';
  ctx.fillRect(textX, metricsY + 195, 290, 20);
  ctx.strokeStyle = '#181818';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(textX, metricsY + 195, 290, 20);

  ctx.fillStyle = '#E85A1D';
  ctx.fillRect(textX + 2, metricsY + 197, 290 * 0.6, 16);

  ctx.fillStyle = '#181818';
  ctx.font = 'bold 10px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText('LOAD 60%', textX + 300, metricsY + 210);

  // Footer Tag
  ctx.fillStyle = '#181818';
  ctx.font = 'bold 12px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText('HASH QUEST // INTERACTIVE ENGINE v2.6', 60, height - 40);

  ctx.fillStyle = '#66625B';
  ctx.fillText('MATRIX: 1200 x 900 px', width - 220, height - 40);

  return canvas;
}

export function createHashQuestHeroSvg(): string {
  if (typeof document !== 'undefined') {
    try {
      const c = createHashQuestHeroCanvas(1200, 900);
      return c.toDataURL('image/png');
    } catch {
      // Ignore
    }
  }
  return '';
}
