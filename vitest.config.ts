import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
      include: ['**/*.test.ts'], // Incluye solo archivos de prueba
      globals: true, // Habilita la API global de Vitest
      environment: 'node', // Usa el entorno Node.js
      typecheck: {
        tsconfig: 'tsconfig.json', // Asegura que Vitest utilice el tsconfig específico
      },
    },
  });