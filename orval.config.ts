import { defineConfig } from 'orval';

const SPEC_URLS: Record<string, string> = {
  main: 'https://api.workfloow.app/api-docs',
  develop: 'https://api.dev2.workfloow.app/api-docs',
};

const branch = process.env.BRANCH || 'develop';
const specUrl = process.env.API_SPEC_URL || SPEC_URLS[branch] || SPEC_URLS.develop;

export default defineConfig({
  // Raw fetch functions + types
  workflowApi: {
    input: {
      target: specUrl,
    },
    output: {
      mode: 'single',
      target: './src/endpoints.ts',
      schemas: './src/model',
      client: 'fetch',
      clean: true,
      override: {
        mutator: {
          path: './fetch-instance.ts',
          name: 'fetchInstance',
        },
      },
    },
  },
  // React Query hooks
  workflowApiHooks: {
    input: {
      target: specUrl,
    },
    output: {
      mode: 'single',
      target: './src/hooks.ts',
      schemas: './src/model',
      client: 'react-query',
      clean: false,
      override: {
        mutator: {
          path: './fetch-instance.ts',
          name: 'fetchInstance',
        },
        query: {
          useQuery: true,
          useMutation: true,
        },
      },
    },
  },
});
