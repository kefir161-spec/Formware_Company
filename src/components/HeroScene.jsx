import React, { Component, Suspense, lazy, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../lib/useReducedMotion";
import { useInView } from "../lib/useInView";
import { canCreateWebGL } from "../lib/webgl";

const loadHeroScene = () => import("../scenes/HeroSceneCanvas");
const HeroSceneCanvas = lazy(loadHeroScene);

if (typeof window !== "undefined") {
  loadHeroScene();
}

function HeroFallback() {
  return (
    <div className="hero-fallback" aria-hidden="true">
      <div className="hero-fallback-cube" />
    </div>
  );
}

class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function canUseWebGLNow() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return canCreateWebGL();
}

export default function HeroScene({ scrollProgressRef }) {
  const mountRef = useRef(null);
  const inView = useInView(mountRef, { threshold: 0.05, rootMargin: "100px" });
  const reduced = useReducedMotion();
  const [enabled] = useState(canUseWebGLNow);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    loadHeroScene();
  }, []);

  const showCanvas = enabled && !reduced && !failed;

  return (
    <div className="hero-canvas" ref={mountRef} aria-hidden="true">
      {showCanvas ? (
        <SceneErrorBoundary fallback={<HeroFallback />}>
          <Suspense fallback={<div className="hero-placeholder" aria-hidden="true" />}>
            <HeroSceneCanvas
              active={inView}
              scrollProgressRef={scrollProgressRef}
              onFail={() => setFailed(true)}
            />
          </Suspense>
        </SceneErrorBoundary>
      ) : (
        <HeroFallback />
      )}
    </div>
  );
}
