import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createSafeRenderer, disposeObject3D, isMobileDevice } from "../lib/webgl";
import { assetUrl } from "../lib/assetUrl";

/** Full story loop length (seconds). */
const STORY_SEC = 7.4;

function normalizeModel(root, targetSize = 1) {
  root.position.set(0, 0, 0);
  root.scale.set(1, 1, 1);
  root.updateMatrixWorld(true);

  const box0 = new THREE.Box3().setFromObject(root);
  const size0 = box0.getSize(new THREE.Vector3());
  const maxDim = Math.max(size0.x, size0.y, size0.z, 1e-6);
  root.scale.setScalar(targetSize / maxDim);
  root.updateMatrixWorld(true);

  const box1 = new THREE.Box3().setFromObject(root);
  const center = box1.getCenter(new THREE.Vector3());
  root.position.sub(center);
  root.updateMatrixWorld(true);
}

function collectFaceMeshes(root) {
  const meshes = [];
  root.traverse((obj) => {
    if (obj.isLine || obj.isLineSegments || obj.isLineLoop || obj.isPoints) {
      obj.visible = false;
      return;
    }
    if (obj.isMesh || obj.isSkinnedMesh) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m) => {
        if (!m) return;
        m.wireframe = false;
        m.envMapIntensity = 1.05;
        m.metalness = THREE.MathUtils.clamp(m.metalness ?? 0.4, 0.28, 0.62);
        m.roughness = THREE.MathUtils.clamp(m.roughness ?? 0.38, 0.2, 0.52);
        m.transparent = true;
        m.opacity = 1;
        m.needsUpdate = true;
      });
      meshes.push(obj);
    }
  });
  return meshes;
}

/** Face positions: assembled / open explode / far void. */
function prepareExplode(meshes, modelRoot) {
  modelRoot.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(modelRoot);
  const center = box.getCenter(new THREE.Vector3());
  const radius = box.getBoundingSphere(new THREE.Sphere()).radius;
  const explodeLen = radius * 0.78;
  const voidLen = radius * 2.35;

  meshes.forEach((mesh, idx) => {
    mesh.updateMatrixWorld(true);
    mesh.userData.assembledPos = mesh.position.clone();

    const fb = new THREE.Box3().setFromObject(mesh);
    const facetCtr = fb.getCenter(new THREE.Vector3());
    let dir = facetCtr.clone().sub(center);
    if (dir.lengthSq() < 1e-12) {
      const axes = [
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 0, -1),
      ];
      dir.copy(axes[idx % 6]);
    } else {
      dir.normalize();
    }

    mesh.userData.outDir = dir.clone();
    const world = new THREE.Vector3();
    mesh.getWorldPosition(world);
    const inv = new THREE.Matrix4().copy(mesh.parent.matrixWorld).invert();

    mesh.userData.explodedPos = world.clone().addScaledVector(dir, explodeLen).applyMatrix4(inv);
    mesh.userData.voidPos = world.clone().addScaledVector(dir, voidLen).applyMatrix4(inv);
    mesh.userData.stagger = (idx % 6) / 6;
  });
}

function fitCamera(camera, object, { padding = 1.48, azimuth = -0.55, elevation = 0.4 } = {}) {
  object.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxSize = Math.max(size.x, size.y, size.z, 0.001);

  const fov = THREE.MathUtils.degToRad(camera.fov);
  const dist = (maxSize * padding) / (2 * Math.tan(fov / 2));
  const cosEl = Math.cos(elevation);
  const sinEl = Math.sin(elevation);
  const baseOffset = new THREE.Vector3(
    dist * cosEl * Math.sin(azimuth),
    dist * sinEl,
    dist * cosEl * Math.cos(azimuth),
  );

  camera.position.copy(center).add(baseOffset);
  camera.near = Math.max(0.05, dist / 80);
  camera.far = Math.max(50, dist * 8);
  camera.lookAt(center.x, center.y - size.y * 0.05, center.z);
  camera.updateProjectionMatrix();

  return { center: center.clone(), dist, size: size.clone(), baseOffset };
}

function createContactShadow() {
  const s = 256;
  const canvas = document.createElement("canvas");
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(17,18,15,0.1)");
  g.addColorStop(0.4, "rgba(17,18,15,0.035)");
  g.addColorStop(0.75, "rgba(17,18,15,0.008)");
  g.addColorStop(1, "rgba(17,18,15,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function clamp01(t) {
  return Math.min(Math.max(t, 0), 1);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

function easeInOutQuart(t) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - (-2 * t + 2) ** 4 / 2;
}

/** Smoothstep — C1 continuous, no harsh kicks. */
function smoothstep(t) {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

/** Softer accelerate (like a swipe without a snap). */
function easeInQuad(t) {
  return t * t;
}

function seg(u, a, b) {
  return clamp01((u - a) / Math.max(b - a, 1e-6));
}

/**
 * Mini story (~7.4s), looping — values matched at phase seams to avoid jerks.
 */
function sampleStory(u) {
  // 0.00–1.20  arrive from left
  // 1.20–2.50  assemble
  // 2.50–4.20  showcase
  // 4.20–5.40  disassemble
  // 5.40–6.10  open drift
  // 6.10–7.40  swipe right (smooth fling, no pull-back)

  let open = 1;
  let presence = 1;
  let lift = 0;
  let driftX = 0;
  let driftZ = 0;
  let spinMul = 0.35;
  let spinBoost = 0;
  let fade = 1;
  let staggerMul = 1;
  let tumbleY = 0;
  let tumbleZ = 0;

  if (u < 1.2) {
    const t = easeOutCubic(seg(u, 0, 1.2));
    open = 1 + (1 - t) * 1.05;
    presence = 0.15 + t * 0.85;
    driftX = (1 - t) * -2.4;
    lift = (1 - t) * 0.06;
    driftZ = (1 - t) * 0.28;
    fade = smoothstep(seg(u, 0.05, 0.55));
    spinMul = 0.25 + t * 0.2;
    tumbleY = (1 - t) * -0.4;
    tumbleZ = (1 - t) * 0.2;
    staggerMul = 1.1;
  } else if (u < 2.5) {
    const t = easeInOutCubic(seg(u, 1.2, 2.5));
    open = 1 - t;
    presence = 1;
    fade = 1;
    spinMul = 0.45;
    staggerMul = 1;
  } else if (u < 4.2) {
    const t = seg(u, 2.5, 4.2);
    const wave = Math.sin(t * Math.PI);
    open = 0;
    presence = 1;
    fade = 1;
    spinMul = 0.45 + wave * 0.7;
    spinBoost = easeInOutQuart(wave) * 0.85;
    lift = Math.sin(t * Math.PI * 2) * 0.02;
  } else if (u < 5.4) {
    const t = easeInOutCubic(seg(u, 4.2, 5.4));
    open = t;
    presence = 1;
    fade = 1;
    // Continuity from showcase end (spinMul ~0.45)
    spinMul = 0.45 + t * 0.3;
    staggerMul = 1.1;
  } else if (u < 6.1) {
    const t = smoothstep(seg(u, 5.4, 6.1));
    open = 1;
    presence = 1;
    fade = 1;
    spinMul = 0.75 + t * 0.1;
    spinBoost = t * 0.12;
    lift = Math.sin(t * Math.PI) * 0.025;
  } else {
    // Smooth swipe right — no anticipation snap
    const raw = seg(u, 6.1, STORY_SEC);
    const fling = easeInQuad(raw); // gentle accel, no quint kick
    const flingSoft = smoothstep(raw);

    open = 1 + flingSoft * 0.75;
    presence = 1 - flingSoft * 0.35;
    driftX = fling * 3.6;
    lift = flingSoft * 0.16;
    driftZ = -flingSoft * 0.4;
    fade = 1 - smoothstep(seg(raw, 0.35, 1));
    tumbleY = flingSoft * 0.95;
    tumbleZ = -flingSoft * 0.7;
    // Keep spin rate continuous with previous phase (~0.85)
    spinMul = 0.85 - flingSoft * 0.35;
    spinBoost = 0.12 * (1 - flingSoft) + flingSoft * 1.1;
    staggerMul = 1.25;
  }

  return {
    open,
    presence,
    lift,
    driftX,
    driftZ,
    spinMul,
    spinBoost,
    fade,
    staggerMul,
    tumbleY,
    tumbleZ,
  };
}

/**
 * Hero Void cube — looping 3D story (~7s).
 */
export default function HeroSceneCanvas({ active, scrollProgressRef, onFail }) {
  const mountRef = useRef(null);
  const onFailRef = useRef(onFail);
  const apiRef = useRef({ setActive: () => {} });
  onFailRef.current = onFail;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let renderer;
    let frame = 0;
    let running = false;
    let lost = false;
    let disposed = false;
    let modelReady = false;
    let shouldRun = active;
    let storyOrigin = 0;
    const cleanups = [];

    try {
      renderer = createSafeRenderer(THREE, { antialias: true, alpha: true });
    } catch {
      onFailRef.current?.();
      return undefined;
    }

    const mobile = isMobileDevice();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 100);

    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.background = "transparent";
    mount.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    cleanups.push(() => {
      env.dispose();
      pmrem.dispose();
    });

    scene.add(new THREE.HemisphereLight(0xffffff, 0xb0b4ac, 0.95));
    const key = new THREE.DirectionalLight(0xffffff, 2.7);
    key.position.set(4, 7, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xb8c6ff, 0.95);
    rim.position.set(-4, 2, -2);
    scene.add(rim);

    const product = new THREE.Group();
    product.rotation.x = 0.22;
    scene.add(product);

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        map: createContactShadow(),
        transparent: true,
        depthWrite: false,
        opacity: 0.7,
      }),
    );
    shadow.rotation.x = -Math.PI / 2;
    scene.add(shadow);

    let meshes = [];
    let camFit = {
      center: new THREE.Vector3(),
      dist: 4,
      size: new THREE.Vector3(1, 1, 1),
      baseOffset: new THREE.Vector3(0, 1, 4),
    };
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const tmp = new THREE.Vector3();
    const clock = new THREE.Clock();
    let spinAccum = 0;

    const onPointer = (e) => {
      const rect = mount.getBoundingClientRect();
      pointer.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    mount.addEventListener("pointermove", onPointer);
    cleanups.push(() => mount.removeEventListener("pointermove", onPointer));

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    cleanups.push(() => ro.disconnect());

    const onLost = (e) => {
      e.preventDefault();
      lost = true;
      running = false;
      cancelAnimationFrame(frame);
      onFailRef.current?.();
    };
    renderer.domElement.addEventListener("webglcontextlost", onLost);
    cleanups.push(() => renderer.domElement.removeEventListener("webglcontextlost", onLost));

    const setFacePose = (mesh, open, staggerMul) => {
      const a = mesh.userData.assembledPos;
      const e = mesh.userData.explodedPos;
      const v = mesh.userData.voidPos;
      if (!a || !e || !v) return;

      const lag = (mesh.userData.stagger || 0) * 0.16 * staggerMul;
      const localOpen = open - lag;

      if (localOpen <= 1) {
        tmp.lerpVectors(a, e, clamp01(localOpen));
      } else {
        tmp.lerpVectors(e, v, clamp01((localOpen - 1) / 1.25));
      }
      mesh.position.copy(tmp);
    };

    const tick = () => {
      if (!running || lost || disposed) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = (performance.now() - storyOrigin) / 1000;
      const u = ((elapsed % STORY_SEC) + STORY_SEC) % STORY_SEC;
      const story = sampleStory(u);
      const scrollOpen = Math.min(Math.max(scrollProgressRef?.current ?? 0, 0), 1);

      // Light scroll can nudge openness during assembled/showcase only
      const open =
        story.open + (story.open < 0.2 ? scrollOpen * 0.1 : 0);

      meshes.forEach((mesh) => {
        setFacePose(mesh, open, story.staggerMul);
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => {
          if (!m) return;
          m.opacity = story.fade;
        });
      });

      pointer.x += (pointer.tx - pointer.x) * 0.08;
      pointer.y += (pointer.ty - pointer.y) * 0.08;

      spinAccum += dt * (0.55 * story.spinMul + story.spinBoost);

      const scale = Math.max(0.08, story.presence);
      product.scale.setScalar(scale);
      product.position.x = story.driftX + pointer.x * 0.04;
      product.position.y = story.lift + Math.sin(elapsed * 0.9) * 0.012 * story.presence;
      product.position.z = story.driftZ;
      product.rotation.y = -0.28 + spinAccum + story.tumbleY + pointer.x * 0.14;
      product.rotation.x = 0.2 + Math.sin(elapsed * 0.35) * 0.06 - pointer.y * 0.05;
      product.rotation.z = story.tumbleZ + Math.sin(elapsed * 0.22) * 0.04 * story.spinMul;

      const c = camFit.center;
      // Soft camera follow — no hard switch that causes a hitch
      const camFollow = 0.2 * (1 - smoothstep(Math.abs(story.driftX) / 3.2));
      camera.position.copy(c).add(camFit.baseOffset);
      camera.position.x += pointer.x * 0.08 + story.driftX * camFollow;
      camera.position.y += pointer.y * 0.05 + story.lift * 0.1;
      camera.lookAt(
        c.x + story.driftX * camFollow * 0.85,
        c.y - camFit.size.y * 0.04 + story.lift * 0.2,
        c.z,
      );

      const assembledAmount = clamp01(1 - Math.min(story.open, 1));
      shadow.material.opacity = (0.1 + assembledAmount * 0.22) * story.fade * story.presence;
      shadow.position.x = camFit.center.x + story.driftX * 0.55;
      shadow.position.z = camFit.center.z + story.driftZ * 0.2;
      shadow.scale.setScalar(
        Math.max(camFit.size.x, camFit.size.z) * (1.5 + Math.min(story.open, 1.4) * 0.35) * scale,
      );

      renderer.render(scene, camera);
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (lost || disposed || document.visibilityState === "hidden") return;
      if (!shouldRun || !modelReady) return;
      if (running) return;
      running = true;
      clock.getDelta();
      tick();
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    apiRef.current.setActive = (next) => {
      shouldRun = next;
      if (next) start();
      else stop();
    };

    const onVis = () => {
      if (document.visibilityState === "hidden") stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVis);
    cleanups.push(() => document.removeEventListener("visibilitychange", onVis));

    const loader = new GLTFLoader();
    loader.load(
      assetUrl("models/void.glb"),
      (gltf) => {
        if (disposed) return;

        while (product.children.length) product.remove(product.children[0]);

        const model = gltf.scene;
        product.add(model);
        normalizeModel(model, 1);

        meshes = collectFaceMeshes(model);
        if (meshes.length >= 2) {
          prepareExplode(meshes, product);
        } else {
          meshes.forEach((m) => {
            m.userData.assembledPos = m.position.clone();
            m.userData.explodedPos = m.position.clone();
            m.userData.voidPos = m.position.clone();
            m.userData.stagger = 0;
          });
        }

        meshes.forEach((m) => {
          if (m.userData.assembledPos) m.position.copy(m.userData.assembledPos);
        });
        camFit = fitCamera(camera, product, {
          padding: mobile ? 1.48 : 1.38,
          azimuth: -0.55,
          elevation: 0.4,
        });
        meshes.forEach((m) => {
          if (m.userData.voidPos) m.position.copy(m.userData.voidPos);
        });

        shadow.position.set(camFit.center.x, camFit.center.y - camFit.size.y * 0.48, camFit.center.z);
        const s = Math.max(camFit.size.x, camFit.size.z) * 1.7;
        shadow.scale.set(s, s, 1);

        modelReady = true;
        storyOrigin = performance.now();
        spinAccum = 0;
        renderer.render(scene, camera);
        shouldRun = true;
        start();
      },
      undefined,
      () => {
        if (!disposed) onFailRef.current?.();
      },
    );

    return () => {
      disposed = true;
      stop();
      apiRef.current.setActive = () => {};
      cleanups.forEach((fn) => fn());
      disposeObject3D(scene);
      shadow.material.map?.dispose();
      shadow.material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [scrollProgressRef]);

  useEffect(() => {
    apiRef.current.setActive(active);
  }, [active]);

  return <div className="hero-scene-mount" ref={mountRef} />;
}
