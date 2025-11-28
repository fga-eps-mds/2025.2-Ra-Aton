import { prismaMock } from "../prisma-mock";
import { NotificationsRepository } from "../../modules/notification/notification.repository";

jest.resetModules();

// prismaStub supports both $transaction forms (array and callback)
const prismaStub = {
  usersNotifyTokens: {
    deleteMany: prismaMock.usersNotifyTokens.deleteMany,
    upsert: prismaMock.usersNotifyTokens.upsert,
    findUnique: prismaMock.usersNotifyTokens.findUnique,
    findMany: prismaMock.usersNotifyTokens.findMany,
    delete: prismaMock.usersNotifyTokens.delete,
  },
  groupMembership: {
    findMany: prismaMock.groupMembership.findMany,
  },
  // $transaction: handle both array and callback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $transaction: jest.fn().mockImplementation(async (arg: any) => {
    if (Array.isArray(arg)) {
      return Promise.all(arg);
    }
    return await arg(prismaStub);
  }),
};

const repository = new NotificationsRepository(prismaStub as any);

describe("NotificationsRepository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("upsertPushToken", () => {
    it("should remove token from other users and upsert for the current user", async () => {
      prismaMock.usersNotifyTokens.deleteMany.mockResolvedValueOnce({ count: 1 } as any);
      prismaMock.usersNotifyTokens.upsert.mockResolvedValueOnce({ userId: "U1", token: "ExpoABC" } as any);

      const res = await repository.upsertPushToken("U1", "ExpoABC");

      expect(prismaStub.$transaction).toHaveBeenCalled();

      expect(prismaMock.usersNotifyTokens.deleteMany).toHaveBeenCalledWith({
        where: { token: "ExpoABC", userId: { not: "U1" } },
      });

      expect(prismaMock.usersNotifyTokens.upsert).toHaveBeenCalledWith({
        where: { userId: "U1" },
        create: { userId: "U1", token: "ExpoABC" },
        update: { token: "ExpoABC", updatedAt: expect.any(Date) },
      });

      expect(res).toEqual({ userId: "U1", token: "ExpoABC" });
    });
  });

  describe("getUserPushToken", () => {
    it("should return user's token if exists", async () => {
      prismaMock.usersNotifyTokens.findUnique.mockResolvedValueOnce({ userId: "U1", token: "ExpoT" } as any);

      const res = await repository.getUserPushToken("U1");

      expect(prismaMock.usersNotifyTokens.findUnique).toHaveBeenCalledWith({ where: { userId: "U1" } });
      expect(res).toEqual({ userId: "U1", token: "ExpoT" });
    });
  });

  describe("getUsersPushTokens", () => {
    it("should return tokens for given userIds", async () => {
      const tokens = [{ userId: "U1", token: "T1" }, { userId: "U2", token: "T2" }];
      prismaMock.usersNotifyTokens.findMany.mockResolvedValueOnce(tokens as any);

      const res = await repository.getUsersPushTokens(["U1", "U2"]);

      expect(prismaMock.usersNotifyTokens.findMany).toHaveBeenCalledWith({
        where: { userId: { in: ["U1", "U2"] } },
        select: { userId: true, token: true },
      });
      expect(res).toEqual(tokens);
    });
  });

  describe("deletePushToken", () => {
    it("should delete token for user", async () => {
      prismaMock.usersNotifyTokens.delete.mockResolvedValueOnce({ userId: "U1" } as any);

      const res = await repository.deletePushToken("U1");

      expect(prismaMock.usersNotifyTokens.delete).toHaveBeenCalledWith({ where: { userId: "U1" } });
      expect(res).toEqual({ userId: "U1" });
    });
  });

  describe("getGroupMemberTokens", () => {
    it("should return mapped member tokens when present", async () => {
      const memberships = [
        {
          userId: "U1",
          role: "PLAYER",
          user: { notifyTokens: [{ token: "T1" }] },
        },
        {
          userId: "U2",
          role: "PLAYER",
          user: { notifyTokens: [] },
        },
      ];

      prismaMock.groupMembership.findMany.mockResolvedValueOnce(memberships as any);

      const res = await repository.getGroupMemberTokens("G1");

      expect(prismaMock.groupMembership.findMany).toHaveBeenCalledWith({
        where: { groupId: "G1" },
        include: { user: { include: { notifyTokens: true } } },
      });

      expect(res).toEqual([{ userId: "U1", token: "T1", role: "PLAYER" }]);
    });
  });
});
