import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { join, extname, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

// This file is copied into the build output (`dist/`) and used as the Prisma
// Compute entrypoint. It serves the static SPA with a history-API fallback to
// index.html. Zero runtime dependencies (Node built-ins only) so it deploys as
// a self-contained pre-built artifact.

const root = fileURLToPath(new URL('.', import.meta.url))
const port = Number(process.env.PORT) || 3000

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
}

async function sendFile(res, filePath) {
  const body = await readFile(filePath)
  const type = MIME[extname(filePath).toLowerCase()] || 'application/octet-stream'
  res.writeHead(200, { 'Content-Type': type })
  res.end(body)
}

const server = createServer(async (req, res) => {
  try {
    // Strip query string and decode, then prevent path traversal.
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
    const safePath = normalize(urlPath).replace(/^(\.\.[/\\])+/, '')
    const relative = safePath === '/' ? 'index.html' : safePath.replace(/^\//, '')
    const filePath = join(root, relative)

    if (!filePath.startsWith(root)) {
      res.writeHead(403)
      res.end('Forbidden')
      return
    }

    try {
      await sendFile(res, filePath)
    } catch {
      // SPA fallback: serve index.html for client-side routes.
      await sendFile(res, join(root, 'index.html'))
    }
  } catch {
    res.writeHead(500)
    res.end('Internal Server Error')
  }
})

server.listen(port, () => {
  console.log(`Frontend static server listening on port ${port}`)
})
