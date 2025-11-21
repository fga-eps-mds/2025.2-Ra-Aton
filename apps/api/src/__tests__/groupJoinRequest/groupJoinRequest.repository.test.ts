import groupJoinRequestRepository from "../../modules/groupJoinRequest/groupJoinRequest.repository";
import { prismaMock } from "../prisma-mock";
import {
  GroupJoinRequest,
  JoinRequestStatus,
  MadeBy,
  Prisma,
} from "@prisma/client";
jest.mock("../../database/prisma.client");

describe("groupJoinRequestRepository", () => {
  describe("findAll", () => {
    it("should return all invites", async () => {
      const mockInvites: GroupJoinRequest[] = [
        {
          id: "1",
          userId: "user1",
          groupId: "group1",
          madeBy: MadeBy.USER,
          status: "PENDING",
          createdAt: new Date(),
          message: "Mensagem do convite",
          updatedAt: new Date(),
        },
        {
          id: "2",
          userId: "user2",
          groupId: "group2",
          madeBy: MadeBy.GROUP,
          status: "PENDING",
          createdAt: new Date(),
          message: "Mensagem do convite",
          updatedAt: new Date(),
        },
      ];
      prismaMock.groupJoinRequest.findMany.mockResolvedValue(mockInvites);

      const result = await groupJoinRequestRepository.findAll();

      expect(result).toEqual(mockInvites);
      expect(prismaMock.groupJoinRequest.findMany).toHaveBeenCalled();
    });
  });
  describe("findInviteById", () => {
    it("should return invite for given Id ", async () => {
      const mockInvite: GroupJoinRequest = {
        id: "1",
        userId: "user1",
        groupId: "group1",
        madeBy: MadeBy.USER,
        status: "PENDING",
        createdAt: new Date(),
        message: "Mensagem do convite",
        updatedAt: new Date(),
      };
      prismaMock.groupJoinRequest.findUnique.mockResolvedValue(mockInvite);

      const result = await groupJoinRequestRepository.findInviteById("1");

      expect(result).toEqual(mockInvite);
      expect(prismaMock.groupJoinRequest.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
        include: {
          user: {
            select: { id: true, userName: true, email: true },
          },
          group: true,
        },
      });
    });
    it("should return null if invite not found", async () => {
      prismaMock.groupJoinRequest.findUnique.mockResolvedValue(null);

      const result =
        await groupJoinRequestRepository.findInviteById("nonexistent-id");

      expect(result).toBeNull();
      expect(prismaMock.groupJoinRequest.findUnique).toHaveBeenCalledWith({
        where: { id: "nonexistent-id" },
        include: {
          user: {
            select: { id: true, userName: true, email: true },
          },
          group: true,
        },
      });
    });
  });

  describe("findInviteByUserId", () => {
    it("should return invites for given userId without madeBy filter", async () => {
      const mockInvites: GroupJoinRequest[] = [
        {
          id: "1",
          userId: "user1",
          groupId: "group1",
          madeBy: MadeBy.USER,
          status: "PENDING",
          createdAt: new Date(),
          message: "Mensagem do convite",
          updatedAt: new Date(),
        },
        {
          id: "2",
          userId: "user1",
          groupId: "group2",
          madeBy: MadeBy.GROUP,
          status: "PENDING",
          createdAt: new Date(),
          message: "Mensagem do convite",
          updatedAt: new Date(),
        },
      ];
      prismaMock.groupJoinRequest.findMany.mockResolvedValue(mockInvites);

      const result =
        await groupJoinRequestRepository.findInviteByUserId("user1");

      expect(result).toEqual(mockInvites);
      expect(prismaMock.groupJoinRequest.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user1",
        },
        include: {
          user: {
            select: { id: true, userName: true, email: true },
          },
          group: true,
        },
      });
    });

    it("should return invites for given userId with madeBy filter", async () => {
      const mockInvites: GroupJoinRequest[] = [
        {
          id: "1",
          userId: "user1",
          groupId: "group1",
          madeBy: MadeBy.USER,
          status: "PENDING",
          createdAt: new Date(),
          message: "Mensagem do convite",
          updatedAt: new Date(),
        },
      ];
      prismaMock.groupJoinRequest.findMany.mockResolvedValue(mockInvites);

      const result = await groupJoinRequestRepository.findInviteByUserId(
        "user1",
        MadeBy.USER,
      );

      expect(result).toEqual(mockInvites);
      expect(prismaMock.groupJoinRequest.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user1",
          madeBy: MadeBy.USER,
        },
        include: {
          user: {
            select: { id: true, userName: true, email: true },
          },
          group: true,
        },
      });
    });
  });

  describe("findInviteByGroupId", () => {
    it("should return invites for given groupId without madeBy filter", async () => {
      const mockInvites: GroupJoinRequest[] = [
        {
          id: "1",
          userId: "user1",
          groupId: "group1",
          madeBy: MadeBy.USER,
          status: "PENDING",
          createdAt: new Date(),
          message: "Mensagem do convite",
          updatedAt: new Date(),
        },
        {
          id: "2",
          userId: "user2",
          groupId: "group1",
          madeBy: MadeBy.GROUP,
          status: "PENDING",
          createdAt: new Date(),
          message: "Mensagem do convite",
          updatedAt: new Date(),
        },
      ];
      prismaMock.groupJoinRequest.findMany.mockResolvedValue(mockInvites);

      const result =
        await groupJoinRequestRepository.findInviteByGroupId("group1");

      expect(result).toEqual(mockInvites);
      expect(prismaMock.groupJoinRequest.findMany).toHaveBeenCalledWith({
        where: {
          groupId: "group1",
        },
        include: {
          user: {
            select: { id: true, userName: true, email: true },
          },
          group: true,
        },
      });
    });
    it("should return invites for given groupId with madeBy filter", async () => {
      const mockInvites: GroupJoinRequest[] = [
        {
          id: "1",
          userId: "user1",
          groupId: "group1",
          madeBy: MadeBy.USER,
          status: "PENDING",
          createdAt: new Date(),
          message: "Mensagem do convite",
          updatedAt: new Date(),
        },
      ];
      prismaMock.groupJoinRequest.findMany.mockResolvedValue(mockInvites);

      const result = await groupJoinRequestRepository.findInviteByGroupId(
        "group1",
        MadeBy.USER,
      );

      expect(result).toEqual(mockInvites);
      expect(prismaMock.groupJoinRequest.findMany).toHaveBeenCalledWith({
        where: {
          groupId: "group1",
          madeBy: MadeBy.USER,
        },
        include: {
          user: {
            select: { id: true, userName: true, email: true },
          },
          group: true,
        },
      });
    });
  });

  describe("findInviteByGroupIdAndUserId", () => {
    it("should return invite for given groupId and userId", async () => {
      const mockInvite: GroupJoinRequest = {
        id: "1",
        userId: "user1",
        groupId: "group1",
        madeBy: MadeBy.USER,
        status: "PENDING",
        createdAt: new Date(),
        message: "Mensagem do convite",
        updatedAt: new Date(),
      };
      prismaMock.groupJoinRequest.findUnique.mockResolvedValue(mockInvite);

      const result =
        await groupJoinRequestRepository.findInviteByUserAndGroupId(
          "user1",
          "group1",
        );

      expect(result).toEqual(mockInvite);
      expect(prismaMock.groupJoinRequest.findUnique).toHaveBeenCalledWith({
        where: {
          userId_groupId: {
            userId: "user1",
            groupId: "group1",
          },
        },
        include: {
          user: {
            select: { id: true, userName: true, email: true },
          },
          group: true,
        },
      });
    });
  });

  describe("createInvite", () => {
    it("should create and return new invite", async () => {
      const mockInviteData: Prisma.GroupJoinRequestCreateInput = {
        madeBy: "USER",
        message: "Mensagem do convite",
        user: {
          connect: { id: "user1" },
        },
        group: {
          connect: { id: "group1" },
        },
      };

      const userId = "user1";
      const groupId = "group1";
      const mockCreatedInvite: GroupJoinRequest = {
        id: "1",
        userId: userId,
        groupId: groupId,
        madeBy: MadeBy.USER,
        message: "Mensagem do convite",
        status: JoinRequestStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.groupJoinRequest.create.mockResolvedValue(mockCreatedInvite);

      const result = await groupJoinRequestRepository.createInvite(
        mockInviteData,
        userId,
        groupId,
      );

      expect(result).toEqual(mockCreatedInvite);
      expect(prismaMock.groupJoinRequest.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.groupJoinRequest.create).toHaveBeenCalledWith({
        data: {
          madeBy: "USER",
          message: "Mensagem do convite",
          user: {
            connect: { id: userId },
          },
          group: {
            connect: { id: groupId },
          },
        },
        include: {
          user: {
            select: { id: true, userName: true, email: true },
          },
          group: true,
        },
      });
    });
  });

  describe("updateInvite", () => {
    it("should update and return the invite", async () => {
      const mockUpdateData: Prisma.GroupJoinRequestUpdateInput = {
        status: JoinRequestStatus.APPROVED,
      };

      const mockUpdatedInvite: GroupJoinRequest = {
        id: "1",
        userId: "user1",
        groupId: "group1",
        madeBy: MadeBy.USER,
        message: "Mensagem do convite",
        status: JoinRequestStatus.APPROVED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.groupJoinRequest.update.mockResolvedValue(mockUpdatedInvite);

      const result = await groupJoinRequestRepository.updateInvite(
        mockUpdateData,
        "1",
      );

      expect(result).toEqual(mockUpdatedInvite);
      expect(prismaMock.groupJoinRequest.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: mockUpdateData,
      });
    });
  });

  describe("deleteInvite", () => {
    it("should delete invite for given Id", async () => {
      prismaMock.groupJoinRequest.delete.mockResolvedValue({} as any);

      await groupJoinRequestRepository.deleteInvite("1");

      expect(prismaMock.groupJoinRequest.delete).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });
  });
});
