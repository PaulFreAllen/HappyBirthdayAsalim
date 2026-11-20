/**
 * ===================================================================
 * ROSE GENERATOR — PROCEDURAL BOTANICAL SVG ROSES
 * ===================================================================
 * Generates biologically inspired, multi-layered sapphire roses.
 * Each flower contains:
 * - Central spiral heart petals
 * - Cup-shaped inner whorls
 * - Reflexed intermediate & outer guard petals
 * - Botanical sepals that open before petal unfolding
 * - Organic curved stems with leaf branches & thorns
 * - Multi-stop gradients for realistic petal depth and cyan glow rims
 * ===================================================================
 */

/**
 * Returns reusable SVG <defs> containing the gradients and filters
 * used across all sapphire roses in the garden.
 */
export function getRoseGradients() {
  return `
    <defs>
      <!-- Outer Guard Petals Gradient -->
      <linearGradient id="rosePetalOuterGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#06122e" />
        <stop offset="35%" stop-color="#0f2b6b" />
        <stop offset="75%" stop-color="#1d4ed8" />
        <stop offset="98%" stop-color="#38bdf8" />
        <stop offset="100%" stop-color="#00f0ff" />
      </linearGradient>

      <!-- Mid Whorl Petals Gradient -->
      <linearGradient id="rosePetalMidGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#08183d" />
        <stop offset="40%" stop-color="#1e3a8a" />
        <stop offset="80%" stop-color="#2563eb" />
        <stop offset="100%" stop-color="#60a5fa" />
      </linearGradient>

      <!-- Inner Heart Petals Gradient (Deep Velvety Navy/Sapphire) -->
      <radialGradient id="rosePetalInnerGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#02091c" />
        <stop offset="50%" stop-color="#0a1c4d" />
        <stop offset="85%" stop-color="#1d4ed8" />
        <stop offset="100%" stop-color="#38bdf8" />
      </radialGradient>

      <!-- Stem & Thorns Gradient -->
      <linearGradient id="roseStemGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#022c22" />
        <stop offset="50%" stop-color="#064e3b" />
        <stop offset="100%" stop-color="#059669" />
      </linearGradient>

      <!-- Leaf Gradient -->
      <linearGradient id="roseLeafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#022c22" />
        <stop offset="45%" stop-color="#064e3b" />
        <stop offset="90%" stop-color="#0d9488" />
        <stop offset="100%" stop-color="#2dd4bf" />
      </linearGradient>

      <!-- Petal Edge Cyan Highlight Filter -->
      <filter id="cyanRimGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#00f0ff" flood-opacity="0.35" />
      </filter>

      <!-- Background Flower Soft Atmospheric Depth Filter -->
      <filter id="gardenAtmosphereBlur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2.5" />
      </filter>
    </defs>
  `;
}

/**
 * Procedurally builds a complete SVG rose structure.
 * @param {object} options
 *   - id: Unique element ID
 *   - x: Center X coordinate in viewport viewBox
 *   - y: Base Y coordinate (ground level)
 *   - targetHeight: Height of stem in pixels
 *   - scale: Overall scale multiplier (e.g. 1.25 for foreground, 0.5 for background)
 *   - stemCurveX: Curvature offset of stem
 *   - rotation: Slight tilt of flower head
 *   - depth: 'foreground' | 'midground' | 'background'
 */
export function createRoseSVG(options) {
  const {
    id,
    x = 500,
    y = 700,
    targetHeight = 380,
    scale = 1.0,
    stemCurveX = 35,
    rotation = 0,
    depth = 'midground',
  } = options;

  const headY = y - targetHeight;
  const headX = x + stemCurveX * 0.4;
  const isBackground = depth === 'background';
  const filterAttr = isBackground ? 'filter="url(#gardenAtmosphereBlur)" opacity="0.75"' : '';

  // Stem bezier curve path
  const stemCtrlY1 = y - targetHeight * 0.35;
  const stemCtrlX1 = x + stemCurveX * 0.7;
  const stemCtrlY2 = y - targetHeight * 0.75;
  const stemCtrlX2 = x + stemCurveX * 0.3;
  const stemPath = `M ${x},${y} C ${stemCtrlX1},${stemCtrlY1} ${stemCtrlX2},${stemCtrlY2} ${headX},${headY}`;

  // Branch and Leaf 1 (Left branch at ~40% stem height)
  const leaf1Y = y - targetHeight * 0.42;
  const leaf1X = x + stemCurveX * 0.52;
  // Branch and Leaf 2 (Right branch at ~65% stem height)
  const leaf2Y = y - targetHeight * 0.68;
  const leaf2X = x + stemCurveX * 0.34;

  return `
    <g id="${id}" class="garden-rose depth-${depth}" data-depth="${depth}" transform-origin="${x} ${y}" ${filterAttr}>
      <!-- STEM & BRANCHES -->
      <g class="rose-stem-group">
        <!-- Main Stem -->
        <path 
          class="rose-stem" 
          d="${stemPath}" 
          fill="none" 
          stroke="url(#roseStemGrad)" 
          stroke-width="${4.5 * scale}" 
          stroke-linecap="round" 
        />

        <!-- Thorns along stem -->
        <path 
          class="rose-thorn" 
          d="M ${x + stemCurveX * 0.6},${y - targetHeight * 0.25} q -6,-3 -10,3 q 6,-1 10,-3" 
          fill="#064e3b" 
        />
        <path 
          class="rose-thorn" 
          d="M ${x + stemCurveX * 0.4},${y - targetHeight * 0.55} q 6,-2 10,4 q -6,-1 -10,-4" 
          fill="#064e3b" 
        />

        <!-- Leaf 1 (Left Branch) -->
        <g class="rose-leaf rose-leaf-left" transform="translate(${leaf1X}, ${leaf1Y}) scale(${scale})" transform-origin="0 0">
          <path 
            class="leaf-petiole" 
            d="M 0,0 Q -18,-12 -38,-10" 
            fill="none" 
            stroke="url(#roseStemGrad)" 
            stroke-width="2.5" 
          />
          <path 
            class="leaf-blade" 
            d="M -38,-10 C -55,-28 -80,-18 -92,-4 C -84,14 -58,16 -38,-10 Z" 
            fill="url(#roseLeafGrad)" 
            stroke="#00f0ff" 
            stroke-width="0.5" 
            stroke-opacity="0.35" 
          />
          <path 
            class="leaf-vein" 
            d="M -38,-10 Q -65,-5 -92,-4" 
            fill="none" 
            stroke="#34d399" 
            stroke-width="1.2" 
            stroke-opacity="0.6" 
          />
        </g>

        <!-- Leaf 2 (Right Branch) -->
        <g class="rose-leaf rose-leaf-right" transform="translate(${leaf2X}, ${leaf2Y}) scale(${scale})" transform-origin="0 0">
          <path 
            class="leaf-petiole" 
            d="M 0,0 Q 18,-10 36,-6" 
            fill="none" 
            stroke="url(#roseStemGrad)" 
            stroke-width="2.5" 
          />
          <path 
            class="leaf-blade" 
            d="M 36,-6 C 54,-24 82,-12 92,2 C 82,18 56,18 36,-6 Z" 
            fill="url(#roseLeafGrad)" 
            stroke="#00f0ff" 
            stroke-width="0.5" 
            stroke-opacity="0.35" 
          />
          <path 
            class="leaf-vein" 
            d="M 36,-6 Q 64,-2 92,2" 
            fill="none" 
            stroke="#34d399" 
            stroke-width="1.2" 
            stroke-opacity="0.6" 
          />
        </g>
      </g>

      <!-- FLOWER HEAD & BLOOMING PETALS -->
      <g 
        class="rose-head" 
        transform="translate(${headX}, ${headY}) scale(${scale}) rotate(${rotation})" 
        transform-origin="0 0"
      >
        <!-- Ambient Bloom Glow Halo -->
        <circle 
          class="rose-bloom-glow" 
          cx="0" 
          cy="0" 
          r="75" 
          fill="radial-gradient(circle, rgba(0, 240, 255, 0.25) 0%, transparent 70%)" 
          opacity="0" 
        />

        <!-- Sepals (Calyx surrounding the rose base) -->
        <g class="rose-sepals-group">
          <!-- Sepal 1 (Far Left) -->
          <path class="rose-sepal sepal-1" d="M 0,8 C -18,12 -38,5 -46,-12 C -38,0 -16,-2 0,0 Z" fill="url(#roseStemGrad)" />
          <!-- Sepal 2 (Left) -->
          <path class="rose-sepal sepal-2" d="M 0,8 C -12,22 -22,34 -32,46 C -20,28 -8,18 0,0 Z" fill="url(#roseStemGrad)" />
          <!-- Sepal 3 (Center Bottom) -->
          <path class="rose-sepal sepal-3" d="M -6,8 C -4,26 0,42 0,55 C 2,42 6,26 6,8 Z" fill="url(#roseStemGrad)" />
          <!-- Sepal 4 (Right) -->
          <path class="rose-sepal sepal-4" d="M 0,8 C 12,22 22,34 32,46 C 20,28 8,18 0,0 Z" fill="url(#roseStemGrad)" />
          <!-- Sepal 5 (Far Right) -->
          <path class="rose-sepal sepal-5" d="M 0,8 C 18,12 38,5 46,-12 C 38,0 16,-2 0,0 Z" fill="url(#roseStemGrad)" />
          <!-- Receptacle Calyx Base -->
          <ellipse class="rose-receptacle" cx="0" cy="8" rx="14" ry="8" fill="#064e3b" />
        </g>

        <!-- LAYER 1: OUTER REFLEXED GUARD PETALS (Unfold first in Stage C) -->
        <g class="rose-whorl whorl-outer">
          <!-- Outer Petal Bottom-Left -->
          <path 
            class="rose-petal petal-outer petal-o1" 
            d="M 0,4 C -28,2 -52,-15 -58,-42 C -40,-62 -12,-52 0,-34 C 10,-50 36,-56 50,-38 C 42,-14 24,2 0,4 Z" 
            fill="url(#rosePetalOuterGrad)" 
            stroke="#00f0ff" 
            stroke-width="0.75" 
            stroke-opacity="0.4"
            transform-origin="0 4"
          />
          <!-- Outer Petal Bottom-Right -->
          <path 
            class="rose-petal petal-outer petal-o2" 
            d="M 0,4 C 28,2 52,-15 58,-42 C 40,-62 12,-52 0,-34 C -10,-50 -36,-56 -50,-38 C -42,-14 -24,2 0,4 Z" 
            fill="url(#rosePetalOuterGrad)" 
            stroke="#00f0ff" 
            stroke-width="0.75" 
            stroke-opacity="0.4"
            transform-origin="0 4"
          />
          <!-- Outer Petal Top-Left -->
          <path 
            class="rose-petal petal-outer petal-o3" 
            d="M -4,0 C -34,-12 -58,-38 -48,-66 C -28,-78 -8,-64 0,-48 C 6,-64 26,-76 44,-64 C 52,-38 28,-12 4,0 Z" 
            fill="url(#rosePetalOuterGrad)" 
            stroke="#38bdf8" 
            stroke-width="0.75" 
            stroke-opacity="0.45"
            transform-origin="0 0"
          />
          <!-- Outer Petal Top-Right -->
          <path 
            class="rose-petal petal-outer petal-o4" 
            d="M 4,0 C 34,-12 58,-38 48,-66 C 28,-78 8,-64 0,-48 C -6,-64 -26,-76 -44,-64 C -52,-38 -28,-12 -4,0 Z" 
            fill="url(#rosePetalOuterGrad)" 
            stroke="#38bdf8" 
            stroke-width="0.75" 
            stroke-opacity="0.45"
            transform-origin="0 0"
          />
          <!-- Outer Petal Wide Flared Wing -->
          <path 
            class="rose-petal petal-outer petal-o5" 
            d="M 0,2 C -42,-8 -68,-32 -62,-60 C -40,-72 -14,-56 0,-40 C 14,-56 40,-72 62,-60 C 68,-32 42,-8 0,2 Z" 
            fill="url(#rosePetalOuterGrad)" 
            stroke="#00f0ff" 
            stroke-width="0.8" 
            stroke-opacity="0.5"
            transform-origin="0 2"
          />
        </g>

        <!-- LAYER 2: MID-WHORL INTERMEDIATE CUP PETALS -->
        <g class="rose-whorl whorl-mid">
          <!-- Mid Petal Left -->
          <path 
            class="rose-petal petal-mid petal-m1" 
            d="M -2,0 C -26,-10 -42,-28 -38,-50 C -22,-60 -6,-48 0,-34 C 4,-48 20,-58 34,-48 C 38,-26 22,-8 2,0 Z" 
            fill="url(#rosePetalMidGrad)" 
            stroke="#38bdf8" 
            stroke-width="0.75" 
            stroke-opacity="0.5"
            transform-origin="0 0"
          />
          <!-- Mid Petal Right -->
          <path 
            class="rose-petal petal-mid petal-m2" 
            d="M 2,0 C 26,-10 42,-28 38,-50 C 22,-60 6,-48 0,-34 C -4,-48 -20,-58 -34,-48 C -38,-26 -22,-8 -2,0 Z" 
            fill="url(#rosePetalMidGrad)" 
            stroke="#38bdf8" 
            stroke-width="0.75" 
            stroke-opacity="0.5"
            transform-origin="0 0"
          />
          <!-- Mid Petal Upper Crest -->
          <path 
            class="rose-petal petal-mid petal-m3" 
            d="M 0,-4 C -22,-16 -36,-38 -28,-54 C -12,-62 0,-50 0,-38 C 0,-50 12,-62 28,-54 C 36,-38 22,-16 0,-4 Z" 
            fill="url(#rosePetalMidGrad)" 
            stroke="#00f0ff" 
            stroke-width="0.75" 
            stroke-opacity="0.55"
            transform-origin="0 -4"
          />
          <!-- Mid Petal Cup Wrapper -->
          <path 
            class="rose-petal petal-mid petal-m4" 
            d="M -1,-2 C -18,-8 -30,-22 -26,-42 C -14,-50 0,-42 0,-30 C 0,-42 14,-50 26,-42 C 30,-22 18,-8 1,-2 Z" 
            fill="url(#rosePetalMidGrad)" 
            stroke="#60a5fa" 
            stroke-width="0.6" 
            stroke-opacity="0.6"
            transform-origin="0 -2"
          />
        </g>

        <!-- LAYER 3: INNER SPIRAL HEART (The Rose Core) -->
        <g class="rose-whorl whorl-inner">
          <!-- Inner Cup 1 -->
          <path 
            class="rose-petal petal-inner petal-i1" 
            d="M 0,-2 C -14,-8 -22,-20 -18,-34 C -8,-40 0,-32 0,-24 C 0,-32 8,-40 18,-34 C 22,-20 14,-8 0,-2 Z" 
            fill="url(#rosePetalInnerGrad)" 
            stroke="#38bdf8" 
            stroke-width="0.6" 
            stroke-opacity="0.6"
            transform-origin="0 -2"
          />
          <!-- Inner Cup 2 (Offset spiral) -->
          <path 
            class="rose-petal petal-inner petal-i2" 
            d="M -1,-4 C -10,-12 -16,-24 -12,-32 C -4,-36 4,-32 0,-22 C 4,-32 12,-34 16,-28 C 16,-18 8,-8 -1,-4 Z" 
            fill="url(#rosePetalInnerGrad)" 
            stroke="#00f0ff" 
            stroke-width="0.5" 
            stroke-opacity="0.7"
            transform-origin="0 -4"
          />
          <!-- Tight Rose Spiral Center Core -->
          <path 
            class="rose-petal petal-inner petal-core" 
            d="M 0,-14 C -6,-18 -8,-25 -4,-28 C 0,-30 6,-28 4,-22 C 2,-18 -1,-16 0,-14 Z" 
            fill="#06122e" 
            stroke="#00f0ff" 
            stroke-width="0.75" 
            stroke-opacity="0.8"
            transform-origin="0 -14"
          />
        </g>
      </g>
    </g>
  `;
}
