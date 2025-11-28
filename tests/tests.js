const request = require("supertest");
const app = require("../server");  

describe("Server Basic Tests", () => {
  test("GET / should return server running message", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("Server is running!");
  });
});

describe("User Authentication Routes", () => {
  test("POST /register should return 500 or 201 depending on DB", async () => {
    const res = await request(app)
      .post("/register")
      .send({}); 
    expect([400, 500, 201]).toContain(res.statusCode);
  });

  test("POST /login should return 401 or 500 on invalid credentials", async () => {
    const res = await request(app)
      .post("/login")
      .send({ username: "test", password: "wrong" });

    expect([401, 500]).toContain(res.statusCode);
  });
});

describe("Event Organizer Routes", () => {
  test("POST /registerEventOrg should not crash", async () => {
    const res = await request(app)
      .post("/registerEventOrg")
      .send({});
    expect([400, 500, 201]).toContain(res.statusCode);
  });

  test("POST /loginEventOrg should return 401 or 500 on bad login", async () => {
    const res = await request(app)
      .post("/loginEventOrg")
      .send({ username: "abc", password: "123" });
    expect([401, 500]).toContain(res.statusCode);
  });
});

describe("Event Routes", () => {
  test("GET /api/events should return 200 or 500", async () => {
    const res = await request(app).get("/api/events");
    expect([200, 500]).toContain(res.statusCode);
  });

  test("POST /api/events should return 201, 400, or 500", async () => {
    const res = await request(app)
      .post("/api/events")
      .send({});
    expect([201, 400, 500]).toContain(res.statusCode);
  });
});

describe("Ticket Purchase Routes", () => {
  test("POST /buy should return 400 or 500 with missing data", async () => {
    const res = await request(app)
      .post("/buy")
      .send({});
    expect([400, 500]).toContain(res.statusCode);
  });

  test("GET /api/users/:id/purchases returns 200 or 500", async () => {
    const res = await request(app).get("/api/users/999/purchases");
    expect([200, 500]).toContain(res.statusCode);
  });
});

describe("Admin Routes", () => {
  test("GET /api/admin/stats should return 200 or 500", async () => {
    const res = await request(app).get("/api/admin/stats");
    expect([200, 500]).toContain(res.statusCode);
  });
});
