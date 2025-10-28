import { defineConfig } from '@chakra-ui/react';
import { hugRecipe } from './hug.recipe';

export const hugConfig = defineConfig({
  theme: {
    recipes: {
      hug: hugRecipe
    }
  }
});
