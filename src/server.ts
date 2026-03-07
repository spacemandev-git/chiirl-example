import db from "./db";

const PORT = parseInt(process.env.PORT || "3000");

const server = Bun.serve({
  port: PORT,
  routes: {
    "/r/:userId/:eventId": {
      GET: async (req) => {
        const userId = parseInt(req.params.userId);
        const eventId = parseInt(req.params.eventId);

        if (isNaN(userId) || isNaN(eventId)) {
          return new Response("Not found", { status: 404 });
        }

        const rows = await db`
          SELECT url FROM events WHERE id = ${eventId} LIMIT 1
        `;

        if (rows.length === 0) {
          return new Response("Not found", { status: 404 });
        }

        // Record the click
        await db`
          INSERT INTO clicks (user_id, event_id) VALUES (${userId}, ${eventId})
        `;

        return Response.redirect(rows[0].url, 302);
      },
    },
    "/health": {
      GET: () => new Response("ok"),
    },
  },
  fetch(req) {
    return new Response("Not found", { status: 404 });
  },
});

console.log(`Click tracking server running on http://localhost:${PORT}`);
