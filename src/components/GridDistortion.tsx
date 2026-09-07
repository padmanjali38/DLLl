import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useTheme } from '../utils/themeContext';

export interface GridDistortionProps {
  grid?: number;
  mouse?: number;
  strength?: number;
  relaxation?: number;
  className?: string;
  isFullBackground?: boolean;
}

// Custom WebGL Shaders for full-page fluid background distortion
const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D uTexture;
uniform sampler2D uDataTexture;
uniform vec2 uResolution;
uniform vec2 uImageResolution;
uniform float uStrength;
uniform float uTime;
uniform float uIsDark;
varying vec2 vUv;

vec2 getCoverUv(vec2 uv, vec2 screenRes, vec2 texRes) {
  float screenAspect = screenRes.x / max(screenRes.y, 0.0001);
  float texAspect = texRes.x / max(texRes.y, 0.0001);
  vec2 newUv = uv;
  if (screenAspect > texAspect) {
    float scale = texAspect / screenAspect;
    newUv.y = (uv.y - 0.5) * scale + 0.5;
  } else {
    float scale = screenAspect / texAspect;
    newUv.x = (uv.x - 0.5) * scale + 0.5;
  }
  return newUv;
}

void main() {
  vec4 offset = texture2D(uDataTexture, vUv);
  vec2 coverUv = getCoverUv(vUv, uResolution, uImageResolution);
  
  // Physical vector displacement that warps the background grid
  vec2 disp = offset.rg * uStrength;
  vec2 distortedUvR = clamp(coverUv - disp * 1.06, vec2(0.0001), vec2(0.9999));
  vec2 distortedUvG = clamp(coverUv - disp * 1.00, vec2(0.0001), vec2(0.9999));
  vec2 distortedUvB = clamp(coverUv - disp * 0.94, vec2(0.0001), vec2(0.9999));
  
  float r = texture2D(uTexture, distortedUvR).r;
  float g = texture2D(uTexture, distortedUvG).g;
  float b = texture2D(uTexture, distortedUvB).b;
  
  // Dynamic procedural grid lines that physically bend with the vector field
  vec2 gridUv = (distortedUvG * uResolution / 36.0);
  vec2 gridLine = abs(fract(gridUv - 0.5) - 0.5) / fwidth(gridUv);
  float line = min(gridLine.x, gridLine.y);
  float gridPattern = 1.0 - min(line, 1.0);
  
  vec3 baseColor = vec3(r, g, b);
  
  // Subtle glow on distorted zones
  float distortionMag = length(disp) * 20.0;
  
  vec3 lightAccent = vec3(0.31, 0.27, 0.90);
  vec3 darkAccent = vec3(0.145, 0.388, 0.922); // Electric blue #2563EB
  vec3 chosenAccent = mix(lightAccent, darkAccent, uIsDark);
  
  vec3 finalColor = mix(baseColor, chosenAccent, gridPattern * 0.16 + distortionMag * (uIsDark > 0.5 ? 0.40 : 0.30));
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

// Helper: Generates a seamless high-contrast technical blueprint in Light or Dark Neon aesthetic
function createBlueprintTexture(w = 1600, h = 1200, isDark = false): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  if (isDark) {
    // Dark Neon Mode: Deep Navy Black
    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0, 0, w, h);

    // Subtle Radial Glow in corner
    const grad = ctx.createRadialGradient(w * 0.2, h * 0.2, 50, w * 0.2, h * 0.2, 600);
    grad.addColorStop(0, 'rgba(37, 99, 235, 0.15)');
    grad.addColorStop(1, 'rgba(11, 17, 32, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Background Grid Lines
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
    ctx.lineWidth = 1;
    const step = 36;
    for (let x = 0; x <= w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Accent Major Grid Lines
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.25)';
    ctx.lineWidth = 1.5;
    const majorStep = 180;
    for (let x = 0; x <= w; x += majorStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += majorStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Coordinate Crosshairs & Dots (Cyan Neon)
    ctx.fillStyle = 'rgba(34, 211, 238, 0.35)';
    for (let x = step; x < w; x += step * 2) {
      for (let y = step; y < h; y += step * 2) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Corner Crosshairs on Major Grid Intersections
    const drawCross = (cx: number, cy: number) => {
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy);
      ctx.lineTo(cx + 8, cy);
      ctx.moveTo(cx, cy - 8);
      ctx.lineTo(cx, cy + 8);
      ctx.stroke();
    };

    for (let x = majorStep; x < w; x += majorStep * 2) {
      for (let y = majorStep; y < h; y += majorStep * 2) {
        drawCross(x, y);
      }
    }

    // Left Diagram: Hash Array Representation (Dark Neon)
    const leftX = 100;
    const leftY = 200;
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(leftX, leftY, 320, 480);
    ctx.fillStyle = 'rgba(17, 24, 39, 0.7)';
    ctx.fillRect(leftX, leftY, 320, 480);

    for (let i = 0; i < 8; i++) {
      const sy = leftY + i * 60;
      ctx.strokeRect(leftX, sy, 320, 60);
      ctx.fillStyle = 'rgba(34, 211, 238, 0.6)';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`[0${i}] h(k) = (${i * 17}) % 8`, leftX + 16, sy + 36);
    }

    // Right Diagram: Collision Leap Trajectory
    const rightX = w - 420;
    const rightY = 240;
    ctx.strokeRect(rightX, rightY, 320, 360);
    ctx.fillStyle = 'rgba(17, 24, 39, 0.7)';
    ctx.fillRect(rightX, rightY, 320, 360);

    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(rightX + 40, rightY + 80);
    ctx.bezierCurveTo(rightX + 180, rightY + 20, rightX + 220, rightY + 200, rightX + 260, rightY + 280);
    ctx.stroke();
    ctx.setLineDash([]);

    // Center Math Ring Matrix
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.25)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 220, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 340, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Blueprint Borders
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    return canvas;
  }

  // Light Mode: Clean Slate White (100% Unchanged)
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 0, w, h);

  // Background Grid Lines
  ctx.strokeStyle = 'rgba(203, 213, 225, 0.45)';
  ctx.lineWidth = 1;
  const step = 36;
  for (let x = 0; x <= w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Accent Major Grid Lines
  ctx.strokeStyle = 'rgba(79, 70, 229, 0.10)';
  ctx.lineWidth = 1.5;
  const majorStep = 180;
  for (let x = 0; x <= w; x += majorStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += majorStep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Coordinate Crosshairs & Dots
  ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
  for (let x = step; x < w; x += step * 2) {
    for (let y = step; y < h; y += step * 2) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Corner Crosshairs on Major Grid Intersections
  const drawCross = (cx: number, cy: number) => {
    ctx.strokeStyle = 'rgba(79, 70, 229, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy);
    ctx.lineTo(cx + 8, cy);
    ctx.moveTo(cx, cy - 8);
    ctx.lineTo(cx, cy + 8);
    ctx.stroke();
  };

  for (let x = majorStep; x < w; x += majorStep * 2) {
    for (let y = majorStep; y < h; y += majorStep * 2) {
      drawCross(x, y);
    }
  }

  // Left Diagram: Hash Array Representation
  const leftX = 100;
  const leftY = 200;
  ctx.strokeStyle = 'rgba(79, 70, 229, 0.12)';
  ctx.lineWidth = 2;
  ctx.strokeRect(leftX, leftY, 320, 480);
  ctx.fillStyle = 'rgba(79, 70, 229, 0.02)';
  ctx.fillRect(leftX, leftY, 320, 480);

  for (let i = 0; i < 8; i++) {
    const sy = leftY + i * 60;
    ctx.strokeRect(leftX, sy, 320, 60);
    ctx.fillStyle = 'rgba(100, 116, 139, 0.4)';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`[0${i}] h(k) = (${i * 17}) % 8`, leftX + 16, sy + 36);
  }

  // Right Diagram: Collision Leap Trajectory
  const rightX = w - 420;
  const rightY = 240;
  ctx.strokeRect(rightX, rightY, 320, 360);
  ctx.fillStyle = 'rgba(79, 70, 229, 0.02)';
  ctx.fillRect(rightX, rightY, 320, 360);

  ctx.strokeStyle = 'rgba(79, 70, 229, 0.25)';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(rightX + 40, rightY + 80);
  ctx.bezierCurveTo(rightX + 180, rightY + 20, rightX + 220, rightY + 200, rightX + 260, rightY + 280);
  ctx.stroke();
  ctx.setLineDash([]);

  // Center Math Ring Matrix
  ctx.strokeStyle = 'rgba(79, 70, 229, 0.15)';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, 220, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, 340, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Dashboard Blueprint Borders
  ctx.strokeStyle = 'rgba(226, 232, 240, 0.8)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(20, 20, w - 40, h - 40);

  return canvas;
}

export const GridDistortion: React.FC<GridDistortionProps> = ({
  grid = 24,
  mouse = 0.16,
  strength = 0.38,
  relaxation = 0.91,
  className = '',
  isFullBackground = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.Camera | null = null;
    let material: THREE.ShaderMaterial | null = null;
    let geometry: THREE.PlaneGeometry | null = null;
    let mesh: THREE.Mesh | null = null;
    let dataTexture: THREE.DataTexture | null = null;
    let canvasTexture: THREE.CanvasTexture | null = null;
    let animationFrameId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let time = 0;
    let idlePulse = 0;
    let userHasMoved = false;

    const gridSize = Math.max(12, Math.min(64, grid));
    const dataArray = new Float32Array(gridSize * gridSize * 4);

    dataTexture = new THREE.DataTexture(
      dataArray,
      gridSize,
      gridSize,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    dataTexture.needsUpdate = true;

    scene = new THREE.Scene();
    camera = new THREE.Camera();

    const canvas = createBlueprintTexture(1600, 1200, isDark);
    canvasTexture = new THREE.CanvasTexture(canvas);
    canvasTexture.minFilter = THREE.LinearFilter;
    canvasTexture.magFilter = THREE.LinearFilter;
    canvasTexture.generateMipmaps = false;

    const initialW = container.clientWidth || window.innerWidth || 1200;
    const initialH = container.clientHeight || window.innerHeight || 900;

    const uniforms = {
      uTexture: { value: canvasTexture },
      uDataTexture: { value: dataTexture },
      uResolution: { value: new THREE.Vector2(initialW, initialH) },
      uImageResolution: { value: new THREE.Vector2(1600, 1200) },
      uStrength: { value: strength },
      uTime: { value: 0 },
      uIsDark: { value: isDark ? 1.0 : 0.0 },
    };

    material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: false,
    });

    geometry = new THREE.PlaneGeometry(2, 2);
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: false,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(initialW, initialH);
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.top = '0';
      renderer.domElement.style.left = '0';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.pointerEvents = 'none'; // Crucial: allows clicks through to text/buttons
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL init error:', e);
      return;
    }

    const handleResize = () => {
      if (!container || !renderer || !material) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w <= 0 || h <= 0) return;
      renderer.setSize(w, h);
      material.uniforms.uResolution.value.set(w, h);
    };

    const mousePos = { prevX: 0.5, prevY: 0.5 };

    const applyImpulse = (normX: number, normY: number, dx: number, dy: number, force = 30.0) => {
      if (!dataTexture) return;
      const radius = Math.max(0.08, mouse);

      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const u = i / (gridSize - 1);
          const v = j / (gridSize - 1);
          const dist = Math.hypot(u - normX, v - normY);

          if (dist < radius) {
            const falloff = 1.0 - dist / radius;
            const power = Math.cos((dist / radius) * Math.PI * 0.5) * falloff;
            const idx = 4 * (j * gridSize + i);
            dataArray[idx] += dx * power * force;
            dataArray[idx + 1] += dy * power * force;
          }
        }
      }
    };

    const onGlobalPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!container || !dataTexture) return;
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const clientX = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientY : (e as MouseEvent).clientY;

      const normX = (clientX - rect.left) / rect.width;
      const normY = 1.0 - (clientY - rect.top) / rect.height;

      if (normX < 0 || normX > 1 || normY < 0 || normY > 1) return;

      userHasMoved = true;

      const dx = normX - mousePos.prevX;
      const dy = normY - mousePos.prevY;
      mousePos.prevX = normX;
      mousePos.prevY = normY;

      applyImpulse(normX, normY, dx, dy, 36.0);
    };

    // Attach to window so moving anywhere over the whole home page distorts the background grid
    window.addEventListener('mousemove', onGlobalPointerMove, { passive: true });
    window.addEventListener('touchmove', onGlobalPointerMove, { passive: true });

    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    setTimeout(handleResize, 50);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      time += 0.02;

      if (material) {
        material.uniforms.uTime.value = time;
      }

      // Idle gentle undulating wave before user mouse interaction
      if (!userHasMoved) {
        idlePulse += 0.035;
        const waveX = 0.5 + Math.sin(idlePulse * 1.3) * 0.35;
        const waveY = 0.5 + Math.cos(idlePulse * 1.6) * 0.3;
        const waveDx = Math.cos(idlePulse * 1.3) * 0.009;
        const waveDy = -Math.sin(idlePulse * 1.6) * 0.009;
        applyImpulse(waveX, waveY, waveDx, waveDy, 12.0);
      }

      // Decay relaxation
      if (dataTexture) {
        const decay = Math.min(0.98, Math.max(0.6, relaxation));
        for (let i = 0; i < gridSize * gridSize; i++) {
          dataArray[i * 4] *= decay;
          dataArray[i * 4 + 1] *= decay;
        }
        dataTexture.needsUpdate = true;
      }

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };

    animate();

    return () => {
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('mousemove', onGlobalPointerMove);
      window.removeEventListener('touchmove', onGlobalPointerMove);

      if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      if (canvasTexture) canvasTexture.dispose();
      if (dataTexture) dataTexture.dispose();
      if (geometry) geometry.dispose();
      if (material) material.dispose();
      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
      }
    };
  }, [grid, mouse, strength, relaxation, isDark]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-0 ${className}`}
      aria-hidden="true"
    />
  );
};

export default GridDistortion;
