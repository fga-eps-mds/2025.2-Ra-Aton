import { ProfileType } from "@prisma/client";
import userRepository from "../../modules/user/user.repository";
import { prismaMock } from "../prisma-mock";

describe("UserRepository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new user", async () => {
      const userData = {
        id: "1",
        userName: "testuser",
        email: "test@example",
        name: "Test User",
        profileType: ProfileType.ATLETICA,
        passwordHash: "hashedPassword",
        createdAt: new Date(),
        updatedAt: new Date(),
        notificationsAllowed: true,
        bio: null,
        profileImageUrl: null,
        bannerImageUrl: null,
        profileImageId: null,
        bannerImageId: null,
      };
      prismaMock.user.create.mockResolvedValue(userData);

      const result = await userRepository.create(userData);
      expect(result).toEqual(userData);
      expect(prismaMock.user.create).toHaveBeenCalledWith({ data: userData });
    });
  });
});
