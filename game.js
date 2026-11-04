
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

// WARZONE LEGENDS - 3D GAME ENGINE

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87b9d5);
scene.fog = new THREE.Fog(0x87b9d5, 35, 120);

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);

const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

renderer.domElement.style.position = "fixed";
renderer.domElement.style.inset = "0";
renderer.domElement.style.zIndex = "1";

// LIGHTING

const sunlight = new THREE.DirectionalLight(0xffffff, 2);
sunlight.position.set(30, 50, 20);
sunlight.castShadow = true;
scene.add(sunlight);

scene.add(new THREE.HemisphereLight(0xffffff, 0x526b42, 1.5));

// TERRAIN

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(250, 250, 40, 40),
  new THREE.MeshStandardMaterial({
    color: 0x47783b,
    roughness: 1
  })
);

ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// ISLAND DETAILS

const treeMaterial = new THREE.MeshStandardMaterial({
  color: 0x24552b
});

const trunkMaterial = new THREE.MeshStandardMaterial({
  color: 0x60402a
});

for (let i = 0; i < 90; i++) {
  const x = (Math.random() - 0.5) * 210;
  const z = (Math.random() - 0.5) * 210;

  if (Math.abs(x) < 12 && Math.abs(z) < 12) continue;

  const tree = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.4, 3, 7),
    trunkMaterial
  );
  trunk.position.y = 1.5;
  trunk.castShadow = true;
  tree.add(trunk);

  const leaves = new THREE.Mesh(
    new THREE.ConeGeometry(2, 5, 8),
    treeMaterial
  );
  leaves.position.y = 4.5;
  leaves.castShadow = true;
  tree.add(leaves);

  tree.position.set(x, 0, z);
  scene.add(tree);
}

// PLAYER

const player = new THREE.Group();

const body = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.55, 1.1, 4, 8),
  new THREE.MeshStandardMaterial({ color: 0x263b35 })
);
body.position.y = 1.25;
body.castShadow = true;
player.add(body);

const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.4, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xc99b75 })
);
head.position.y = 2.3;
player.add(head);

const helmet = new THREE.Mesh(
  new THREE.SphereGeometry(0.44, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
  new THREE.MeshStandardMaterial({ color: 0x293b2e })
);
helmet.position.y = 2.48;
player.add(helmet);

player.position.set(0, 0, 0);
scene.add(player);

// CAMERA

camera.position.set(0, 5, 9);
camera.lookAt(player.position);

// CONTROLS

const keys = {};

window.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

const movement = {
  forward: false,
  backward: false,
  left: false,
  right: false
};

function makeControl(id, direction) {
  const button = document.getElementById(id);
  if (!button) return;

  button.addEventListener("pointerdown", e => {
    e.preventDefault();
    movement[direction] = true;
  });

  ["pointerup", "pointercancel", "pointerleave"].forEach(event => {
    button.addEventListener(event, () => {
      movement[direction] = false;
    });
  });
}

makeControl("up", "forward");
makeControl("down", "backward");
makeControl("left", "left");
makeControl("right", "right");

// GAME STATE

let gameStarted = false;

window.startGame = function () {
  gameStarted = true;
  const lobby = document.getElementById("lobby");
  if (lobby) lobby.style.display = "none";

  document.getElementById("gameControls").style.display = "block";
  document.getElementById("gameMessage").textContent =
    "BATTLEFIELD ACTIVE";
};

// ANIMATION

function animate() {
  requestAnimationFrame(animate);

  if (gameStarted) {
    const speed = 0.13;

    if (keys.w || keys.arrowup || movement.forward) {
      player.position.z -= speed;
    }

    if (keys.s || keys.arrowdown || movement.backward) {
      player.position.z += speed;
    }

    if (keys.a || keys.arrowleft || movement.left) {
      player.position.x -= speed;
    }

    if (keys.d || keys.arrowright || movement.right) {
      player.position.x += speed;
    }

    player.position.x = THREE.MathUtils.clamp(
      player.position.x, -115, 115
    );

    player.position.z = THREE.MathUtils.clamp(
      player.position.z, -115, 115
    );

    const target = new THREE.Vector3(
      player.position.x,
      5,
      player.position.z + 9
    );

    camera.position.lerp(target, 0.08);

    camera.lookAt(
      player.position.x,
      player.position.y + 1,
      player.position.z
    );
  }

  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
      
