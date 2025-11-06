import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Particle system for floating dots around the orb
function Particles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 1000;

  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Random positions in a sphere
      const radius = 3 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Gradient colors (cyan to purple)
      const t = Math.random();
      colors[i * 3] = t * 0.6 + 0.4; // R
      colors[i * 3 + 1] = 0.8 - t * 0.3; // G
      colors[i * 3 + 2] = 0.9 + t * 0.1; // B
    }

    return { positions, colors };
  }, []);

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.05;
      particlesRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Main animated sphere with enhanced materials
function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { mouse } = useThree();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Smooth rotation with time
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.15;
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.2;

      // Gentle mouse interaction
      meshRef.current.rotation.x += mouse.y * 0.05;
      meshRef.current.rotation.y += mouse.x * 0.05;

      // Subtle floating animation
      meshRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.2;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1.5, 128, 128]} scale={1.4}>
      <MeshDistortMaterial
        color="#00d4ff"
        attach="material"
        distort={0.5}
        speed={1.5}
        roughness={0.1}
        metalness={0.8}
        emissive="#00d4ff"
        emissiveIntensity={0.3}
      />
    </Sphere>
  );
}

// Outer glow sphere
function GlowSphere() {
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (glowRef.current) {
      glowRef.current.rotation.x = clock.getElapsedTime() * -0.1;
      glowRef.current.rotation.y = clock.getElapsedTime() * -0.15;
      
      // Pulsing effect
      const scale = 1.8 + Math.sin(clock.getElapsedTime() * 2) * 0.1;
      glowRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <Sphere ref={glowRef} args={[1.5, 64, 64]}>
      <meshBasicMaterial
        color="#a855f7"
        transparent
        opacity={0.15}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
      />
    </Sphere>
  );
}

// Loading fallback
function Loader() {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#00d4ff" wireframe />
    </mesh>
  );
}

export const AnimatedOrb = () => {
  return (
    <div className="w-full h-[400px] md:h-[500px] relative">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <Suspense fallback={<Loader />}>
          {/* Enhanced lighting setup */}
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 5, 5]} intensity={1} color="#00d4ff" />
          <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#a855f7" />
          <pointLight position={[0, 0, 0]} intensity={1.5} color="#ffffff" distance={8} />
          <pointLight position={[3, 3, 3]} intensity={0.8} color="#00d4ff" />
          <pointLight position={[-3, -3, -3]} intensity={0.8} color="#a855f7" />

          {/* Starfield background */}
          <Stars
            radius={100}
            depth={50}
            count={3000}
            factor={4}
            saturation={0.5}
            fade
            speed={0.5}
          />

          {/* Main components */}
          <GlowSphere />
          <AnimatedSphere />
          <Particles />

          {/* Optional orbit controls for manual rotation */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>

      {/* Gradient overlay for extra polish */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50 pointer-events-none" />
    </div>
  );
};
