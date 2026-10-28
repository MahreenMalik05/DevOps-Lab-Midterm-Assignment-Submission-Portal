const request = require("supertest");
const app = require("../server");

describe("Assignment Submission Portal", () => {
  test("accepts and saves a complete submission with a valid URL", async () => {
    const submission = {
      name: "Ali Khan",
      registrationNumber: "FA24-BCS-001",
      assignmentTitle: "DevOps Lab Midterm",
      submissionUrl: "https://github.com/"
    };

    const response = await request(app)
      .post("/api/submissions")
      .send(submission);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe(
      "Assignment submitted successfully!"
    );

    const listResponse = await request(app)
      .get("/api/submissions");

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toContainEqual(
      expect.objectContaining({
        name: "Ali Khan",
        registrationNumber: "FA24-BCS-001",
        assignmentTitle: "DevOps Lab Midterm",
        submissionUrl: "https://github.com/"
      })
    );
  });

  test("rejects a submission with a missing registration number", async () => {
    const submission = {
      name: "Ali Khan",
      registrationNumber: "",
      assignmentTitle: "DevOps Lab Midterm",
      submissionUrl: "https://github.com/"
    };

    const response = await request(app)
      .post("/api/submissions")
      .send(submission);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "All fields are required."
    );
  });

  test("rejects an invalid URL and does not save the submission", async () => {
    const beforeResponse = await request(app)
      .get("/api/submissions");

    const submission = {
      name: "Sara Ahmed",
      registrationNumber: "FA24-BCS-002",
      assignmentTitle: "Testing Assignment",
      submissionUrl: "not-a-valid-url"
    };

    const response = await request(app)
      .post("/api/submissions")
      .send(submission);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Please enter a valid HTTP or HTTPS URL."
    );

    const afterResponse = await request(app)
      .get("/api/submissions");

    expect(afterResponse.body).toEqual(beforeResponse.body);
  });
});
