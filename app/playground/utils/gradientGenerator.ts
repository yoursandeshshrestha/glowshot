export interface GradientColors {
  colors: string[];
  angle: number;
}

export interface GradientData {
  colors: string[];
  angle: number;
}

const gradientPresets: GradientColors[] = [
  {
    colors: ["#667eea", "#764ba2", "#f093fb"],
    angle: 135,
  },
  {
    colors: ["#4facfe", "#00f2fe", "#43e97b"],
    angle: 120,
  },
  {
    colors: ["#fa709a", "#fee140", "#30cfd0"],
    angle: 160,
  },
  {
    colors: ["#a8edea", "#fed6e3", "#ffd89b"],
    angle: 90,
  },
  {
    colors: ["#ff9a56", "#ff6a88", "#f093fb"],
    angle: 145,
  },
  {
    colors: ["#5ee7df", "#b490ca", "#d9a7c7"],
    angle: 180,
  },
  {
    colors: ["#f6d365", "#fda085", "#fa709a"],
    angle: 110,
  },
  {
    colors: ["#13547a", "#80d0c7", "#a8edea"],
    angle: 135,
  },
  {
    colors: ["#667eea", "#764ba2", "#f093fb", "#4facfe"],
    angle: 125,
  },
  {
    colors: ["#fdbb2d", "#22c1c3", "#3a7bd5"],
    angle: 140,
  },
];

export function generateRandomGradient(): GradientData {
  const preset = gradientPresets[Math.floor(Math.random() * gradientPresets.length)];
  return {
    colors: preset.colors,
    angle: preset.angle,
  };
}

export function generateCustomGradient(colors: string[], angle: number = 135): GradientData {
  return {
    colors,
    angle,
  };
}

