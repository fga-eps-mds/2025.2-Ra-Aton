import { Request, Response, NextFunction} from "express";
import { NotificationsController } from "../../modules/notification/notification.controller";
import { NotificationsService } from "../../modules/notification/notification.service";
import { prismaMock } from "../prisma-mock";

// mock service
jest.mock("../../modules/notification/notification.service");

describe("NotificationsController", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.Mock;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("savePushToken", () => {
        it("should save push token and return 200", async () => {
            // @ts-ignore
            const notificationsController = new NotificationsController(new NotificationsService(prismaMock) as unknown as NotificationsService);

            req.user = { id: "test-user-id", userId: "test-user-id" };
            req.body = {
                token: "test-token",
            };

            await notificationsController.savePushToken(req as Request, res as Response, next as NextFunction);

            expect(res.status).toHaveBeenCalledWith(200);
        });
        it("should return 401 without userId", async () => {
            const notificationsController = new NotificationsController(
                new NotificationsService(
                // @ts-ignore
              prismaMock,
            ) as unknown as NotificationsService,
          );

          // @ts-ignore
          req.user = { id: undefined, userId: undefined };
          req.body = {
            token: "test-token",
          };

          await notificationsController.savePushToken(
            req as Request,
            res as Response,
            next as NextFunction,
          );

          expect(res.status).toHaveBeenCalledWith(401);
        });
    });

    describe("deletePushToken", () => {
        it("should delete push token and return 200", async () => {
            const notificationsController = new NotificationsController(
                new NotificationsService(
                // @ts-ignore
              prismaMock,
            ) as unknown as NotificationsService,
          );

          // @ts-ignore
          req.user = { id: "test-user-id", userId: "test-user-id" };

          await notificationsController.deletePushToken(
            req as Request,
            res as Response,
            next as NextFunction,
          );

          expect(res.status).toHaveBeenCalledWith(200);
        });

        it("should return 401 without userId", async () => {
            const notificationsController = new NotificationsController(
                new NotificationsService(
                // @ts-ignore
              prismaMock,
            ) as unknown as NotificationsService,
          );

          // @ts-ignore
          req.user = { id: undefined, userId: undefined };

          await notificationsController.deletePushToken(
            req as Request,
            res as Response,
            next as NextFunction,
          );

          expect(res.status).toHaveBeenCalledWith(401);
        });
    });
});