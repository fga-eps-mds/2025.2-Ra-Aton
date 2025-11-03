import { Request, Response } from "express";
import { postService } from "./post.service";
import { ApiError } from "../../utils/ApiError";
import HttpStatus from "http-status";
import { userService } from "../user/user.service";

class PostController {
  async listPosts(req: Request, res: Response) {
    const posts = await postService.getAllPosts();
    res.status(HttpStatus.OK).json(posts);
  }

  async createPost(req: Request, res: Response) {
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
    res.status(HttpStatus.OK).json(newPost);
  }

  async updatePost(req: Request, res: Response) {
    const id = await req.params.id;
    if (!id) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "O id é necessesário para atualizar a postagem" });
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
        .json({ message: "O id é necessesário para excluir a postagem" });
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
