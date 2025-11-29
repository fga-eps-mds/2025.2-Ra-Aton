import { Request, Response } from "express";
import { authService } from "./auth.service";
import httpStatus from "http-status";

export const authController = {
  login: async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(httpStatus.OK).json(result);
  },
};
