export interface HugConfigProps {
  layoutMax: string;
  gaps: Record<string, string>;
  columns: Record<string, number>;
}

export const HugConfig = {
  layoutMax: 'container.xl',
  gaps: {
    base: '4',
    md: '8',
    lg: '12'
  },
  columns: {
    base: 4,
    md: 8,
    lg: 12
  }
};

export function extendHugConfig(config: Partial<HugConfigProps>): {
  hug: HugConfigProps;
} {
  return { hug: { ...HugConfig, ...config } };
}
