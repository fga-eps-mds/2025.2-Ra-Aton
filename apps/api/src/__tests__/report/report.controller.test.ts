import { Request, Response } from "express";
import httpStatus from "http-status";
import { reportController } from "../../modules/report/report.controller";
import { reportService } from "../../modules/report/report.service";
import { ApiError } from "../../utils/ApiError";

jest.mock("../../modules/report/report.service");

describe("ReportController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnThis();

    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe("createReport", () => {
    it("deve retornar 400 se campos obrigatórios ausentes", async () => {
      req = { params: {}, body: {} };

      await reportController.createReport(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "id, reporterId, reason e type são obrigatórios",
      });
    });

    it("deve retornar 500 se service retornar null", async () => {
      (reportService.createReport as jest.Mock).mockResolvedValue(null);

      req = {
        params: { id: "p1" },
        body: { reporterId: "u1", reason: "motivo", type: "post" },
      };

      await reportController.createReport(req as Request, res as Response);

      expect(reportService.createReport).toHaveBeenCalledWith(
        "p1",
        "u1",
        "motivo",
        "post",
      );
      expect(res.status).toHaveBeenCalledWith(httpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error creating report",
      });
    });

    it("deve criar e retornar 201 quando service retornar report", async () => {
      const created = { id: "r1", reporterId: "u1", reason: "motivo" } as any;
      (reportService.createReport as jest.Mock).mockResolvedValue(created);

      req = {
        params: { id: "p1" },
        body: { reporterId: "u1", reason: "motivo", type: "comment" },
      };

      await reportController.createReport(req as Request, res as Response);

      expect(reportService.createReport).toHaveBeenCalledWith(
        "p1",
        "u1",
        "motivo",
        "comment",
      );
      expect(res.status).toHaveBeenCalledWith(httpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith(created);
    });

    it("deve lançar ApiError quando service rejeitar", async () => {
      (reportService.createReport as jest.Mock).mockRejectedValue(
        new Error("boom"),
      );

      req = {
        params: { id: "p1" },
        body: { reporterId: "u1", reason: "motivo", type: "post" },
      };

      await expect(
        reportController.createReport(req as Request, res as Response),
      ).rejects.toBeInstanceOf(ApiError);
    });
  });
});
