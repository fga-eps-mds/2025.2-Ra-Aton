import request from "supertest";
import app from "../../../app";
import httpStatus from "http-status";
import { generateToken } from "../../../utils/generateToken";
import { reportService } from "../../../modules/report/report.service";

jest.mock("../../../modules/report/report.service");

const VALID_ID = "8b6f1ec0-8d7b-4bb1-ba47-2a52e5c6d2f4";
const VALID_USER = "2dd3a5c3-3f6c-48d8-9260-1cc403c53c30";

describe("Report Module - Integration", () => {
  it("deve retornar 401 quando nenhum token for fornecido", async () => {
    const response = await request(app)
      .post(`/posts/${VALID_ID}/report/`)
      .send({
        reporterId: VALID_USER,
        reason: "conteudo ofensivo",
        type: "post",
      });

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("deve retornar 400 quando a validação do corpo falhar", async () => {
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

});
