import { defineRecipe } from '@chakra-ui/react';

export const hugRecipe = defineRecipe({
  base: {
    maxW: '8xl',
    gap: {
      base: 4,
      md: 8,
      lg: 12
    },
    columns: {
      base: 4,
      md: 8,
      lg: 12
    }
  }
});
