import request from "supertest";
import app from "../../../app";
import httpStatus from "http-status";
import { generateToken } from "../../../utils/generateToken";
import { reportService } from "../../../modules/report/report.service";

jest.mock("../../../modules/report/report.service");

const VALID_ID = "8b6f1ec0-8d7b-4bb1-ba47-2a52e5c6d2f4";
const VALID_USER = "2dd3a5c3-3f6c-48d8-9260-1cc403c53c30";

describe("Report Module - Integration", () => {
  it("should return 401 when no token is provided", async () => {
    const response = await request(app)
      .post(`/posts/${VALID_ID}/report/`)
      .send({
        reporterId: VALID_USER,
        reason: "conteudo ofensivo",
        type: "post",
      });

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should return 400 when body validation fails", async () => {
    const token = generateToken(VALID_USER);

    const response = await request(app)
      .post(`/posts/${VALID_ID}/report/`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(httpStatus.BAD_REQUEST);
    expect(response.body).toBeDefined();
    expect(response.body.errors || response.body.error).toBe(
      "Erro de validação",
    );
  });

  it("should create a report with valid data", async () => {
    const token = generateToken(VALID_USER);

    const mockReport = {
      id: "report-123",
      reporterId: VALID_USER,
      reason: "Reason válida e longa",
      type: "post",
    };

    (reportService.createReport as jest.Mock).mockResolvedValue(mockReport);

    const response = await request(app)
      .post(`/posts/${VALID_ID}/report/`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        reporterId: VALID_USER,
        reason: "Reason válida e longa",
        type: "post",
      });

    console.log("DEBUG BODY:", response.body);

    expect(response.status).toBe(httpStatus.CREATED);
    expect(response.body).toEqual(mockReport);
  });

  it("should return 500 when service fails", async () => {
    const token = generateToken(VALID_USER);

    (reportService.createReport as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .post(`/posts/${VALID_ID}/report/`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        reporterId: VALID_USER,
        reason: "Reason válida e longa",
        type: "post",
      });

    expect(response.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    expect(response.body.message).toBe("Error creating report");
  });
});
