import { prismaMock } from "../prisma-mock";
import { attendanceRepository } from "../../modules/attendance/attendance.repository";

describe("AttendanceRepository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("deve criar attendance", async () => {
      const createData = {
        data: { id: "a1", postId: "p1", userId: "u1" },
      } as any;
      const created = { id: "a1", postId: "p1", userId: "u1" };
      prismaMock.attendance.create.mockResolvedValue(created as any);

      const result = await attendanceRepository.create(createData);
      expect(result).toEqual(created);
      expect(prismaMock.attendance.create).toHaveBeenCalledWith({
        ...createData,
      });
    });
  });

  describe("findUnique", () => {
    it("deve retornar attendance quando existir", async () => {
      const mock = { id: "a1", postId: "p1", userId: "u1" };
      prismaMock.attendance.findFirst.mockResolvedValue(mock as any);

      const result = await attendanceRepository.findUnique("p1", "u1");
      expect(result).toEqual(mock);
      expect(prismaMock.attendance.findFirst).toHaveBeenCalledWith({
        where: { postId: "p1", userId: "u1" },
      });
    });

    it("deve retornar null quando não existir", async () => {
      prismaMock.attendance.findFirst.mockResolvedValue(null);
      const result = await attendanceRepository.findUnique("p1", "u1");
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("deve deletar attendance por id", async () => {
      const deleted = { id: "a1" };
      (prismaMock.attendance.delete as jest.Mock).mockResolvedValue(
        deleted as any,
      );

      await attendanceRepository.delete("a1");
      expect(prismaMock.attendance.delete).toHaveBeenCalledWith({
        where: { id: "a1" },
      });
    });
  });

  describe("updatePostAttendanceCount", () => {
    it("deve incrementar contador de attendances no post", async () => {
      (prismaMock.post.update as jest.Mock).mockResolvedValue({} as any);

      await attendanceRepository.updatePostAttendanceCount("p1", 1);
      expect(prismaMock.post.update).toHaveBeenCalledWith({
        where: { id: "p1" },
        data: { attendancesCount: { increment: 1 } },
      });
    });
  });
});
