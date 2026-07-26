import React, { useRef, useEffect, useState, Suspense, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera, Text, useGLTF } from '@react-three/drei';
import gsap from 'gsap';
import * as THREE from 'three';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// ─── Grid Floor ───────────────────────────────────────────────────────────────
function GridFloor() {
  return (
    <group position={[0, -0.01, 0]}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#111114" roughness={0.9} metalness={0.1} />
      </mesh>
      <gridHelper args={[40, 40, '#44444c', '#26262b']} position={[0, 0, 0]} />
    </group>
  );
}

// Check if clicked target is the Monitor Screen material
function isStrictScreenTarget(obj) {
  if (!obj || !obj.material) return false;
  const mat = obj.material;
  if (Array.isArray(mat)) return mat.some((m) => m && m.name === 'Monitor Screen');
  return mat.name === 'Monitor Screen';
}

// ─── Mechanical Keyboard Sound ──────────────────────────────────────────
let audioCtx = null;

// ─── Mechanical Keyboard Sound ──────────────────────────────────────────
const KEYBOARD_SOUND_URL = 'https://raw.githubusercontent.com/Nigh/OpenClickSound/main/Sound/01/kt01-click-03-01.wav';
const keyboardAudio = new Audio(KEYBOARD_SOUND_URL);
keyboardAudio.volume = 0.4;
keyboardAudio.preload = 'auto';

function playKeyClick() {
  try {
    const clone = keyboardAudio.cloneNode();
    clone.volume = 0.4;
    clone.play().catch(() => {});
  } catch (e) { /* silent */ }
}


// ─── Swirl Sound ────────────────────────────────────────────────────────
const SWIRL_SOUND_URL = 'https://remotion.media/whoosh.wav';
const swirlAudio = new Audio(SWIRL_SOUND_URL);
swirlAudio.volume = 0.3;
swirlAudio.preload = 'auto';

function playSwirl() {
  try {
    const clone = swirlAudio.cloneNode();
    clone.volume = 0.3;
    clone.play().catch(() => {});
  } catch (e) { /* silent */ }
}

// ─── Check if a mesh is a keyboard key ────────────────────────────────
function isKeyboardKey(obj) {
  if (!obj || !obj.isMesh) return false;
  const name = obj.name?.toLowerCase() || '';
  // Keyboard keys are at y≈0.48 on the desk — Extruded010–036 + Spacebar
  if (name === 'spacebar') return true;
  if (!/^extruded\d+$/.test(name)) return false;
  // Check Y position to avoid catching other "Extruded" objects (flower, etc.)
  return obj.position.y > 0.4 && obj.position.y < 0.6;
}

// ─── Main 3D Model with Dynamic Screen Text Overlay ──────────────────────────
function MainModel({ onEnter }) {
  const { gl, raycaster, pointer, camera, scene } = useThree();
  const [model, setModel] = useState(null);
  const [screenData, setScreenData] = useState(null);
  const [hintState, setHintState] = useState(null); // { text, position }
  const textRef = useRef();
  const screenMatRef = useRef();
  const pressingKeys = useRef(new Set());
  const lastHovered = useRef(null);
  const rayTick = useRef(0);

  // CRT Flicker Animation — smooth natural CRT pulse
  useFrame((state) => {
    if (!screenMatRef.current && !textRef.current) return;
    const t = state.clock.elapsedTime;
    // Gentle sine wave with subtle micro-flicker
    const pulse = Math.sin(t * 8) * 0.12 + 0.88;
    const micro = Math.random() < 0.04 ? (Math.random() - 0.5) * 0.1 : 0;
    const brightness = Math.max(0.5, Math.min(1.0, pulse + micro));

    if (screenMatRef.current) {
      const val = brightness * 0.08;
      screenMatRef.current.color.setRGB(val, val, val * 1.4);
    }
    if (textRef.current) {
      textRef.current.fillOpacity = Math.max(0.5, brightness);
    }
  });

  // ─── Hover Detection via DOM pointermove ────────────────────────────
  // Uses native Canvas pointermove to detect what's under the cursor
  useEffect(() => {
    if (!gl || !model) return;
    const canvas = gl.domElement;
    if (!canvas) return;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      pointer.set(x, y);
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(model.children, true);

      if (intersects.length > 0) {
        const obj = intersects[0].object;
        if (obj === lastHovered.current) return;
        lastHovered.current = obj;

        if (isStrictScreenTarget(obj)) {
          document.body.style.cursor = 'pointer';
          setHintState(null);
        } else if (obj.userData?.isKey) {
          document.body.style.cursor = 'pointer';
          const keyPos = new THREE.Vector3();
          obj.getWorldPosition(keyPos);
          keyPos.y += 0.6;
          setHintState({ text: '⌨️ try clicking keys ⌨️', position: keyPos.toArray() });
        } else if (obj.userData?.isVase) {
          document.body.style.cursor = 'pointer';
          const pos = new THREE.Vector3();
          obj.getWorldPosition(pos);
          pos.y += 2.0;
          setHintState({ text: 'give it a spin', position: pos.toArray() });
        } else if (obj.userData?.isFlower) {
          document.body.style.cursor = 'grab';
          let flowerGroup = obj;
          while (flowerGroup.parent && !flowerGroup.parent.userData?.isFlowerGroup && flowerGroup.parent.parent) {
            flowerGroup = flowerGroup.parent;
          }
          const pos = new THREE.Vector3();
          (flowerGroup.userData?.isFlowerGroup ? flowerGroup : obj).getWorldPosition(pos);
          pos.y += 3.5;
          setHintState({ text: '✦ it might spin ✦', position: pos.toArray() });
        } else {
          let isFlowerDescendant = false;
          let p = obj.parent;
          while (p) {
            if (p.userData?.isFlowerGroup) { isFlowerDescendant = true; break; }
            p = p.parent;
          }
          if (isFlowerDescendant) {
            document.body.style.cursor = 'grab';
            let flowerGroup = obj;
            while (flowerGroup.parent && !flowerGroup.parent.userData?.isFlowerGroup && flowerGroup.parent.parent) {
              flowerGroup = flowerGroup.parent;
            }
            const pos = new THREE.Vector3();
            (flowerGroup.userData?.isFlowerGroup ? flowerGroup : obj).getWorldPosition(pos);
            pos.y += 3.5;
            setHintState({ text: '✦ it might spin ✦', position: pos.toArray() });
          } else {
            lastHovered.current = null;
            document.body.style.cursor = 'auto';
            setHintState(null);
          }
        }
      } else if (lastHovered.current !== null) {
        lastHovered.current = null;
        document.body.style.cursor = 'auto';
        setHintState(null);
      }
    };

    canvas.addEventListener('pointermove', handleMouseMove);
    return () => canvas.removeEventListener('pointermove', handleMouseMove);
  }, [gl, model, pointer, raycaster, camera]);

  useEffect(() => {
    let isMounted = true;

    const manager = new THREE.LoadingManager();
    manager.setURLModifier((url) => {
      if (/ishu\.jpg/.test(url)) return '/assets/Polaroid/ishu_1.jpg';
      return url;
    });

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

    const ktx2Loader = new KTX2Loader(manager);
    ktx2Loader.setTranscoderPath('/libs/basis/');
    ktx2Loader.detectSupport(gl);

    const loader = new GLTFLoader(manager);
    loader.setDRACOLoader(dracoLoader);
    loader.setKTX2Loader(ktx2Loader);

    loader.load(
      '/deploy-models/mainscene.glb',
      (gltf) => {
        if (!isMounted) return;
        const loadedScene = gltf.scene;
        loadedScene.updateMatrixWorld(true);

        loadedScene.traverse((obj) => {
          // Hide top sticky note and its shadow plane
          // Hide specific objects and their shadows
          if (obj.name) {
            const lower = obj.name.toLowerCase();

            // These are the stickers on the right side of the desk to keep
            const isRightSideSticker =
              lower.includes('mid_sticker') ||
              lower.includes('bottom_sticker.002') ||
              lower.includes('filler_sticker.005') ||
              lower.includes('leftmost_sticker.001');

            if (
              lower.includes('flippedcard') ||
              lower.includes('polaroid') ||
              (lower.includes('sticker') && !isRightSideSticker) ||
              lower.includes('marker') ||
              lower.includes('plane') ||
              lower.includes('this_is_me') ||
              lower.includes('this me') ||
              lower.startsWith('extruded.06') ||
              lower.startsWith('extruded.07') ||
              lower.includes('shadow') ||
              lower.includes('solid.00') ||
              lower.includes('quad') ||
              lower.includes('ground') ||
              lower.includes('rect') ||
              lower.includes('floor') ||
              lower.includes('dino') ||
              lower.includes('raptor') ||
              lower.includes('lottiemon') ||
              lower.includes('car') ||
              lower.includes('vehicle') ||
              lower.includes('ae86') ||
              lower.includes('86') ||
              lower.includes('toyota') ||
              lower.includes('hatchback') ||
              lower.includes('sprinter') ||
              lower.includes('corolla')
            ) {
              obj.visible = false;
              obj.scale.set(0, 0, 0);
              obj.position.set(0, -100, 0);
            }
          }

          // Also hide by material to perfectly catch all cards and sticky notes
          if (obj.material) {
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
            mats.forEach(m => {
              if (m && m.name) {
                const mLower = m.name.toLowerCase();
                if (
                  mLower.includes('sticky note') ||
                  mLower.includes('motion card') ||
                  mLower.includes('polaroid') ||
                  mLower === 'tape' ||
                  mLower.includes('shadow')
                ) {
                  obj.visible = false;
                  obj.scale.set(0, 0, 0);
                  obj.position.set(0, -100, 0);
                }
              }
            });
          }

          if (obj.isMesh) {
            // ── Mark keyboard keys ──
            if (isKeyboardKey(obj)) {
              obj.userData.isKey = true;
            }
            // ── Mark flowers (extruded meshes NOT at keyboard height or on the computer) ──
            const name = obj.name?.toLowerCase() || '';
            if (/^extruded\d+$/.test(name) && !obj.userData.isKey) {
              // Exclude objects attached to the computer/monitor (orange button, etc.)
              const isOnComputer = (() => {
                // If it's high above the desk (y > 0.6), it's on the computer
                if (obj.position.y > 0.6) return true;
                let p = obj.parent;
                while (p) {
                  const pn = p.name?.toLowerCase() || '';
                  if (pn.includes('computer') || pn.includes('monitor') || pn.includes('screen') || pn.includes('button') || pn.includes('case') || pn.includes('desk')) return true;
                  p = p.parent;
                }
                return false;
              })();
              if (!isOnComputer) {
                obj.userData.isFlower = true;
                // Find the parent group so we can rotate the whole flower
                let parent = obj.parent;
                while (parent && !parent.isGroup && parent.parent) {
                  parent = parent.parent;
                }
                if (parent && parent.isGroup && parent !== model) {
                  parent.userData.isFlowerGroup = true;
                }
              }
            }

            // ── Mark vase objects ──
            const nameLower = obj.name?.toLowerCase() || '';
            if (nameLower.includes('vase') || nameLower.includes('pot') || nameLower === 'cup') {
              obj.userData.isVase = true;
            }

            // Hide any floor-level dark rectangles (shadow planes, markers, etc.)
            if (obj.position.y > -0.05 && obj.position.y < 0.1) {
              const n = obj.name?.toLowerCase() || '';
              const isDeskOrModelPart =
                n.includes('monitor') ||
                n.includes('screen') ||
                n.includes('desk') ||
                n.includes('keyboard') ||
                n.includes('stand') ||
                n.includes('case') ||
                n.includes('extruded') ||
                n.includes('cylinder') ||
                n.includes('leg');
              if (!isDeskOrModelPart) {
                obj.visible = false;
                obj.scale.set(0, 0, 0);
                obj.position.set(0, -100, 0);
              }
            }

            obj.castShadow = true;
            obj.receiveShadow = true;

            const mat = obj.material;

            // ── Find the Monitor Screen mesh ──
            if (mat && !Array.isArray(mat) && mat.name === 'Monitor Screen') {
              // Replace with a plain dark CRT material (no texture needed)
              const darkMat = new THREE.MeshBasicMaterial({ color: '#0d0d1a' });
              darkMat.name = 'Monitor Screen';
              obj.material = darkMat;
              screenMatRef.current = darkMat;

              // Compute screen world-space center from bounding box
              obj.geometry.computeBoundingBox();
              obj.geometry.computeVertexNormals();

              const bb = obj.geometry.boundingBox;
              const center = new THREE.Vector3();
              bb.getCenter(center);
              center.applyMatrix4(obj.matrixWorld);

              // Compute average face normal in world space
              const nAttr = obj.geometry.attributes.normal;
              const avgNormal = new THREE.Vector3(0, 0, 0);
              if (nAttr) {
                for (let i = 0; i < nAttr.count; i++) {
                  avgNormal.x += nAttr.getX(i);
                  avgNormal.y += nAttr.getY(i);
                  avgNormal.z += nAttr.getZ(i);
                }
                avgNormal.normalize();
                const normalMatrix = new THREE.Matrix3().getNormalMatrix(obj.matrixWorld);
                avgNormal.applyMatrix3(normalMatrix).normalize();
              } else {
                // Fallback: assume screen faces forward-right (toward isometric camera)
                avgNormal.set(1, 0, 1).normalize();
              }

              // Position text slightly in front of screen surface
              const textPos = center.clone().add(avgNormal.clone().multiplyScalar(0.03));

              // Compute text rotation:
              // We want the text to face the viewer, so we look at a point in front of the screen along the normal.
              const helper = new THREE.Object3D();
              helper.position.copy(textPos);
              helper.lookAt(textPos.clone().add(avgNormal));

              // Compute font size from screen bounding box
              const bbSize = new THREE.Vector3();
              bb.getSize(bbSize);
              const dims = [bbSize.x, bbSize.y, bbSize.z].sort((a, b) => b - a);
              const screenWidth = dims[0];

              setScreenData({
                position: textPos.toArray(),
                rotation: [helper.rotation.x, helper.rotation.y, helper.rotation.z],
                fontSize: screenWidth * 0.065,
              });
            } else if (mat && !Array.isArray(mat) && mat.map) {
              mat.map.anisotropy = 8;
              mat.map.needsUpdate = true;
            }

            // Handle array materials (just in case)
            if (Array.isArray(mat)) {
              mat.forEach((m, idx) => {
                if (m && m.name === 'Monitor Screen') {
                  const darkMat = new THREE.MeshBasicMaterial({ color: '#0d0d1a' });
                  darkMat.name = 'Monitor Screen';
                  obj.material[idx] = darkMat;
                  screenMatRef.current = darkMat;
                }
                if (m && m.map) {
                  m.map.anisotropy = 8;
                  m.map.needsUpdate = true;
                }
              });
            }
          }
        });

        setModel(loadedScene);
      },
      undefined,
      (err) => {
        console.error('GLB mainscene load error:', err);
      }
    );

    return () => {
      isMounted = false;
      dracoLoader.dispose();
      ktx2Loader.dispose();
    };
  }, [gl]);

  if (!model) return null;

  const handleClick = (e) => {
    e.stopPropagation();
    // Check if it's the monitor screen
    if (isStrictScreenTarget(e.object)) {
      onEnter?.();
      return;
    }
    // Check if it's a keyboard key
    if (e.object.userData?.isKey) {
      const key = e.object;
      const id = key.uuid;
      if (pressingKeys.current.has(id)) return;
      pressingKeys.current.add(id);

      // Mechanical key press: snap down, snap back — no bounce
      const pressDepth = 0.08;
      gsap.to(key.position, {
        y: key.position.y - pressDepth,
        duration: 0.1,
        ease: 'power3.in',
        overwrite: 'auto',
        onComplete: () => {
          gsap.to(key.position, {
            y: key.position.y + pressDepth,
            duration: 0.15,
            ease: 'power2.out',
            overwrite: 'auto',
            onComplete: () => pressingKeys.current.delete(id),
          });
        },
      });
      // Play mechanical click sound
      playKeyClick();
    }
    // Check if it's a flower — spin the whole plant 360°
    if (e.object.userData?.isFlower) {
      // Walk up to find the flower group parent
      let flowerGroup = e.object;
      while (flowerGroup.parent && !flowerGroup.parent.userData?.isFlowerGroup && flowerGroup.parent.parent) {
        flowerGroup = flowerGroup.parent;
      }
      if (flowerGroup.parent?.userData?.isFlowerGroup) {
        flowerGroup = flowerGroup.parent;
      }
      const id = flowerGroup.uuid;
      if (pressingKeys.current.has(id)) return;
      pressingKeys.current.add(id);

      playSwirl();
      gsap.to(flowerGroup.rotation, {
        y: flowerGroup.rotation.y + Math.PI * 2,
        duration: 1.0,
        ease: 'power3.inOut',
        overwrite: 'auto',
        onComplete: () => pressingKeys.current.delete(id),
      });
    }
  };

  return (
    <>
      <primitive
        object={model}
        onClick={handleClick}
      />

      {/* ── 3D Text Overlay positioned directly on screen face ── */}
      {screenData && (
        <Text
          ref={textRef}
          position={screenData.position}
          rotation={screenData.rotation}
          fontSize={screenData.fontSize}
          color="#ffd700"
          anchorX="center"
          anchorY="middle"
          fillOpacity={1}
          outlineWidth={screenData.fontSize * 0.04}
          outlineColor="#ffe000"
          outlineOpacity={0.35}
          onClick={(e) => {
            e.stopPropagation();
            onEnter?.();
          }}
          onPointerOver={() => {
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          PORTFOLIO
        </Text>
      )}

      {/* ── Floating object hint (keys, flowers, vase) ── */}
      {hintState && (
        <Text
          position={hintState.position}
          fontSize={0.2}
          color="#facc15"
          anchorX="center"
          anchorY="middle"
          rotation={[-0.35, 0, 0]}
          outlineWidth={0.04}
          outlineColor="#000"
          outlineOpacity={0.85}
          frustumCulled={false}
        >
          {hintState.text}
        </Text>
      )}
    </>
  );
}

// ─── Interactive Floor Label ──────────────────────────────────────────────
function FloorLabel({ children, fontSize, color, position, letterSpacing, riseAmount = 0.6, onClick }) {
  const groupRef = useRef();
  const textRef = useRef();
  const hovering = useRef(false);
  const baseY = position ? position[1] : 0;

  // Ensure text never frustum-culled so it stays visible when orbiting
  useEffect(() => {
    if (textRef.current) {
      textRef.current.frustumCulled = false;
    }
  }, []);

  const handleOver = (e) => {
    if (!groupRef.current || hovering.current) return;
    hovering.current = true;
    e.stopPropagation();

    gsap.to(groupRef.current.position, {
      y: baseY + riseAmount,
      duration: 0.45,
      ease: 'power3.out',
      overwrite: 'auto',
    });
    // Counteract text's -PI/2 flat rotation + add upward tilt toward viewer
    gsap.to(groupRef.current.rotation, {
      x: Math.PI / 2 - 0.5,
      duration: 0.5,
      ease: 'power2.out',
      overwrite: 'auto',
    });
    document.body.style.cursor = onClick ? 'pointer' : 'default';
  };

  const handleOut = (e) => {
    if (!groupRef.current) return;
    e.stopPropagation();

    gsap.to(groupRef.current.position, {
      y: baseY,
      duration: 0.5,
      ease: 'power2.out',
      overwrite: 'auto',
    });
    // Reset group rotation so only text's own -PI/2 applies (flat on floor)
    gsap.to(groupRef.current.rotation, {
      x: 0,
      duration: 0.55,
      ease: 'power2.inOut',
      overwrite: 'auto',
    });
    // Delay reset so re-hover within 200ms is seamless
    gsap.delayedCall(0.2, () => { hovering.current = false; });
    if (!onClick) document.body.style.cursor = 'auto';
  };

  // Approximate text width based on chars, font size, and letter spacing
  const textStr = typeof children === 'string' ? children : '';
  const approxTextWidth = textStr.length * fontSize * (0.5 + (letterSpacing || 0));
  const hitboxW = Math.max(approxTextWidth * 1.3, 1.2);
  const hitboxD = Math.max(fontSize * 1.3, 0.5);
  const hitboxX = approxTextWidth * 0.5;

  return (
    <group ref={groupRef} position={position} rotation={[0, 0, 0]}>
      {/* Invisible hitbox sized to match text */}
      <mesh
        position={[hitboxX, 0, 0]}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
        onClick={(e) => { e.stopPropagation(); onClick?.(); }}
        renderOrder={0}
      >
        <boxGeometry args={[hitboxW, 0.02, hitboxD]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} depthTest={false} />
      </mesh>
      {/* Visual 3D text lying flat on the floor */}
      <Text
        ref={textRef}
        fontSize={fontSize}
        color={color}
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        anchorX="left"
        anchorY="middle"
        letterSpacing={letterSpacing ?? 0}
        renderOrder={1}
      >
        {children}
      </Text>
    </group>
  );
}

// ─── Floor Labels ─────────────────────────────────────────────────────────
function FloorLabels() {
  return (
    <group position={[0, 0.02, 0]}>
      {/* Left Navigation */}
      <group position={[-7.2, 0, -4.2]}>
        <FloorLabel fontSize={0.48} color="#ffffff" position={[0, 0, 0]} riseAmount={0.5}>
          WORK
        </FloorLabel>
        <FloorLabel fontSize={0.48} color="#ffffff" position={[0, 0, 0.9]} riseAmount={0.5}>
          GAME
        </FloorLabel>
        <FloorLabel fontSize={0.48} color="#ffffff" position={[0, 0, 1.8]} riseAmount={0.5}>
          CHAT
        </FloorLabel>
        <FloorLabel fontSize={0.48} color="#ffffff" position={[0, 0, 2.7]} riseAmount={0.5}>
          RESUME
        </FloorLabel>
      </group>

      {/* Right Name */}
      <FloorLabel
        fontSize={0.68}
        color="#ffffff"
        letterSpacing={0.1}
        position={[6.2, 0, -3.5]}
        riseAmount={0.7}
      >
        LEBRON
      </FloorLabel>
      <FloorLabel
        fontSize={0.28}
        color="#888899"
        letterSpacing={0.15}
        position={[6.2, 0, -2.6]}
        riseAmount={0.5}
      >
        VIBE CODER
      </FloorLabel>

      {/* Social Footer — heading */}
      <FloorLabel
        fontSize={0.26}
        color="#888899"
        position={[-7.2, 0, 3.6]}
        riseAmount={0.4}
      >
        LET'S CONNECT
      </FloorLabel>

      {/* Social Footer — separate clickable links in yellow */}
      <FloorLabel
        fontSize={0.22}
        color="#facc15"
        letterSpacing={0.05}
        position={[-7.2, 0, 4.0]}
        riseAmount={0.4}
        onClick={() => window.location.href = 'mailto:lebronpereira7@gmail.com'}
      >
        MAIL
      </FloorLabel>
      <FloorLabel
        fontSize={0.22}
        color="#facc15"
        letterSpacing={0.05}
        position={[-7.2, 0, 4.4]}
        riseAmount={0.4}
        onClick={() => window.open('https://in.linkedin.com/in/lebron-pereira-707079350', '_blank')}
      >
        LINKEDIN
      </FloorLabel>
      <FloorLabel
        fontSize={0.22}
        color="#facc15"
        letterSpacing={0.05}
        position={[-7.2, 0, 4.8]}
        riseAmount={0.4}
        onClick={() => window.open('https://github.com/Lebronmeow', '_blank')}
      >
        GITHUB
      </FloorLabel>
    </group>
  );
}

// ─── Cat Meow Sound ──────────────────────────────────────────────────────
const MEOW_SOUND_URL = 'https://raw.githubusercontent.com/Mirajjj/claude-meow-sound-notifications/main/sounds/meow_1_normal.wav';
const meowAudio = new Audio(MEOW_SOUND_URL);
meowAudio.volume = 0.6;
meowAudio.preload = 'auto';

function playMeow() {
  try {
    const clone = meowAudio.cloneNode();
    clone.volume = 0.6;
    clone.play().catch(() => {});
  } catch (e) { /* silent */ }
}

// ─── Cat Model (loaded from GLB) ────────────────────────────────────────
const CAT_URL = 'https://raw.githubusercontent.com/Hajorda/KeduGallery/main/assets/cat.glb';



// ─── Hover Hint (Floating Tooltip) ─────────────────────────────────────
function HoverHint({ position, text }) {
  const [visible, setVisible] = useState(false);
  const textRef = useRef();
  const hoverCount = useRef(0);

  useEffect(() => {
    if (!textRef.current) return;
    if (visible) {
      gsap.killTweensOf(textRef.current.position);
      gsap.to(textRef.current.position, {
        y: 0.5,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
        onComplete: () => {
          gsap.to(textRef.current.position, {
            y: 0.4,
            duration: 1.0,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
          });
        },
      });
    } else {
      gsap.killTweensOf(textRef.current.position);
      if (textRef.current.position) textRef.current.position.y = 0.35;
    }
  }, [visible]);

  const handleOver = (e) => {
    e.stopPropagation();
    hoverCount.current++;
    setVisible(true);
  };

  const handleOut = (e) => {
    e.stopPropagation();
    hoverCount.current = Math.max(0, hoverCount.current - 1);
    // Debounce: only hide when all overlapping meshes are unhovered
    setTimeout(() => {
      if (hoverCount.current <= 0) {
        hoverCount.current = 0;
        setVisible(false);
      }
    }, 80);
  };

  return (
    <group position={position}>
      {/* Large invisible trigger zone — tall enough to never be missed */}
      <mesh
        position={[0, 0.3, 0]}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
      >
        <boxGeometry args={[2.5, 0.4, 0.7]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {visible && (
        <Text
          ref={textRef}
          position={[0, 0.4, 0]}
          fontSize={0.22}
          color="#facc15"
          anchorX="center"
          anchorY="middle"
          rotation={[-0.35, 0, 0]}
          outlineWidth={0.04}
          outlineColor="#000"
          outlineOpacity={0.85}
          frustumCulled={false}
          onPointerOver={handleOver}
          onPointerOut={handleOut}
        >
          {text}
        </Text>
      )}
    </group>
  );
}

function CatModel() {
  const groupRef = useRef();
  const busy = useRef(false);
  const { scene } = useGLTF(CAT_URL);

  // Enable shadows on all meshes
  useEffect(() => {
    if (!scene) return;
    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
  }, [scene]);

  const handleClick = (e) => {
    e.stopPropagation();
    if (!groupRef.current || busy.current) return;
    busy.current = true;

    const target = groupRef.current;
    const originalPos = { x: target.position.x, z: target.position.z };
    const originalRot = target.rotation.y;

    // 1. Meow
    playMeow();

    // 2. Walk in a small circle and return
    const tl = gsap.timeline({
      onComplete: () => { busy.current = false; },
    });

    const ARC = Math.PI * 0.8;

    tl.to(target.rotation, {
      y: originalRot + ARC,
      duration: 0.6,
      ease: 'power2.inOut',
    }, 0)
    .to(target.rotation, {
      y: originalRot,
      duration: 0.6,
      ease: 'power2.inOut',
    }, 0.6);

    tl.to(target.position, {
      x: originalPos.x - 0.4,
      z: originalPos.z - 0.3,
      duration: 0.7,
      ease: 'power2.inOut',
    }, 0)
    .to(target.position, {
      x: originalPos.x + 0.4,
      z: originalPos.z + 0.3,
      duration: 0.7,
      ease: 'power2.inOut',
    }, 0.6)
    .to(target.position, {
      x: originalPos.x,
      z: originalPos.z,
      duration: 0.5,
      ease: 'power2.inOut',
    }, 1.3);
  };

  return (
    <group
      ref={groupRef}
      position={[4.57, 0.1, -0.30]}
      rotation={[0, 1.57, 0]}
      scale={[0.15, 0.15, 0.15]}
      onClick={handleClick}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      <primitive object={scene} />
    </group>
  );
}



// ─── Porsche Engine Sounds ────────────────────────────────────────────
const PORSCHE_START_URL = 'https://soundfxcenter.com/transport/car/8d82b5_Porsche_Start_Sound_Effect.mp3';
const PORSCHE_MOVE_URL = 'https://soundfxcenter.com/transport/car/8d82b5_Porsche_Move_Sound_Effect.mp3';
const porscheStartAudio = new Audio(PORSCHE_START_URL);
porscheStartAudio.volume = 0.5;
porscheStartAudio.preload = 'auto';
const porscheMoveAudio = new Audio(PORSCHE_MOVE_URL);
porscheMoveAudio.volume = 0.4;
porscheMoveAudio.preload = 'auto';

function playPorscheStart() {
  try { porscheStartAudio.cloneNode().play().catch(() => {}); } catch (e) {}
}
function playPorscheMove() {
  try { porscheMoveAudio.cloneNode().play().catch(() => {}); } catch (e) {}
}

// ─── Porsche Model with click-to-drift animation ───────────────────────
function PorscheModel() {
  const groupRef = useRef();
  const { scene } = useGLTF('/models/porsche.glb');
  const busy = useRef(false);
  const originalPos = useRef({ x: -4.0, y: 0.32, z: -3.5 });
  const originalRot = useRef(2.5);
  const headlightsRef = useRef([]);
  const wheelsRef = useRef([]);
  const wheelGroupRef = useRef(null);

  // Find headlight and wheel meshes
  useEffect(() => {
    if (!scene) return;
    const lights = [];
    const wheels = [];
    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        const name = obj.name?.toLowerCase() || '';
        if (name.includes('vehiclelights') || (name.includes('lights') && name.includes('lod0'))) {
          lights.push(obj);
        }
        if (name.includes('tyre') || name.includes('ssr')) {
          wheels.push(obj);
        }
      }
      // Find the wheel group (parent of wheel meshes)
      if (obj.isGroup && obj.name?.toLowerCase() === 'wheel') {
        wheelGroupRef.current = obj;
      }
    });
    headlightsRef.current = lights;
    wheelsRef.current = wheels;
  }, [scene]);

  const handleClick = (e) => {
    e.stopPropagation();
    if (!groupRef.current || busy.current) return;
    busy.current = true;

    const target = groupRef.current;
    const orig = originalPos.current;
    const origRot = originalRot.current;

    // 1. Headlights on with glow
    headlightsRef.current.forEach((mesh) => {
      if (mesh.material) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((mat) => {
          if (mat && mat.emissive) {
            mat.emissive.setHex(0xffdd44);
            mat.emissiveIntensity = 3.0;
          }
        });
      }
    });

    // 2. Play engine start sound
    playPorscheStart();

    // 3. Wait for engine start, then begin drift
    const ENGINE_START_DELAY = 1500; // ms to wait for engine sound to play

    setTimeout(() => {
      playPorscheMove();

      // Phase 1: Move slightly right, then flick the rear toward the user
      // Phase 2: 360 circle behind the CRT
      // Phase 3: Return to start and park

      const PHASE1_TIME = 1.0;
      const PHASE2_TIME = 5.5;
      const PHASE3_TIME = 1.0;

      // The rear kick-out point (where the car's rear faces the user)
      const kickX = orig.x + 2.5;
      const kickZ = orig.z + 1.5;

      // Wide circle behind the desk
      const CIRCLE_CENTER = { x: -0.5, z: -5.0 };
      const RADIUS = 5.5;

      const driftState = { angle: 0 };

      const tl = gsap.timeline({
        onComplete: () => {
          headlightsRef.current.forEach((mesh) => {
            if (mesh.material) {
              const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              mats.forEach((mat) => {
                if (mat && mat.emissive) {
                  mat.emissive.setHex(0x000000);
                  mat.emissiveIntensity = 0;
                }
              });
            }
          });
          busy.current = false;
        },
      });

      // Phase 1: Move right and flick the rear
      // Car moves forward-right while rotating sharply (rear swings out)
      tl.to(target.position, {
        x: kickX,
        z: kickZ,
        duration: PHASE1_TIME,
        ease: 'power2.out',
      }, 0)
      .to(target.rotation, {
        y: 0.8, // Rotate so rear faces toward user
        duration: PHASE1_TIME * 0.7,
        ease: 'power2.out',
      }, 0);

      // Phase 2: 360 circle behind the desk
      // The car is now facing roughly toward the circle, begin the drift
      const circleStartAngle = Math.atan2(kickZ - CIRCLE_CENTER.z, kickX - CIRCLE_CENTER.x);

      // Smoothly transition into the circle
      tl.to(driftState, {
        angle: circleStartAngle + Math.PI * 2,
        duration: PHASE2_TIME,
        ease: 'none',
        onUpdate: () => {
          const a = driftState.angle;
          target.position.x = CIRCLE_CENTER.x + Math.cos(a) * RADIUS;
          target.position.z = CIRCLE_CENTER.z + Math.sin(a) * RADIUS;

          // Face tangent to circle + drift angle (rear slides out)
          const tangent = a + Math.PI / 2;
          target.rotation.y = tangent + 0.35;

          // Spin wheels — rotate the wheel group for rolling + steering
          if (wheelGroupRef.current) {
            wheelGroupRef.current.rotation.x += 0.3;
          }
          wheelsRef.current.forEach((wheel) => {
            wheel.rotation.x += 0.3;
          });
        },
      }, PHASE1_TIME);

      // Phase 3: Return to start and park
      tl.to(target.position, {
        x: orig.x,
        z: orig.z,
        duration: PHASE3_TIME,
        ease: 'power2.inOut',
      }, PHASE1_TIME + PHASE2_TIME)
      .to(target.rotation, {
        y: originalRot.current,
        duration: PHASE3_TIME * 0.6,
        ease: 'power2.out',
      }, PHASE1_TIME + PHASE2_TIME);
    }, ENGINE_START_DELAY);
  };

  return (
    <group
      ref={groupRef}
      position={[-4.0, 0.32, -3.5]}
      rotation={[0, 2.5, 0]}
      scale={[0.5, 0.5, 0.5]}
      onClick={handleClick}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      <primitive object={scene} />
    </group>
  );
}

// ─── Camera Rig & Controls ────────────────────────────────────────────────────
function CameraRig({ isZoomedIn }) {
  const cameraRef = useRef();
  const controlsRef = useRef();

  useEffect(() => {
    if (!cameraRef.current) return;

    if (isZoomedIn) {
      if (controlsRef.current) controlsRef.current.enabled = false;
      gsap.to(cameraRef.current, {
        zoom: 350,
        duration: 1.4,
        ease: 'power3.inOut',
        onUpdate: () => cameraRef.current?.updateProjectionMatrix(),
      });
    } else {
      if (controlsRef.current) controlsRef.current.enabled = true;
      gsap.to(cameraRef.current, {
        zoom: 70,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: () => cameraRef.current?.updateProjectionMatrix(),
      });
    }
  }, [isZoomedIn]);

  return (
    <>
      <OrthographicCamera
        ref={cameraRef}
        makeDefault
        zoom={70}
        position={[8, 8, 8]}
        near={-100}
        far={100}
      />
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        panSpeed={0.3}
        minZoom={30}
        maxZoom={120}
        minPolarAngle={0.3}
        maxPolarAngle={1.35}
        dampingFactor={0.1}
        enableDamping
        target={[0, 0.5, 0]}
      />
    </>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function ComputerScene({ onEnter, isZoomedIn }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
        powerPreference: 'high-performance',
      }}
    >
      <color attach="background" args={['#111114']} />

      {/* Core scene — loads immediately, no suspense */}
      <ambientLight intensity={0.9} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-8, 10, -5]} intensity={0.5} color="#88b5ff" />
      <pointLight position={[0, 5, 0]} intensity={0.4} color="#ffffff" />

      {/* Floor */}
      <GridFloor />

      <Suspense fallback={null}>
        {/* GLTF Model + 3D Text on Screen */}
        <MainModel onEnter={onEnter} />
      </Suspense>

      {/* Floor Labels */}
      <FloorLabels />

      {/* Extra models — each in their own Suspense so they don't block the scene */}
      <Suspense fallback={null}>
        <CatModel />
      </Suspense>
      <Suspense fallback={null}>
        <PorscheModel />
      </Suspense>

      {/* Floating Hints */}
      <HoverHint position={[4.57, 0.5, -0.30]} text="🐱 pet the cat 🐱" />

      {/* Camera Rig */}
      <CameraRig isZoomedIn={isZoomedIn} />
    </Canvas>
  );
}