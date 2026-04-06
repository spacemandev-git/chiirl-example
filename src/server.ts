const PORT = parseInt(process.env.PORT || "3000");

const server = Bun.serve({
  port: PORT,
  routes: {
    "/health": {
      GET: () => new Response("ok"),
    },
  },
  fetch(req) {
    return new Response("Not found", { status: 404 });
  },
});

console.log(`Health check server running on http://localhost:${PORT}`);
