"use client";

import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  ExtrudeGeometry,
  Group,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Shape,
  SRGBColorSpace,
  TextureLoader,
} from "three";
import { segment, type StoryMotion } from "@/lib/motion";

interface SceneProps {
  motionRef: RefObject<StoryMotion>;
  onReady: () => void;
  onUnavailable: (reason?: string) => void;
}

function tileBody(size: number) {
  const half = size / 2 - 0.006;
  const outline = new Shape();
  outline.moveTo(-half, -half);
  outline.lineTo(half, -half);
  outline.lineTo(half, half);
  outline.lineTo(-half, half);
  outline.closePath();
  const geometry = new ExtrudeGeometry(outline, {
    depth: 0.05,
    bevelEnabled: true,
    bevelThickness: 0.0075,
    bevelSize: 0.006,
    bevelSegments: 1,
    steps: 1,
    curveSegments: 1,
  });
  geometry.translate(0, 0, -0.058);
  return geometry;
}

/** Texture errors and renderer errors both return the readable HTML story. */
class SceneBoundary extends Component<
  { children: ReactNode; onUnavailable: (reason?: string) => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    this.props.onUnavailable(error.message);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function TileObject({ motionRef, onReady, onUnavailable }: SceneProps) {
  const root = useRef<Group>(null);
  const single = useRef<Group>(null);
  const pieces = useRef<Group>(null);
  const singleBody = useRef<Mesh>(null);
  const pieceGroups = useRef<(Group | null)[]>([]);
  const firstFrame = useRef(false);
  const readyFrame = useRef<number | null>(null);
  const { gl, camera, size, invalidate } = useThree();
  const source = useLoader(TextureLoader, "/images/midnight-garden.webp");
  const bodies = useMemo(() => [tileBody(3.42), tileBody(1.14)], []);

  const artwork = useMemo(() => {
    const texture = source.clone();
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy());
    texture.needsUpdate = true;
    return texture;
  }, [source, gl]);

  // One image, nine UV windows. Each face carries its own ninth of the artwork.
  const faces = useMemo(
    () =>
      Array.from({ length: 9 }, (_, index) => {
        const geometry = new PlaneGeometry(1.128, 1.128);
        const uv = geometry.attributes.uv;
        const column = index % 3;
        const row = Math.floor(index / 3);
        for (let vertex = 0; vertex < uv.count; vertex++) {
          uv.setXY(
            vertex,
            (uv.getX(vertex) + column) / 3,
            (uv.getY(vertex) + 2 - row) / 3,
          );
        }
        uv.needsUpdate = true;
        return geometry;
      }),
    [],
  );

  useEffect(() => {
    const viewCamera = camera as OrthographicCamera;
    // Constant world height makes the final artwork match the 3:2 room image.
    // R3F exposes the live, imperative Three.js camera, not React state.
    // eslint-disable-next-line react-hooks/immutability
    viewCamera.zoom = size.height / 5.2;
    viewCamera.updateProjectionMatrix();
    invalidate();
  }, [camera, size.height, invalidate]);

  useEffect(() => {
    motionRef.current.invalidate = () => {
      if (motionRef.current.active) invalidate();
    };
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      // R3F deliberately releases a detached canvas on breakpoint teardown.
      if (!canvas.isConnected) return;
      event.preventDefault();
      onUnavailable("context-lost");
    };
    canvas.addEventListener("webglcontextlost", lost);
    invalidate();
    return () => {
      // This shared model is created once and keeps its identity for the story lifetime.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      motionRef.current.invalidate = undefined;
      canvas.removeEventListener("webglcontextlost", lost);
      if (readyFrame.current !== null) cancelAnimationFrame(readyFrame.current);
    };
  }, [gl, invalidate, motionRef, onUnavailable]);

  useEffect(
    () => () => {
      artwork.dispose();
      faces.forEach((geometry) => geometry.dispose());
      bodies.forEach((geometry) => geometry.dispose());
    },
    [artwork, faces, bodies],
  );

  useFrame(() => {
    const model = motionRef.current;
    if (!root.current || !single.current || !pieces.current) return;
    const progress = model.progress;
    const materialTurn =
      segment(progress, 0.16, 0.29) * (1 - segment(progress, 0.42, 0.65));
    const division = segment(progress, 0.45, 0.54);
    const assembly = segment(progress, 0.55, 0.69);
    const matchCut = segment(progress, 0.72, 0.84);
    const split = progress >= 0.45;

    root.current.rotation.set(
      -0.13 * materialTurn,
      -0.44 * materialTurn,
      -0.025 * materialTurn,
    );
    root.current.position.set(-0.725 * matchCut, 0.868 * matchCut, 0);
    root.current.scale.set(1 + 0.016 * matchCut, 1 - 0.049 * matchCut, 1);
    single.current.visible = !split;
    pieces.current.visible = split;
    if (singleBody.current)
      singleBody.current.scale.z = 0.06 + 0.94 * segment(progress, 0.16, 0.25);

    if (split) {
      const gap = 0.19 * division * (1 - assembly) + 0.023 * assembly;
      pieceGroups.current.forEach((piece, index) => {
        if (!piece) return;
        const column = (index % 3) - 1;
        const row = 1 - Math.floor(index / 3);
        const separation = division * (1 - assembly);
        piece.position.set(
          column * (1.14 + gap),
          row * (1.14 + gap),
          Math.abs(column + row) * 0.07 * separation,
        );
        piece.rotation.set(
          row * 0.035 * separation,
          column * 0.045 * separation,
          0,
        );
      });
    }

    if (!firstFrame.current) {
      firstFrame.current = true;
      // Fade the exact-size poster only after the first successful WebGL draw.
      readyFrame.current = requestAnimationFrame(onReady);
    }
  });

  return (
    <>
      <ambientLight intensity={1.75} />
      <directionalLight position={[-4, 5, 6]} intensity={2.2} color="#fff6e6" />
      <directionalLight
        position={[4, 1, -2]}
        intensity={0.65}
        color="#dddacf"
      />
      <group ref={root}>
        <group ref={single}>
          <mesh ref={singleBody} geometry={bodies[0]}>
            <meshStandardMaterial color="#d8d1c3" roughness={0.88} />
          </mesh>
          <mesh position={[0, 0, 0.001]}>
            <planeGeometry args={[3.408, 3.408]} />
            <meshStandardMaterial
              map={artwork}
              roughness={0.62}
              metalness={0}
            />
          </mesh>
        </group>
        <group ref={pieces} visible={false}>
          {faces.map((geometry, index) => (
            <group
              key={index}
              ref={(node) => {
                pieceGroups.current[index] = node;
              }}
            >
              <mesh geometry={bodies[1]}>
                <meshStandardMaterial color="#d8d1c3" roughness={0.88} />
              </mesh>
              <mesh geometry={geometry} position={[0, 0, 0.001]}>
                <meshStandardMaterial
                  map={artwork}
                  roughness={0.62}
                  metalness={0}
                />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    </>
  );
}

export default function TileScene(props: SceneProps) {
  return (
    <SceneBoundary onUnavailable={props.onUnavailable}>
      <Canvas
        orthographic
        camera={{ position: [0, 0, 7], zoom: 100, near: 0.1, far: 30 }}
        frameloop="demand"
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        fallback="Midnight Garden artwork. The complete design story is available in the surrounding page."
        style={{ position: "absolute", inset: 0 }}
      >
        <Suspense fallback={null}>
          <TileObject {...props} />
        </Suspense>
      </Canvas>
    </SceneBoundary>
  );
}
