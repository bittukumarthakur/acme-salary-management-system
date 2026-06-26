import { preview } from 'vite'

// Prisma Compute entrypoint. Vite's own preview server serves the built `dist/`
// output with correct MIME types, caching, and SPA history fallback — no custom
// server code to maintain.
const port = Number(process.env.PORT) || 3000

const server = await preview({
  preview: {
    port,
    host: true,
    // Allow the Prisma Compute (and any) host header; the platform serves the
    // app behind its own domain.
    allowedHosts: true,
  },
})

server.printUrls()
