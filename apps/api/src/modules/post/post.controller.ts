import { Request, Response } from "express";
import { postService } from "./post.service";
import { ApiError } from "../../utils/ApiError";
import HttpStatus from "http-status";
import { userService } from "../user/user.service";

class PostController {
  async listPosts(req: Request, res: Response) {
    const userId = req.body?.userId ? req.body.userId : (req as any).user?.id;
    if (!userId) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        "UserId é obrigatório no corpo da requisição",
      );
    }

    const DEFAULT_PAGE_LIMIT = 10;
    const DEFAULT_PAGE = 1;

    const limit = parseInt(req.query.limit as string, 10);
    const page = parseInt(req.query.page as string, 10);

    const safeLimit = isNaN(limit) ? DEFAULT_PAGE_LIMIT : limit;
    const safePage = isNaN(page) ? DEFAULT_PAGE : page;

    if (safeLimit > 50) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        "O limite não pode ser maior que 50",
      );
    }
    const paginatedResult = await postService.listPosts(
      safeLimit,
      safePage,
      userId,
    );
    res.status(HttpStatus.OK).json(paginatedResult);
  }

  async getPostById(req: Request, res: Response) {
    const id = await req.params.id;
    if (!id) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "O id é necessário para buscar a postagem" });
    }
    const post = await postService.getPostById(id);
    res.status(HttpStatus.OK).json(post);
  }

  async createPost(req: Request, res: Response) {
    console.log(">>> BODY RECEBIDO:", req.body);
    console.log(">>> eventDate recebido:", req.body.eventDate);
    console.log(">>> eventFinishDate recebido:", req.body.eventFinishDate);
    const authUserId = (req as any).user;
    const author = await userService.getUserById(authUserId.id);
    if (!author) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: "Autor da postagem não encontrado" });
    }

    const data = {
      ...req.body,
      author: author,
    };

    const newPost = await postService.createPost(data);
    res.status(HttpStatus.CREATED).json(newPost);
  }

  async updatePost(req: Request, res: Response) {
    const id = await req.params.id;
    if (!id) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "O id é necessário para atualizar a postagem" });
    }

    const authUserId = (req as any).user;

    try {
      const post = await postService.updatePost(id, authUserId.id, req.body);
      return res.status(HttpStatus.OK).json(post);
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Erro ao atualizar a postagem" });
    }
  }

  async deletePost(req: Request, res: Response) {
    const id = await req.params.id;
    if (!id) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "O id é necessário para excluir a postagem" });
    }

    const authUserId = (req as any).user;

    try {
      await postService.deletePost(id, authUserId.id);
      return res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Erro ao excluir a postagem" });
    }
  }
}

export default new PostController();
