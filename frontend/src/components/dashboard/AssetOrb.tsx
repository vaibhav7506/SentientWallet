'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { OrbHealth, OrbHealthStatus } from '@/types';
import { getOrbHealthColor, calculateHealthScore } from '@/lib/utils';

interface AnimatedOrbProps {
  health: OrbHealth;
}

function AnimatedOrb({ health }: AnimatedOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  // Rotation and pulsing animation
  useFrame((state) => {
    if (!meshRef.current || !lightRef.current) return;

    const time = state.clock.getElapsedTime();

    // Rotate the orb
    meshRef.current.rotation.x = time * 0.2;
    meshRef.current.rotation.y = time * 0.3;

    // Pulse effect based on health status
    const pulseSpeed = health.pulse_speed;
    const pulseIntensity = health.status === 'emergency' ? 0.3 : 0.1;
    const scale = 1 + Math.sin(time * pulseSpeed) * pulseIntensity;
    meshRef.current.scale.setScalar(scale);

    // Animate light intensity
    const lightIntensity = 2 + Math.sin(time * pulseSpeed) * 1;
    lightRef.current.intensity = lightIntensity;
  });

  const color = useMemo(() => new THREE.Color(health.color), [health.color]);

  return (
    <group>
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.4}
          speed={health.pulse_speed}
          roughness={0.2}
          metalness={0.8}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </Sphere>

      {/* Inner glow sphere */}
      <Sphere args={[0.8, 32, 32]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Point light for glow effect */}
      <pointLight
        ref={lightRef}
        position={[0, 0, 0]}
        color={color}
        intensity={2}
        distance={5}
      />
    </group>
  );
}

interface AssetOrbProps {
  health: OrbHealth;
  className?: string;
}

export function AssetOrb({ health, className = '' }: AssetOrbProps) {
  const getStatusLabel = (status: OrbHealthStatus): string => {
    const labels: Record<OrbHealthStatus, string> = {
      excellent: 'Excellent',
      good: 'Good',
      warning: 'Warning',
      critical: 'Critical',
      emergency: 'Emergency',
    };
    return labels[status];
  };

  const getStatusDescription = (status: OrbHealthStatus): string => {
    const descriptions: Record<OrbHealthStatus, string> = {
      excellent: 'Portfolio performing optimally',
      good: 'Portfolio healthy and stable',
      warning: 'Attention may be needed',
      critical: 'Immediate review recommended',
      emergency: 'Action required now!',
    };
    return descriptions[status];
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`relative ${className}`}
    >
      {/* 3D Canvas */}
      <div className="asset-orb-container">
        <Canvas
          camera={{ position: [0, 0, 3], fov: 50 }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={0.5} />
          <AnimatedOrb health={health} />
        </Canvas>

        {/* Outer glow ring */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-50 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${health.color}40 0%, transparent 70%)`,
            animation: health.status === 'emergency' ? 'pulse-danger 2s infinite' : 'pulse-glow 2s infinite',
          }}
        />
      </div>

      {/* Health Score Display */}
      <motion.div
        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 glass depth-2 rounded-full px-4 py-1"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: health.color }}
          />
          <span className="text-sm font-semibold text-slate-100">
            {health.score}
          </span>
        </div>
      </motion.div>

      {/* Status Label */}
      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3
          className="text-lg font-bold mb-1"
          style={{ color: health.color }}
        >
          {getStatusLabel(health.status)}
        </h3>
        <p className="text-xs text-slate-400">
          {getStatusDescription(health.status)}
        </p>
      </motion.div>

      {/* Health Factors Breakdown */}
      <motion.div
        className="mt-4 space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {Object.entries(health.factors).map(([key, value], index) => (
          <div key={key} className="flex items-center justify-between text-xs">
            <span className="text-slate-400 capitalize">
              {key.replace(/_/g, ' ')}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: health.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                />
              </div>
              <span className="text-slate-300 w-8 text-right">{value}%</span>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

// Default health state for loading/fallback
export const defaultOrbHealth: OrbHealth = {
  status: 'good',
  score: 75,
  factors: {
    portfolio_balance: 80,
    risk_level: 70,
    apy_performance: 75,
    gas_efficiency: 65,
    drawdown_level: 85,
  },
  color: '#10b981',
  pulse_speed: 1,
};
