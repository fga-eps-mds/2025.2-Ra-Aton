import { Request, Response } from "express";
import { postService } from "./post.service";
import httpStatus from "http-status";
import { ApiError } from "../../utils/ApiError";

class PostController {
  async listPosts(req: Request, res: Response) {
    if(!req.body.userId){
      throw new ApiError(httpStatus.BAD_REQUEST, "UserId é obrigatório no corpo da requisição");
    }

    const DEFAULT_PAGE_LIMIT = 10;
    const DEFAULT_PAGE = 1;

    const limit = parseInt(req.query.limit as string, 10);
    const page = parseInt(req.query.page as string, 10);

    const safeLimit = isNaN(limit) ? DEFAULT_PAGE_LIMIT : limit;
    const safePage = isNaN(page) ? DEFAULT_PAGE : page;

    if (safeLimit > 50) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "O limite não pode ser maior que 50",
      );
    }
    const paginatedResult = await postService.listPosts(
      safeLimit,
      safePage,
      req.body.userId,
    );
    res.status(httpStatus.OK).json(paginatedResult);
  }

  async createPost(req: Request, res: Response) {
    const postData = req.body;
    const newPost = await postService.createPost(postData);
    res.status(httpStatus.CREATED).json(newPost);
  }

  async getPostById(req: Request, res: Response) {
    const postId: string = req.params.id!;
    const post = await postService.getPostById(postId);
    res.status(httpStatus.OK).json(post);
  }

  async deletePost(req: Request, res: Response) {
    const postId: string = req.params.id!;
    await postService.deletePost(postId);
    res.status(httpStatus.NO_CONTENT).send();
  }

  async updatePost(req: Request, res: Response) {
    const postId: string = req.params.id!;
    const updateData = req.body;
    const updatedPost = await postService.updatePost(postId, updateData);
    res.status(httpStatus.OK).json(updatedPost);
  }
}

export const postController = new PostController();
