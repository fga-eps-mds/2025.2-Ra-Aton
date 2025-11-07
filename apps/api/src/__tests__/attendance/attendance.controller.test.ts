import { Request, Response } from "express";
import { attendanceController } from "../../modules/attendance/attendance.controller";
import httpStatus from "http-status";
import { attendanceService } from "../../modules/attendance/attendance.service";
import { ApiError } from "../../utils/ApiError";

jest.mock("../../modules/attendance/attendance.service");

describe("Attendance Controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });   
    describe("toggleAttendance", () => {
        it("should toggle attendance and return the attendance object", async () => {
            // Arrange
            const req = {
                params: { postId: "1" },
                body: { authorId: "1" },
            } as any as Request;

            const res = {
                json: jest.fn(),
                status: jest.fn().mockReturnThis(),
            } as unknown as Response;

            const mockAttendance = {
                id: "1",
                authorId: "1",
                postId: "1",
                createdAt: new Date(),
            };

            (attendanceService.toggleAttendance as jest.Mock).mockResolvedValue(mockAttendance);

            // Act
            await attendanceController.toggleAttendance(req, res);

            // Assert
            expect(attendanceService.toggleAttendance).toHaveBeenCalledWith("1", "1");
            expect(res.status).toHaveBeenCalledWith(httpStatus.CREATED);
            expect(res.json).toHaveBeenCalledWith({ id: "1", authorId: "1", postId: "1", createdAt: mockAttendance.createdAt });
        });

        it("should return 400 if postId or authorId is missing", async () => {
            // Arrange
            const req = {
                params: { postId: undefined },
                body: { authorId: undefined },
            } as any as Request;
        
            const res = {
                json: jest.fn(),
                status: jest.fn().mockReturnThis(),
            } as unknown as Response;

            // Act
            await attendanceController.toggleAttendance(req, res);

            // Assert
            expect(attendanceService.toggleAttendance).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
            expect(res.json).toHaveBeenCalledWith({
              message: "postId e authorId são obrigatórios",
            });
        });
    });
});