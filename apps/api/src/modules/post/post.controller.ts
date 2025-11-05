import { Request, Response } from "express";
import { postService } from "./post.service";
import httpStatus from "http-status";

class PostController {
  async listPosts(req: Request, res: Response) {
    const posts = await postService.listPosts();
    res.status(httpStatus.OK).json(posts);
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
