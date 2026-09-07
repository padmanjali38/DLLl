import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export interface SilkBackgroundProps {
  speed?: number;
  scale?: number;
  noiseIntensity?: number;
  className?: string;
  enableInteractive?: boolean;
}

// Minimal Orthographic Vertex Shader
const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// Fluid Dynamic Silk Wave Fragment Shader with Gerstner/Trochoidal Satin Harmonics
const fragmentShader = `
uniform float uTime;
uniform vec2 uResolution;
uniform float uSpeed;
uniform float uScale;
uniform float uNoiseIntensity;
uniform vec2 uPointer;
uniform float uScroll;
uniform float uScrollSpeed;

uniform vec3 uColorBase;
uniform vec3 uColorLightSilk;
uniform vec3 uColorWarmCream;
uniform vec3 uColorChampagne;
uniform vec3 uColorWarmBeige;
uniform vec3 uColorSoftShadow;
uniform vec3 uColorDeepShadow;

varying vec2 vUv;

// High quality 2D simplex noise
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Multi-harmonic Trochoidal Silk Wave Function
float calculateSilkWave(vec2 uv, float t) {
  // Diagonal fabric drape rotation (-35 deg)
  mat2 rot = mat2(0.819, -0.573, 0.573, 0.819);
  vec2 p = rot * uv * (1.1 * uScale);

  // Subtle interactive pointer & scroll wave offset
  p += uPointer * 0.12 * uNoiseIntensity;
  p.y += uScroll * 0.0008;

  // 1. Multi-pass domain warping to create organic cloth drape folds
  for (int i = 1; i <= 4; i++) {
    float fi = float(i);
    vec2 offset = vec2(
      sin(p.y * (1.15 * fi) + t * (0.65 / fi) + fi * 1.5),
      cos(p.x * (0.95 * fi) - t * (0.55 / fi) + fi * 2.1)
    );
    p += offset * (0.38 / fi);
  }

  // 2. Primary rolling wave (traveling diagonal billows)
  float wave1 = sin(p.x * 2.2 + p.y * 1.4 + t * 0.9);

  // 3. Secondary undulating cross-wave (creates transverse flowing satin folds)
  float wave2 = cos(p.y * 2.8 - p.x * 1.1 - t * 0.75);

  // 4. Trochoidal peak sharpener (creates crisp, luminous satin crests like real fabric)
  float crestWave = 1.0 - abs(sin(p.x * 3.1 + p.y * 1.8 + t * 1.15)) * 0.85;

  // 5. High-frequency micro-undulation for silky tactile sheen
  float microWave = sin(p.x * 5.4 - p.y * 3.2 + t * 1.4) * 0.25;

  // 6. Add gentle organic simplex noise turbulence
  float noiseDisplacement = snoise(p * 1.5 + vec2(t * 0.2, -t * 0.15)) * 0.35 * uNoiseIntensity;

  // Combine into fluid rolling wave height field
  float totalHeight = (wave1 * 0.48 + wave2 * 0.32 + crestWave * 0.28 + microWave * 0.15 + noiseDisplacement);
  
  // Extra dynamic response from scroll speed
  totalHeight += sin(p.x * 4.0 + t * 2.0) * (uScrollSpeed * 0.05);

  return totalHeight;
}

void main() {
  vec2 aspect = vec2(uResolution.x / min(uResolution.x, uResolution.y),
                     uResolution.y / min(uResolution.x, uResolution.y));
  vec2 uv = (vUv - 0.5) * aspect;

  float t = uTime * uSpeed * 0.95;

  // Center wave elevation
  float hCenter = calculateSilkWave(uv, t);

  // Analytical normal calculation for satin sheen & light reflections
  float eps = 0.005;
  float hRight = calculateSilkWave(uv + vec2(eps, 0.0), t);
  float hUp = calculateSilkWave(uv + vec2(0.0, eps), t);

  vec3 normal = normalize(vec3(
    (hCenter - hRight) * 5.0,
    (hCenter - hUp) * 5.0,
    1.0
  ));

  // Lighting directions (warm top-left key light + soft bottom-right ambient fill)
  vec3 keyLight = normalize(vec3(-0.6, 0.7, 0.5));
  vec3 fillLight = normalize(vec3(0.65, -0.45, 0.5));
  vec3 viewDir = vec3(0.0, 0.0, 1.0);

  // Diffuse components
  float diffKey = max(dot(normal, keyLight), 0.0);
  float diffFill = max(dot(normal, fillLight), 0.0);

  // Anisotropic Satin Specular Highlight along the diagonal fold lines
  vec3 halfVec = normalize(keyLight + viewDir);
  float specBase = max(dot(normal, halfVec), 0.0);
  float specular = pow(specBase, 18.0) * 0.52;

  // Strand anisotropic sheen effect
  vec3 tangent = normalize(vec3(0.819, 0.573, 0.0));
  float strandSpec = pow(clamp(1.0 - abs(dot(tangent, halfVec)), 0.0, 1.0), 8.0) * 0.28;

  // Normalize fold height to range [0.0, 1.0]
  float foldNorm = clamp(hCenter * 0.5 + 0.5, 0.0, 1.0);

  // Warm champagne satin color gradient mapping
  vec3 col = uColorChampagne;
  
  // Shadows in valleys (gentle caramel, warm beige and deep shadow)
  col = mix(uColorDeepShadow, col, smoothstep(0.04, 0.40, foldNorm));
  col = mix(uColorSoftShadow, col, smoothstep(0.14, 0.50, foldNorm));
  col = mix(col, uColorWarmBeige, smoothstep(0.28, 0.65, foldNorm));
  
  // Luminous silk highlights on ridges (cream and bright silk crests)
  col = mix(col, uColorWarmCream, smoothstep(0.48, 0.80, foldNorm));
  col = mix(col, uColorLightSilk, smoothstep(0.68, 0.98, foldNorm));

  // Apply satin specular highlight and subtle fill
  col += uColorLightSilk * ((specular + strandSpec) * 0.55 * uNoiseIntensity);
  col += uColorWarmCream * (diffFill * 0.05);

  // Subtle tactile grain
  float grain = (fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.015;
  col -= vec3(grain);

  gl_FragColor = vec4(col, 1.0);
}
`;

export const SilkBackground: React.FC<SilkBackgroundProps> = ({
  speed = 0.95,
  scale = 1.0,
  noiseIntensity = 0.7,
  className = '',
  enableInteractive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const effectiveSpeed = prefersReducedMotion ? 0.15 : speed;

    // Check WebGL availability
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglSupported(false);
      return;
    }

    if (!renderer || !renderer.domElement) {
      setWebglSupported(false);
      return;
    }

    const canvas = renderer.domElement;
    canvas.className = 'silk-canvas';
    container.appendChild(canvas);

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Warm Champagne Silk Color Palette precisely matched to Field Notes theme:
    const colorBase = new THREE.Color('#F2E8D6');
    const colorLightSilk = new THREE.Color('#F8F0E2');
    const colorWarmCream = new THREE.Color('#E9D9BF');
    const colorChampagne = new THREE.Color('#D8C19F');
    const colorWarmBeige = new THREE.Color('#C7AD89');
    const colorSoftShadow = new THREE.Color('#A99070');
    const colorDeepShadow = new THREE.Color('#92795B');

    const uniforms = {
      uTime: { value: 0.0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uSpeed: { value: effectiveSpeed },
      uScale: { value: scale },
      uNoiseIntensity: { value: noiseIntensity },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uScroll: { value: 0.0 },
      uScrollSpeed: { value: 0.0 },
      uColorBase: { value: new THREE.Vector3(colorBase.r, colorBase.g, colorBase.b) },
      uColorLightSilk: { value: new THREE.Vector3(colorLightSilk.r, colorLightSilk.g, colorLightSilk.b) },
      uColorWarmCream: { value: new THREE.Vector3(colorWarmCream.r, colorWarmCream.g, colorWarmCream.b) },
      uColorChampagne: { value: new THREE.Vector3(colorChampagne.r, colorChampagne.g, colorChampagne.b) },
      uColorWarmBeige: { value: new THREE.Vector3(colorWarmBeige.r, colorWarmBeige.g, colorWarmBeige.b) },
      uColorSoftShadow: { value: new THREE.Vector3(colorSoftShadow.r, colorSoftShadow.g, colorSoftShadow.b) },
      uColorDeepShadow: { value: new THREE.Vector3(colorDeepShadow.r, colorDeepShadow.g, colorDeepShadow.b) },
    };

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      depthWrite: false,
      depthTest: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const updateSize = () => {
      if (!renderer) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (width <= 0 || height <= 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      uniforms.uResolution.value.set(width * dpr, height * dpr);
    };

    updateSize();

    window.addEventListener('resize', updateSize);
    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(container);

    // Interactive pointer & scroll tracking with smooth damping
    let targetPointerX = 0;
    let targetPointerY = 0;
    let currentPointerX = 0;
    let currentPointerY = 0;

    let targetScroll = window.scrollY || 0;
    let currentScroll = targetScroll;
    let lastScrollY = targetScroll;
    let scrollVelocity = 0;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!enableInteractive) return;
      const clientX = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientY : (e as MouseEvent).clientY;
      targetPointerX = (clientX / window.innerWidth - 0.5) * 2.0;
      targetPointerY = -(clientY / window.innerHeight - 0.5) * 2.0;
    };

    const handleScroll = () => {
      targetScroll = window.scrollY || 0;
      const delta = targetScroll - lastScrollY;
      scrollVelocity = delta;
      lastScrollY = targetScroll;
    };

    if (enableInteractive) {
      window.addEventListener('mousemove', handlePointerMove, { passive: true });
      window.addEventListener('touchmove', handlePointerMove, { passive: true });
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      uniforms.uTime.value = elapsedTime;

      // Smooth pointer lerp
      currentPointerX += (targetPointerX - currentPointerX) * 0.05;
      currentPointerY += (targetPointerY - currentPointerY) * 0.05;
      uniforms.uPointer.value.set(currentPointerX, currentPointerY);

      // Smooth scroll lerp & decay scroll velocity
      currentScroll += (targetScroll - currentScroll) * 0.08;
      uniforms.uScroll.value = currentScroll;
      scrollVelocity *= 0.92;
      uniforms.uScrollSpeed.value = scrollVelocity;

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateSize);
      if (enableInteractive) {
        window.removeEventListener('mousemove', handlePointerMove);
        window.removeEventListener('touchmove', handlePointerMove);
        window.removeEventListener('scroll', handleScroll);
      }
      resizeObserver.disconnect();

      if (renderer) {
        if (canvas && container.contains(canvas)) {
          container.removeChild(canvas);
        }
        renderer.dispose();
        renderer.forceContextLoss();
      }

      geometry.dispose();
      material.dispose();
    };
  }, [speed, scale, noiseIntensity, enableInteractive]);

  return (
    <div
      ref={containerRef}
      id="silk-paper-background"
      className={`silk-background-container ${className}`}
      aria-hidden="true"
    >
      {!webglSupported && <div className="silk-fallback-paper" />}
    </div>
  );
};

export default SilkBackground;
