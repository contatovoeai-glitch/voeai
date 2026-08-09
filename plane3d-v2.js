import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const BLUE = 0x5574ff;

function planform(span, rootChord, tipChord, sweep) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(span, sweep);
  s.lineTo(span, sweep + tipChord);
  s.lineTo(0, rootChord);
  s.closePath();
  return s;
}

function build() {
  const g = new THREE.Group();

  const paint = new THREE.MeshPhysicalMaterial({ color: 0xf2f3f4, metalness: 0.12, roughness: 0.3, clearcoat: 0.85, clearcoatRoughness: 0.14 });
  const silver = new THREE.MeshStandardMaterial({ color: 0xb8bec7, metalness: 1, roughness: 0.24 });
  const graphite = new THREE.MeshStandardMaterial({ color: 0x1b1f26, metalness: 0.7, roughness: 0.42 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x05070a, metalness: 0.2, roughness: 0.08, clearcoat: 1 });
  const cabin = new THREE.MeshStandardMaterial({ color: 0x0a0c10, emissive: 0xdfe6f5, emissiveIntensity: 0.9, roughness: 0.5 });
  const accent = new THREE.MeshStandardMaterial({ color: BLUE, metalness: 0.4, roughness: 0.32 });

  // fuselage — long, smooth, airliner proportions
  const prof = [
    [0.012, 0], [0.09, 0.05], [0.17, 0.14], [0.255, 0.3], [0.33, 0.52], [0.385, 0.8],
    [0.42, 1.15], [0.44, 1.6], [0.445, 2.2], [0.445, 4.6], [0.44, 5.2], [0.425, 5.75],
    [0.39, 6.25], [0.32, 6.75], [0.21, 7.2], [0.09, 7.55], [0.02, 7.68]
  ];
  const fus = new THREE.Mesh(new THREE.LatheGeometry(prof.map(p => new THREE.Vector2(p[0], p[1])), 64), paint);
  fus.rotation.x = -Math.PI / 2;
  g.add(fus);

  // silver belly band
  const belly = new THREE.Mesh(new THREE.LatheGeometry(prof.slice(4, 13).map(p => new THREE.Vector2(p[0] * 1.004, p[1])), 64, 0, Math.PI), silver);
  belly.rotation.x = -Math.PI / 2;
  belly.rotation.y = Math.PI / 2;
  belly.scale.y = 0.999;
  g.add(belly);

  // cockpit glass
  const cock = new THREE.Mesh(new THREE.SphereGeometry(0.27, 26, 18, 0, Math.PI * 2, 0, Math.PI * 0.55), glass);
  cock.scale.set(1.02, 0.66, 1.5);
  cock.rotation.x = -Math.PI / 2.05;
  cock.position.set(0, 0.13, -0.5);
  g.add(cock);

  // cabin window strips + thin blue cheatline
  [-1, 1].forEach(side => {
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.055, 4.6), cabin);
    w.position.set(side * 0.442, 0.1, -3.6);
    g.add(w);
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.022, 5.6), accent);
    line.position.set(side * 0.444, -0.02, -3.5);
    g.add(line);
  });

  const vertical = geo => { geo.rotateZ(Math.PI / 2); geo.rotateY(-Math.PI / 2); return geo; };

  const wingG = new THREE.ExtrudeGeometry(planform(4.5, 1.95, 0.5, 2.1), { depth: 0.16, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 3 });
  wingG.rotateX(-Math.PI / 2);
  const wingletG = vertical(new THREE.ExtrudeGeometry(planform(0.62, 0.46, 0.2, 0.3), { depth: 0.06, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 1 }));
  const stabG = new THREE.ExtrudeGeometry(planform(1.62, 1.05, 0.36, 0.85), { depth: 0.1, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 });
  stabG.rotateX(-Math.PI / 2);

  [1, -1].forEach(side => {
    const wing = new THREE.Mesh(wingG, paint);
    wing.scale.x = side;
    wing.position.set(side * 0.33, -0.19, -2.55);
    wing.rotation.z = side * 0.075;
    g.add(wing);

    const wl = new THREE.Mesh(wingletG, paint);
    wl.position.set(side * 4.78, -0.02, -4.4);
    wl.rotation.z = -side * 0.2;
    g.add(wl);
    const wlTip = new THREE.Mesh(vertical(new THREE.ExtrudeGeometry(planform(0.2, 0.34, 0.2, 0.14), { depth: 0.062, bevelEnabled: false })), accent);
    wlTip.position.set(side * 4.78, 0.56, -4.66);
    wlTip.rotation.z = -side * 0.2;
    g.add(wlTip);

    const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.62), paint);
    pylon.position.set(side * 1.85, -0.36, -3.05);
    g.add(pylon);
    const nac = new THREE.Mesh(new THREE.CylinderGeometry(0.335, 0.29, 1.24, 32, 1, true), paint);
    nac.rotation.x = Math.PI / 2;
    nac.position.set(side * 1.85, -0.6, -2.95);
    g.add(nac);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.038, 12, 32), silver);
    lip.position.set(side * 1.85, -0.6, -2.34);
    g.add(lip);
    const fan = new THREE.Mesh(new THREE.CircleGeometry(0.305, 32), graphite);
    fan.position.set(side * 1.85, -0.6, -2.38);
    g.add(fan);
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.11, 0.4, 24), graphite);
    exhaust.rotation.x = Math.PI / 2;
    exhaust.position.set(side * 1.85, -0.6, -3.7);
    g.add(exhaust);

    const st = new THREE.Mesh(stabG, paint);
    st.scale.x = side;
    st.position.set(side * 0.22, 0.1, -6.35);
    st.rotation.z = side * 0.05;
    g.add(st);
  });

  const fin = new THREE.Mesh(vertical(new THREE.ExtrudeGeometry(planform(2.05, 1.72, 0.72, 1.28), { depth: 0.11, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 })), paint);
  fin.position.set(0, 0.36, -5.9);
  g.add(fin);
  const finMark = new THREE.Mesh(vertical(new THREE.ExtrudeGeometry(planform(0.9, 0.62, 0.4, 0.56), { depth: 0.115, bevelEnabled: false })), accent);
  finMark.position.set(0, 1.4, -6.5);
  g.add(finMark);

  g.position.z = 3.6;
  const wrap = new THREE.Group();
  wrap.add(g);
  return wrap;
}

class PlaneV2 extends HTMLElement {
  connectedCallback() {
    if (this._init) return;
    this._init = true;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.style.display = 'block';

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
    this.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;

    const key = new THREE.DirectionalLight(0xffffff, 2.6); key.position.set(5, 7, 4); scene.add(key);
    const rim = new THREE.DirectionalLight(0xdbe3f5, 3.4); rim.position.set(-7, 2, -6); scene.add(rim);
    const under = new THREE.DirectionalLight(0x8fa0c4, 0.7); under.position.set(-1, -5, 2); scene.add(under);
    const spark = new THREE.PointLight(BLUE, 12, 22); spark.position.set(-3, 1.5, 3); scene.add(spark);

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
    let plane;
    try { plane = build(); } catch (err) { console.error('plane build failed', err); return; }
    scene.add(plane);

    const mode = this.getAttribute('mode') || 'hero';
    // 'radar': avião centralizado no console de monitoramento do hero.
    const cam = { hero: [3.1, 1.35, 18.2], cta: [0.5, 1.9, 21.5], radar: [0.1, 2.6, 17.4] }[mode] || [3.1, 1.35, 18.2];
    camera.position.set(cam[0], cam[1], cam[2]);
    camera.lookAt(0, -0.1, 0);

    const resize = () => {
      const w = this.clientWidth || 1, h = this.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = w < 760 ? 40 : 30;
      camera.updateProjectionMatrix();
    };
    new ResizeObserver(resize).observe(this);
    resize();

    let visible = true;
    new IntersectionObserver(e => { visible = e[0].isIntersecting; }, { rootMargin: '200px' }).observe(this);

    let target = 0, cur = 0, intro = 0;
    const onScroll = () => {
      const r = this.getBoundingClientRect();
      target = Math.max(-1, Math.min(1, (innerHeight * 0.5 - (r.top + r.height / 2)) / innerHeight));
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const t0 = performance.now();
    const loop = () => {
      requestAnimationFrame(loop);
      if (!visible) return;
      const t = (performance.now() - t0) / 1000;
      intro = Math.min(1, reduce ? 1 : t / 2.4);
      const e = 1 - Math.pow(1 - intro, 4);
      cur += (target - cur) * 0.055;
      const idle = reduce ? 0 : 1;
      const base = mode === 'cta' ? -0.5 : mode === 'radar' ? -0.62 : -0.66;
      plane.rotation.y = base + cur * 0.7 + Math.sin(t * 0.16) * 0.045 * idle;
      plane.rotation.x = 0.035 - cur * 0.16 + Math.sin(t * 0.22) * 0.02 * idle;
      plane.rotation.z = 0.075 + cur * 0.2 + Math.sin(t * 0.19) * 0.028 * idle;
      plane.position.y = (mode === 'radar' ? -0.15 : 0.25) - cur * 0.9
        + Math.sin(t * 0.28) * 0.09 * idle + (1 - e) * 0.8;
      plane.position.x = (mode === 'cta' ? cur * 0.3 : mode === 'radar' ? cur * 0.25
        : 1.1 + cur * 1.0) + (1 - e) * (mode === 'radar' ? 2.2 : 5.5);
      renderer.render(scene, camera);
    };
    loop();
  }
}
if (!customElements.get('plane-v2')) customElements.define('plane-v2', PlaneV2);
