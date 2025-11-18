import attendanceService from "../../modules/attendance/attendance.service";
import { attendanceRepository } from "../../modules/attendance/attendance.repository";

jest.mock("../../modules/attendance/attendance.repository");

describe("AttendanceService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("toggleAttendance", () => {
    it("deve criar attendance quando não existir", async () => {
      const postId = "p1";
      const userId = "u1";
      const created = { id: "a1", postId, userId };

      const repo = jest.mocked(attendanceRepository);
      repo.findUnique.mockResolvedValue(null);
      repo.create.mockResolvedValue(created as any);
      (repo.updatePostAttendanceCount as jest.Mock).mockResolvedValue(
        undefined,
      );

      const result = await attendanceService.toggleAttendance(postId, userId);

      expect(result).toEqual(created);
      expect(repo.findUnique).toHaveBeenCalledWith(postId, userId);
      expect(repo.create).toHaveBeenCalledWith({ data: { postId, userId } });
      expect(repo.updatePostAttendanceCount).toHaveBeenCalledWith(postId, 1);
    });

    it("deve deletar attendance e decrementar contador quando existir", async () => {
      const postId = "p1";
      const userId = "u1";
      const existing = { id: "a1", postId, userId };

      const repo = jest.mocked(attendanceRepository);
      repo.findUnique.mockResolvedValue(existing as any);
      repo.delete.mockResolvedValue(existing as any);
      (repo.updatePostAttendanceCount as jest.Mock).mockResolvedValue(
        undefined,
      );

      const result = await attendanceService.toggleAttendance(postId, userId);

      expect(result).toEqual(existing);
      expect(repo.findUnique).toHaveBeenCalledWith(postId, userId);
      expect(repo.delete).toHaveBeenCalledWith(existing.id);
      expect(repo.updatePostAttendanceCount).toHaveBeenCalledWith(postId, -1);
    });
  });
});
