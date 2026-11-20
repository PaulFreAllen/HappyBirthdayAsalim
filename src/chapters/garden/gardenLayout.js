/**
 * ===================================================================
 * GARDEN LAYOUT — COMPOSITION & DEPTH PERSPECTIVE SPECIFICATION
 * ===================================================================
 * Configures the positions, scales, heights, rotations, and bloom delays
 * for the 7 roses comprising the sapphire garden.
 * Creates an organic landscape with foreground, midground, and background
 * depth layers.
 * ===================================================================
 */

export function getGardenComposition(viewWidth = 1200, viewHeight = 800) {
  const isMobile = viewWidth < 768;

  // ViewBox coordinates: 0 0 1200 800
  if (isMobile) {
    return [
      // 1. Hero Rose (Center Foreground, grandest bloom)
      {
        id: 'rose-hero',
        depth: 'foreground',
        x: 600,
        y: 780,
        targetHeight: 390,
        scale: 1.25,
        stemCurveX: 25,
        rotation: 3,
        bloomDelay: 0.0,
      },
      // 2. Foreground Left
      {
        id: 'rose-fg-left',
        depth: 'foreground',
        x: 320,
        y: 790,
        targetHeight: 330,
        scale: 1.05,
        stemCurveX: -30,
        rotation: -7,
        bloomDelay: 0.08,
      },
      // 3. Midground Right
      {
        id: 'rose-mg-right',
        depth: 'midground',
        x: 880,
        y: 770,
        targetHeight: 310,
        scale: 0.9,
        stemCurveX: 35,
        rotation: 8,
        bloomDelay: 0.16,
      },
      // 4. Background Left
      {
        id: 'rose-bg-left',
        depth: 'background',
        x: 180,
        y: 740,
        targetHeight: 230,
        scale: 0.65,
        stemCurveX: -20,
        rotation: -12,
        bloomDelay: 0.24,
      },
      // 5. Background Right
      {
        id: 'rose-bg-right',
        depth: 'background',
        x: 1020,
        y: 740,
        targetHeight: 240,
        scale: 0.68,
        stemCurveX: 25,
        rotation: 10,
        bloomDelay: 0.28,
      },
    ];
  }

  // Desktop / Tablet Landscape: Full 7-Rose Panoramic Depth
  return [
    // 1. Hero Rose (Right-of-center Foreground, majestic scale)
    {
      id: 'rose-hero',
      depth: 'foreground',
      x: 680,
      y: 790,
      targetHeight: 410,
      scale: 1.3,
      stemCurveX: 30,
      rotation: 4,
      bloomDelay: 0.0,
    },
    // 2. Foreground Left Companion
    {
      id: 'rose-fg-left',
      depth: 'foreground',
      x: 380,
      y: 800,
      targetHeight: 370,
      scale: 1.12,
      stemCurveX: -35,
      rotation: -6,
      bloomDelay: 0.06,
    },
    // 3. Midground Right
    {
      id: 'rose-mg-right',
      depth: 'midground',
      x: 930,
      y: 780,
      targetHeight: 330,
      scale: 0.88,
      stemCurveX: 40,
      rotation: 10,
      bloomDelay: 0.14,
    },
    // 4. Midground Left
    {
      id: 'rose-mg-left',
      depth: 'midground',
      x: 210,
      y: 770,
      targetHeight: 320,
      scale: 0.82,
      stemCurveX: -28,
      rotation: -9,
      bloomDelay: 0.18,
    },
    // 5. Background Deep Center
    {
      id: 'rose-bg-center',
      depth: 'background',
      x: 520,
      y: 740,
      targetHeight: 240,
      scale: 0.58,
      stemCurveX: -15,
      rotation: -2,
      bloomDelay: 0.24,
    },
    // 6. Background Far Left
    {
      id: 'rose-bg-left',
      depth: 'background',
      x: 80,
      y: 730,
      targetHeight: 210,
      scale: 0.48,
      stemCurveX: -22,
      rotation: -14,
      bloomDelay: 0.3,
    },
    // 7. Background Far Right
    {
      id: 'rose-bg-right',
      depth: 'background',
      x: 1110,
      y: 735,
      targetHeight: 220,
      scale: 0.52,
      stemCurveX: 20,
      rotation: 12,
      bloomDelay: 0.32,
    },
  ];
}
