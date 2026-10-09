import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { TessellateModifier } from 'three/addons/modifiers/TessellateModifier.js';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import * as THREE from 'three/webgpu';
import {
  Fn,
  If,
  cameraPosition,
  clamp,
  cos,
  dot,
  float,
  hash,
  instanceIndex,
  instancedArray,
  max,
  mix,
  mx_noise_float,
  normalLocal,
  normalWorld,
  positionLocal,
  positionWorld,
  pow,
  shapeCircle,
  sin,
  time,
  uniform,
  uv,
  vec3,
} from 'three/tsl';
import { createSeasonLightLut, dayOfYearProgress, sampleSeasonLightLut } from './sceneSeasonEngine';
import { PearBrandMark } from '@/icons/PearBrandMark';
import pearMarkSvg from '@/icons/pear-icon.svg?raw';
import { resolveHemisphereSync } from '@/lib/seasonColors';

extend(THREE);

const TAU = Math.PI * 2;
const TIER_ORDER = ['low', 'mid', 'high'];
const TIER_CONFIG = {
  high: { dpr: [1, 1.5], particles: 120_000, fallbackParticles: 24_000 },
  mid: { dpr: [1, 1.25], particles: 24_000, fallbackParticles: 6_000 },
  low: { dpr: 1, particles: 0 },
};
const PEAR_MARK_SCALE = 0.00245;
const PEAR_MARK_HALF_DEPTH = 210;
let pearMarkGeometryCache;

function shapeBounds(shape) {
  const points = shape.getPoints(1);
  const bounds = points.reduce(
    (result, point) => ({
      minX: Math.min(result.minX, point.x),
      maxX: Math.max(result.maxX, point.x),
      minY: Math.min(result.minY, point.y),
      maxY: Math.max(result.maxY, point.y),
    }),
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
  );

  return {
    ...bounds,
    centerX: (bounds.minX + bounds.maxX) / 2,
    centerY: (bounds.minY + bounds.maxY) / 2,
  };
}

function distanceToContour(x, y, contour) {
  let minimumSquaredDistance = Infinity;

  for (let index = 0; index < contour.length; index += 1) {
    const start = contour[index];
    const end = contour[(index + 1) % contour.length];
    const edgeX = end.x - start.x;
    const edgeY = end.y - start.y;
    const edgeLengthSquared = edgeX * edgeX + edgeY * edgeY;
    const projection = edgeLengthSquared
      ? Math.min(
          1,
          Math.max(0, ((x - start.x) * edgeX + (y - start.y) * edgeY) / edgeLengthSquared),
        )
      : 0;
    const offsetX = x - (start.x + edgeX * projection);
    const offsetY = y - (start.y + edgeY * projection);
    minimumSquaredDistance = Math.min(
      minimumSquaredDistance,
      offsetX * offsetX + offsetY * offsetY,
    );
  }

  return Math.sqrt(minimumSquaredDistance);
}

function createRoundedPearBody(shape, bounds) {
  const sourceContour = shape.getPoints(1);
  const contour = sourceContour.filter((_, index) => index % 3 === 0);
  if (contour.at(-1) !== sourceContour.at(-1)) contour.push(sourceContour.at(-1));
  const flatGeometry = new THREE.ShapeGeometry(new THREE.Shape(contour), 1);
  const tessellatedGeometry = new TessellateModifier(72, 5).modify(flatGeometry);
  flatGeometry.dispose();

  const flatPositions = tessellatedGeometry.getAttribute('position');
  const distances = new Float32Array(flatPositions.count);
  let maximumDistance = 0;

  for (let index = 0; index < flatPositions.count; index += 1) {
    const distance = distanceToContour(
      flatPositions.getX(index),
      flatPositions.getY(index),
      contour,
    );
    distances[index] = distance;
    maximumDistance = Math.max(maximumDistance, distance);
  }

  const surfaceDepth = (x, y) => {
    const distance = distanceToContour(x, y, contour);
    const roundness = Math.sin(
      Math.min(1, distance / Math.max(1, maximumDistance * 0.94)) * (Math.PI / 2),
    );
    const verticalPosition = (y - bounds.minY) / Math.max(1, bounds.maxY - bounds.minY);
    const lowerFullness = 0.9 + smoothstep(0.42, 0.86, verticalPosition) * 0.1;
    return PEAR_MARK_HALF_DEPTH * roundness * lowerFullness;
  };

  const roundedPositions = new Float32Array(flatPositions.count * 6);
  let writeIndex = 0;

  for (let triangle = 0; triangle < flatPositions.count; triangle += 3) {
    for (let corner = 0; corner < 3; corner += 1) {
      const index = triangle + corner;
      const x = flatPositions.getX(index);
      const y = flatPositions.getY(index);
      roundedPositions[writeIndex++] = x;
      roundedPositions[writeIndex++] = y;
      roundedPositions[writeIndex++] = surfaceDepth(x, y);
    }

    for (let corner = 2; corner >= 0; corner -= 1) {
      const index = triangle + corner;
      const x = flatPositions.getX(index);
      const y = flatPositions.getY(index);
      roundedPositions[writeIndex++] = x;
      roundedPositions[writeIndex++] = y;
      roundedPositions[writeIndex++] = -surfaceDepth(x, y);
    }
  }

  tessellatedGeometry.dispose();

  const roundedGeometry = new THREE.BufferGeometry();
  roundedGeometry.setAttribute('position', new THREE.BufferAttribute(roundedPositions, 3));
  const body = mergeVertices(roundedGeometry, 0.01);
  roundedGeometry.dispose();
  body.computeVertexNormals();
  body.translate(-bounds.centerX, -bounds.centerY, 0);
  body.scale(PEAR_MARK_SCALE, -PEAR_MARK_SCALE, PEAR_MARK_SCALE);

  return { body, surfaceDepth };
}

function createPearMarkGeometry() {
  if (pearMarkGeometryCache) return pearMarkGeometryCache;

  const parsedPaths = new SVGLoader().parse(pearMarkSvg).paths;
  const halves = parsedPaths[0]
    .toShapes()
    .map((shape) => {
      const bounds = shapeBounds(shape);
      const { body, surfaceDepth } = createRoundedPearBody(shape, bounds);
      return { body, bounds, details: [], surfaceDepth };
    })
    .sort((first, second) => first.bounds.centerX - second.bounds.centerX);

  parsedPaths[1].toShapes().forEach((shape) => {
    const bounds = shapeBounds(shape);
    const owner = halves.reduce((nearest, half) =>
      Math.abs(half.bounds.centerX - bounds.centerX) <
      Math.abs(nearest.bounds.centerX - bounds.centerX)
        ? half
        : nearest,
    );
    const detail = new THREE.ShapeGeometry(shape, 1);
    const positions = detail.getAttribute('position');
    for (let index = 0; index < positions.count; index += 1) {
      positions.setZ(index, owner.surfaceDepth(positions.getX(index), positions.getY(index)) + 15);
    }
    positions.needsUpdate = true;
    detail.translate(-owner.bounds.centerX, -owner.bounds.centerY, 0);
    detail.scale(PEAR_MARK_SCALE, -PEAR_MARK_SCALE, PEAR_MARK_SCALE);
    owner.details.push(detail);
  });

  halves.forEach((half) => {
    half.detail = mergeGeometries(half.details, false);
    half.details.forEach((geometry) => geometry.dispose());
    delete half.details;
  });

  pearMarkGeometryCache = halves;
  return pearMarkGeometryCache;
}

function smoothstep(min, max, value) {
  const normalized = Math.min(1, Math.max(0, (value - min) / (max - min)));
  return normalized * normalized * (3 - 2 * normalized);
}

function detectTier(compact) {
  if (compact) return 'low';
  const memory = navigator.deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;
  if (memory >= 8 && cores >= 8) return 'high';
  if (memory >= 4 && cores >= 4) return 'mid';
  return 'low';
}

function setColorFromSrgb(target, channels) {
  target.setRGB(channels[0], channels[1], channels[2], THREE.SRGBColorSpace);
}

function createSurfaceMaterial({ lightColor, pearColor, seasonWeights, memory, phase }) {
  const material = new THREE.MeshPhysicalNodeMaterial({
    side: THREE.DoubleSide,
    transparent: false,
  });
  const spring = seasonWeights.x;
  const summer = seasonWeights.y;
  const autumn = seasonWeights.z;
  const winter = seasonWeights.w;
  const viewDirection = cameraPosition.sub(positionWorld).normalize();
  const fresnel = pow(float(1).sub(max(dot(normalWorld, viewDirection), 0)), 2.65);
  const livingNoise = mx_noise_float(
    positionLocal
      .mul(1.36)
      .add(vec3(time.mul(0.035).add(phase), time.mul(-0.022), memory.mul(0.7))),
  );
  const breath = sin(time.mul(0.72).add(phase)).mul(0.012);
  const rememberedShape = mx_noise_float(positionLocal.mul(2.1).add(vec3(phase))).mul(
    memory.mul(0.065),
  );

  material.positionNode = positionLocal.add(
    normalLocal.mul(livingNoise.mul(0.045).add(breath).add(rememberedShape)),
  );
  material.colorNode = mix(
    lightColor,
    pearColor,
    clamp(fresnel.mul(0.82).add(autumn.mul(0.12)), 0, 0.94),
  );
  material.roughnessNode = spring
    .mul(0.3)
    .add(summer.mul(0.08))
    .add(autumn.mul(0.42))
    .add(winter.mul(0.16));
  material.metalnessNode = summer.mul(0.22).add(winter.mul(0.08));
  material.clearcoatNode = summer.mul(0.95).add(winter.mul(0.82)).add(spring.mul(0.26));
  material.clearcoatRoughnessNode = summer.mul(0.06).add(winter.mul(0.12)).add(autumn.mul(0.38));
  material.transmissionNode = spring.mul(0.48).add(winter.mul(0.09));
  material.thicknessNode = spring.mul(0.86).add(winter.mul(0.18));
  material.dispersionNode = spring.mul(0.12).add(winter.mul(0.055));
  material.iridescenceNode = spring.mul(0.42).add(autumn.mul(0.24)).add(fresnel.mul(0.28));
  material.iridescenceIORNode = float(1.32);
  material.iridescenceThicknessNode = float(420);
  material.specularIntensityNode = summer.mul(1.25).add(winter.mul(0.98)).add(spring.mul(0.62));
  material.emissiveNode = pearColor.mul(autumn.mul(0.045).add(fresnel.mul(0.022)));
  material.iorNode = float(1.43);
  material.attenuationDistanceNode = float(1.8);
  material.attenuationColorNode = pearColor;
  material.userData.uniforms = { lightColor, pearColor, seasonWeights, memory };

  return material;
}

function createVeilMaterial(pearColor, reveal) {
  const material = new THREE.MeshPhysicalNodeMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const concealed = float(1).sub(reveal);
  const spectral = sin(positionWorld.y.mul(16).add(time.mul(0.28)))
    .mul(0.04)
    .add(0.13);

  material.colorNode = pearColor.mul(float(0.32).add(spectral.mul(concealed)));
  material.opacityNode = concealed.mul(0.48);
  material.roughnessNode = concealed.mul(0.66);
  material.transmissionNode = concealed.mul(0.96);
  material.thicknessNode = concealed.mul(1.25);
  material.dispersionNode = concealed.mul(0.14);
  material.clearcoatNode = concealed.mul(0.72);
  material.iorNode = float(1.39);

  return material;
}

function createDustGeometry(count) {
  const positions = new Float32Array(count * 3);
  let seed = 0x91e10da5;
  const random = () => {
    seed = Math.imul(seed ^ (seed >>> 16), 2246822507);
    seed = Math.imul(seed ^ (seed >>> 13), 3266489909);
    return ((seed ^= seed >>> 16) >>> 0) / 4_294_967_296;
  };

  for (let index = 0; index < count; index += 1) {
    const radius = 1.4 + random() * 4.8;
    const angle = random() * TAU;
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = (random() - 0.5) * 5.4;
    positions[index * 3 + 2] = Math.sin(angle) * radius - 1.4;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return geometry;
}

function createDustMaterial(pearColor, seasonWeights) {
  const material = new THREE.PointsNodeMaterial({
    size: 0.018,
    sizeAttenuation: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const springOrAutumn = seasonWeights.x.mul(0.38).add(seasonWeights.z.mul(0.82));
  material.colorNode = pearColor;
  material.opacityNode = springOrAutumn.mul(0.34);
  material.positionNode = positionLocal.add(
    vec3(
      sin(time.mul(0.11).add(positionLocal.y)).mul(0.06),
      sin(time.mul(0.075).add(positionLocal.x)).mul(0.12),
      sin(time.mul(0.09).add(positionLocal.x)).mul(0.05),
    ),
  );
  return material;
}

function createBeamMaterial(colorNode, seasonWeights) {
  const material = new THREE.MeshBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  material.colorNode = colorNode;
  material.opacityNode = seasonWeights.z.mul(0.075);
  return material;
}

function ComputeDust({ count, pearColor, seasonWeights }) {
  const renderer = useThree((state) => state.gl);
  const system = useMemo(() => {
    const positions = instancedArray(count, 'vec3');
    const velocities = instancedArray(count, 'vec3');
    const angle = hash(instanceIndex).mul(TAU);
    const radius = hash(instanceIndex.add(7)).mul(4.8).add(1.1);

    const computeInit = Fn(() => {
      const position = positions.element(instanceIndex);
      const velocity = velocities.element(instanceIndex);

      position.x = cos(angle).mul(radius);
      position.y = hash(instanceIndex.add(13)).mul(5.8).sub(2.9);
      position.z = sin(angle).mul(radius).sub(1.6);
      velocity.x = hash(instanceIndex.add(19)).sub(0.5).mul(0.0012);
      velocity.y = hash(instanceIndex.add(23)).mul(0.0014).add(0.00015);
      velocity.z = hash(instanceIndex.add(29)).sub(0.5).mul(0.0012);
    })()
      .compute(count)
      .setName('Pear seasonal dust init');

    const computeUpdate = Fn(() => {
      const position = positions.element(instanceIndex);
      const velocity = velocities.element(instanceIndex);
      const seasonalLift = seasonWeights.x.mul(0.0011).sub(seasonWeights.z.mul(0.00034));

      position.addAssign(velocity);
      position.x.addAssign(sin(time.mul(0.09).add(position.y)).mul(0.00072));
      position.z.addAssign(cos(time.mul(0.07).add(position.x)).mul(0.00058));
      position.y.addAssign(seasonalLift);

      If(position.y.greaterThan(3.1), () => {
        position.y = -3.1;
      });
      If(position.y.lessThan(-3.1), () => {
        position.y = 3.1;
      });
    })()
      .compute(count)
      .setName('Pear seasonal dust update');

    const material = new THREE.SpriteNodeMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const springOrAutumn = seasonWeights.x.mul(0.38).add(seasonWeights.z.mul(0.82));
    material.positionNode = positions.toAttribute();
    material.scaleNode = float(count > 100_000 ? 0.012 : 0.017);
    material.colorNode = pearColor.mul(uv().y.mul(0.28).add(0.72));
    material.opacityNode = shapeCircle().mul(springOrAutumn.mul(0.3));

    const sprite = new THREE.Sprite(material);
    sprite.count = count;
    sprite.frustumCulled = false;

    return { computeInit, computeUpdate, material, sprite };
  }, [count, pearColor, seasonWeights]);

  useEffect(() => {
    renderer.compute(system.computeInit);
    return () => {
      system.material.dispose();
    };
  }, [renderer, system]);

  useFrame(() => {
    renderer.compute(system.computeUpdate);
  }, -1);

  return <primitive object={system.sprite} />;
}

function SpectralFallback() {
  return (
    <div className="spectral-fallback" aria-hidden>
      <PearBrandMark className="spectral-fallback__mark" frameScale={1} />
      <i />
    </div>
  );
}

function PearScene({ progressRef, pointerRef, revealRef, active, compact, tier, onTierDecline }) {
  const renderer = useThree((state) => state.gl);
  const groupRef = useRef(null);
  const firstHalfRef = useRef(null);
  const secondHalfRef = useRef(null);
  const firstLightRef = useRef(null);
  const secondLightRef = useRef(null);
  const dustRef = useRef(null);
  const revealValueRef = useRef(0);
  const revealPulseRef = useRef(0);
  const previousRevealRef = useRef(false);
  const now = useMemo(() => new Date(), []);
  const baseYearProgress = useMemo(() => dayOfYearProgress(now), [now]);
  const seasonLut = useMemo(() => createSeasonLightLut(now, resolveHemisphereSync()), [now]);
  const lightA = useMemo(() => uniform(new THREE.Color(0x93b8ff)), []);
  const lightB = useMemo(() => uniform(new THREE.Color(0xffb38e)), []);
  const pearLight = useMemo(() => uniform(new THREE.Color(0xc7d8ff)), []);
  const seasonWeights = useMemo(() => uniform(new THREE.Vector4(0, 1, 0, 0)), []);
  const memory = useMemo(() => uniform(0), []);
  const reveal = useMemo(() => uniform(0), []);
  const pearMarkGeometry = useMemo(() => createPearMarkGeometry(), []);
  const firstMaterial = useMemo(
    () =>
      createSurfaceMaterial({
        lightColor: lightA,
        pearColor: pearLight,
        seasonWeights,
        memory,
        phase: 0.7,
      }),
    [lightA, memory, pearLight, seasonWeights],
  );
  const secondMaterial = useMemo(
    () =>
      createSurfaceMaterial({
        lightColor: lightB,
        pearColor: pearLight,
        seasonWeights,
        memory,
        phase: 2.4,
      }),
    [lightB, memory, pearLight, seasonWeights],
  );
  const veilMaterial = useMemo(() => createVeilMaterial(pearLight, reveal), [pearLight, reveal]);
  const detailMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#fffdf8',
        depthTest: false,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
        side: THREE.DoubleSide,
        toneMapped: false,
        transparent: true,
      }),
    [],
  );
  const beamMaterialA = useMemo(
    () => createBeamMaterial(lightA, seasonWeights),
    [lightA, seasonWeights],
  );
  const beamMaterialB = useMemo(
    () => createBeamMaterial(lightB, seasonWeights),
    [lightB, seasonWeights],
  );
  const supportsCompute = renderer.backend?.isWebGPUBackend === true;
  const fallbackParticleCount = TIER_CONFIG[tier].fallbackParticles || 0;
  const dustGeometry = useMemo(
    () =>
      !supportsCompute && fallbackParticleCount ? createDustGeometry(fallbackParticleCount) : null,
    [fallbackParticleCount, supportsCompute],
  );
  const dustMaterial = useMemo(
    () => (dustGeometry ? createDustMaterial(pearLight, seasonWeights) : null),
    [dustGeometry, pearLight, seasonWeights],
  );

  useEffect(
    () => () => {
      detailMaterial.dispose();
    },
    [detailMaterial],
  );

  useFrame((state, delta) => {
    if (!active) return;

    const elapsed = state.clock.elapsedTime;
    const progress = Math.min(1, Math.max(0, progressRef.current));
    const yearProgress = (baseYearProgress + progress) % 1;
    const sample = sampleSeasonLightLut(seasonLut, yearProgress);
    const revealTarget = revealRef.current ? 1 : 0;
    const revealBlend = 1 - Math.exp(-delta * (revealTarget ? 5.8 : 7.5));

    revealValueRef.current += (revealTarget - revealValueRef.current) * revealBlend;
    if (revealTarget > 0 && !previousRevealRef.current) revealPulseRef.current = 1;
    previousRevealRef.current = revealTarget > 0;
    revealPulseRef.current *= Math.exp(-delta * 2.7);

    setColorFromSrgb(lightA.value, sample.personA);
    setColorFromSrgb(lightB.value, sample.personB);
    setColorFromSrgb(pearLight.value, sample.pear);
    seasonWeights.value.fromArray(sample.weights);
    memory.value = smoothstep(0.72, 1, progress);
    reveal.value = revealValueRef.current;

    const orbit = yearProgress * TAU;
    const convergence = revealValueRef.current * smoothstep(0, 0.16, 1 - progress);
    const firstAngle = orbit - 0.42 + Math.sin(elapsed * 0.12) * 0.07 * (1 - convergence);
    const secondAngle = orbit + 0.46 - Math.cos(elapsed * 0.1) * 0.065 * (1 - convergence);
    const commonAngle = orbit + 0.03;
    const blendedFirstAngle = firstAngle + (commonAngle - firstAngle) * convergence;
    const blendedSecondAngle = secondAngle + (commonAngle - secondAngle) * convergence;
    const sunHeight = 2.1 + Math.sin(orbit - 0.8) * 1.65;

    firstLightRef.current.position.set(
      Math.cos(blendedFirstAngle) * 4.8,
      sunHeight + 0.55,
      Math.sin(blendedFirstAngle) * 4.8 + 2.2,
    );
    secondLightRef.current.position.set(
      Math.cos(blendedSecondAngle) * 4.6,
      sunHeight - 0.45,
      Math.sin(blendedSecondAngle) * 4.6 + 2,
    );
    firstLightRef.current.color.copy(lightA.value);
    secondLightRef.current.color.copy(lightB.value);
    firstLightRef.current.intensity = 3.4 + sample.weights[1] * 2.1;
    secondLightRef.current.intensity = 3.15 + sample.weights[0] * 1.25;

    const split = smoothstep(0.12, 0.25, progress) * (1 - smoothstep(0.34, 0.5, progress));
    const reunion = smoothstep(0.46, 0.82, progress);
    const separation = 0.64 + split * 0.52 - reunion * 0.13;
    const breath = Math.sin(elapsed * 0.68) * 0.018 + revealPulseRef.current * 0.075;

    firstHalfRef.current.position.x = -separation;
    secondHalfRef.current.position.x = separation;
    firstHalfRef.current.position.y = -0.075 + Math.sin(elapsed * 0.31) * 0.055 - split * 0.08;
    secondHalfRef.current.position.y = 0.075 + Math.sin(elapsed * 0.29 + 2.1) * 0.05 + split * 0.08;
    firstHalfRef.current.rotation.z = -0.17 - split * 0.18 + reunion * 0.09;
    secondHalfRef.current.rotation.z = 0.17 + split * 0.18 - reunion * 0.09;
    firstHalfRef.current.scale.setScalar(1 + breath);
    secondHalfRef.current.scale.setScalar(1 + breath * 0.82);

    groupRef.current.position.x = compact ? 0 : 0.68;
    groupRef.current.position.y = compact ? -0.35 : -0.06;
    groupRef.current.rotation.y = progress * TAU + pointerRef.current.x * 0.075;
    groupRef.current.rotation.x = -0.08 + pointerRef.current.y * 0.055;
    groupRef.current.scale.setScalar(compact ? 0.56 : 0.94);

    if (dustRef.current) {
      dustRef.current.rotation.y = elapsed * 0.018 + orbit * 0.08;
      dustRef.current.rotation.z = Math.sin(elapsed * 0.04) * 0.08;
    }

    const cameraOrbit = progress * TAU;
    state.camera.position.x = Math.sin(cameraOrbit) * (compact ? 0.32 : 0.48);
    state.camera.position.y = compact ? 0.3 : 0.1 + Math.sin(cameraOrbit * 0.5) * 0.18;
    state.camera.position.z = compact ? 6.7 : 6.25;
    state.camera.lookAt(compact ? 0 : 0.5, compact ? -0.3 : -0.02, 0);
  });

  return (
    <>
      <color attach="background" args={['#05060a']} />
      <fog attach="fog" args={['#05060a', 5.5, 12]} />
      <ambientLight intensity={0.16} color="#dfe8ff" />
      <directionalLight ref={firstLightRef} intensity={3.4} />
      <directionalLight ref={secondLightRef} intensity={3.2} />
      <pointLight position={[0, -1.6, 2.2]} intensity={0.7} color="#dce7ff" distance={6} />

      <group ref={groupRef}>
        <group ref={firstHalfRef} position-z={-0.08}>
          <mesh geometry={pearMarkGeometry[0].body} material={firstMaterial} />
          <mesh geometry={pearMarkGeometry[0].body} material={veilMaterial} scale={1.012} />
          <mesh geometry={pearMarkGeometry[0].detail} material={detailMaterial} renderOrder={20} />
        </group>
        <group ref={secondHalfRef} position-z={0.08}>
          <mesh geometry={pearMarkGeometry[1].body} material={secondMaterial} />
          <mesh geometry={pearMarkGeometry[1].body} material={veilMaterial} scale={1.012} />
          <mesh geometry={pearMarkGeometry[1].detail} material={detailMaterial} renderOrder={20} />
        </group>

        {tier !== 'low' ? (
          <>
            <mesh
              position={[-2.35, 1.2, -1.1]}
              rotation={[0.12, 0.18, -0.62]}
              material={beamMaterialA}
            >
              <coneGeometry args={[1.18, 5.8, 24, 1, true]} />
            </mesh>
            <mesh
              position={[2.45, 1.08, -1.2]}
              rotation={[-0.08, -0.16, 0.66]}
              material={beamMaterialB}
            >
              <coneGeometry args={[1.12, 5.6, 24, 1, true]} />
            </mesh>
          </>
        ) : null}
      </group>

      {dustGeometry && dustMaterial ? (
        <points ref={dustRef} geometry={dustGeometry} material={dustMaterial} />
      ) : null}
      {supportsCompute && TIER_CONFIG[tier].particles ? (
        <ComputeDust
          count={TIER_CONFIG[tier].particles}
          pearColor={pearLight}
          seasonWeights={seasonWeights}
        />
      ) : null}

      <PerformanceMonitor
        flipflops={2}
        onDecline={onTierDecline}
        bounds={(refreshRate) => (refreshRate > 90 ? [50, 85] : [42, 58])}
      />
      <AdaptiveDpr pixelated />
    </>
  );
}

export default function PearWorldCanvas({
  progressRef,
  pointerRef,
  revealRef,
  reducedMotion = false,
  compact = false,
  active = true,
}) {
  const [tier, setTier] = useState(() => detectTier(compact));
  const [canRenderWorld, setCanRenderWorld] = useState(null);
  const config = TIER_CONFIG[tier];
  useEffect(() => {
    if (navigator.gpu) {
      setCanRenderWorld(true);
      return;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2');
    setCanRenderWorld(Boolean(context));
    context?.getExtension('WEBGL_lose_context')?.loseContext();
  }, []);
  const createRenderer = useCallback(async (props) => {
    const renderer = new THREE.WebGPURenderer({
      ...props,
      alpha: false,
      antialias: false,
      powerPreference: 'high-performance',
    });
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    await renderer.init();
    return renderer;
  }, []);
  const lowerTier = useCallback(() => {
    setTier((current) => TIER_ORDER[Math.max(0, TIER_ORDER.indexOf(current) - 1)]);
  }, []);

  if (reducedMotion || !canRenderWorld) return <SpectralFallback />;

  return (
    <div className="pear-world" aria-hidden data-scene-tier={tier}>
      <Canvas
        camera={{ fov: compact ? 44 : 38, near: 0.1, far: 30, position: [0, 0, 6.25] }}
        dpr={config.dpr}
        fallback={<SpectralFallback />}
        frameloop={active ? 'always' : 'demand'}
        gl={createRenderer}
        resize={{ debounce: { scroll: 100, resize: 120 } }}
      >
        <PearScene
          progressRef={progressRef}
          pointerRef={pointerRef}
          revealRef={revealRef}
          active={active}
          compact={compact}
          tier={tier}
          onTierDecline={lowerTier}
        />
      </Canvas>
    </div>
  );
}
