import { Request, Response, NextFunction } from "express";

jest.mock("@prisma/client", () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    article: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

jest.mock("passport-google-oauth20", () => {
  return {
    Strategy: jest.fn((options, verify) => {
      return {
        name: "google",
        authenticate: jest.fn(),
      };
    }),
  };
});

jest.mock("./src/middleware/authenticate", () => {
  return {
    authenticate: jest.fn((req: Request, res: Response, next: NextFunction) => {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }
      res.locals.user = 1;
      next();
    }),
  };
});

jest.mock("./src/middleware/authorize", () => {
  return {
    authorize: jest.fn((roles: string[]) => {
      return async (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token || !roles.includes(token)) {
          return res.status(403).json({ message: "Unauthorized" });
        }
        next();
      };
    }),
  };
});

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashedpassword"),
  compare: jest
    .fn()
    .mockImplementation((password1, password2) => password1 === password2),
}));
