---
name: link
description: >
  Start the local development server and return the URL. Handles port conflicts
  automatically. Use when starting a dev session, previewing changes, or when
  you need the dev server running.
disable-model-invocation: true
---

Start the local development server.

## Step 1: Find an open port

Check if the default dev port is in use. Common dev ports: 5173 (Vite), 3000 (Next/CRA), 4321 (Astro), 8080 (generic).

```bash
# Check which ports are in use by dev servers
for port in 5173 3000 4321 8080; do
  if lsof -ti:$port > /dev/null 2>&1; then
    echo "Port $port is in use"
  fi
done
```

If the project's default port is occupied:
- Check if it's THIS project's server already running (same cwd). If so, just return the URL.
- If it's a different process, kill it: `lsof -ti:<port> | xargs kill -9`

## Step 2: Start the server

Detect the project type and start the appropriate dev command:

- If `vite.config.*` exists: `npm run dev`
- If `next.config.*` exists: `npm run dev`
- If `astro.config.*` exists: `npm run dev`
- Otherwise: check `package.json` scripts for a `dev` or `start` script

Run the command in the background. Wait 2-3 seconds for the server to initialize.

## Step 3: Return the URL

Output the local URL (e.g., `http://localhost:5173`). Confirm the server is responding:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:<port>
```

If the server isn't responding after 5 seconds, check for errors in the output.
