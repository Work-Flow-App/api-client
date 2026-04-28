# @work-flow-app/api-client

Generated TypeScript API client for WorkFlow App. Published to GitHub Packages.

---

## Generating a New Client

Go to **Actions → Update API Client → Run workflow**

| Input | Options | Description |
|---|---|---|
| `source` | `dev` / `prod` | Which backend to generate from |
| `bump` | `patch` / `minor` / `major` | Version bump type |

**When to use each bump:**

| Change | Bump |
|---|---|
| New endpoint or new response field added | `minor` |
| Endpoint removed / renamed / field removed | `major` |
| Bug fix, no API shape change | `patch` |

> If breaking changes are detected but bump is not `major`, the workflow will fail and tell you to re-run with `major`.

After the workflow runs:
- Generated client is committed to this repo
- `CHANGELOG.md` is updated with API diff
- A GitHub Release is created with release notes
- Package is published to GitHub Packages

---

## Installing in Frontend

### 1. Authenticate with GitHub Packages

Add `.npmrc` to your frontend project root:

```
@work-flow-app:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

> Generate a token at GitHub → Settings → Developer settings → Personal access tokens → with `read:packages` scope.

### 2. Install the package

```bash
# dev client (generated from dev backend)
npm install @work-flow-app/api-client@dev

# prod client (generated from prod backend)
npm install @work-flow-app/api-client

# pin exact version
npm install @work-flow-app/api-client@1.2.0
```

### 3. Configure client (do this once at app startup)

```typescript
import { configure } from '@work-flow-app/api-client';

configure({
  baseURL: process.env.REACT_APP_API_URL,
  getToken: () => localStorage.getItem('accessToken'),

  // optional: inject extra headers on every request
  // getHeaders: () => ({ 'X-Tenant-Id': 'abc' }),
});
```

---

## Usage in React

### React Query hooks (separate subpath — only import if using React Query)

```typescript
import { useGetJobs, useCreateJob } from '@work-flow-app/api-client/hooks';

// GET — query
const { data: jobs, isLoading, error } = useGetJobs();

// POST — mutation
const { mutate: createJob, isPending } = useCreateJob();
createJob({ templateId: 1, status: 'NEW', fieldValues: {} });
```

### Raw fetch functions (no React dependency)

```typescript
import { getJobs, createJob, getWorkers } from '@work-flow-app/api-client';

const jobs = await getJobs();
const job = await createJob({ templateId: 1, status: 'NEW', fieldValues: {} });
```

### Types

```typescript
import type {
  JobResponse,
  JobCreateRequest,
  WorkerResponse,
  ClientResponse,
} from '@work-flow-app/api-client';
```

### Error handling

All API errors are typed as `ApiError`:

```typescript
import type { ApiError } from '@work-flow-app/api-client';

try {
  await createJob(data);
} catch (err) {
  const e = err as ApiError;
  console.log(e.status);            // 400, 404, 409, 500...
  console.log(e.message);           // "Worker not found"
  console.log(e.validationErrors);  // { name: "must not be blank" } or null
}
```

With React Query:

```typescript
import type { ApiError } from '@work-flow-app/api-client';
import { useCreateJob } from '@work-flow-app/api-client/hooks';

const { mutate, error } = useCreateJob();
const apiError = error as ApiError | null;
```

### File uploads (FormData)

FormData is handled automatically — `Content-Type` is NOT forced to `application/json` so multipart boundary is preserved:

```typescript
const form = new FormData();
form.append('file', file);
form.append('type', 'ATTACHMENT');

await uploadAttachment({ stepId: 1, data: form });
```

### Client version (for debugging)

```typescript
import { CLIENT_VERSION, BUILT_FROM, BUILT_AT } from '@work-flow-app/api-client';

console.log(CLIENT_VERSION); // "1.2.0"
console.log(BUILT_FROM);     // "prod"
console.log(BUILT_AT);       // "2026-04-28T17:00:00Z"
```

---

## Upgrading Safely

1. Check [Releases](../../releases) for what changed in the new version
2. Update `package.json`:
   ```bash
   npm install @work-flow-app/api-client@1.3.0
   ```
3. For major bumps — review breaking changes in the release notes and update affected code

---

## Sources

| Tag | Backend | Use for |
|---|---|---|
| `@dev` | api.dev2.workfloow.app | Dev / staging frontend |
| `@latest` | api.workfloow.app | Production frontend |
