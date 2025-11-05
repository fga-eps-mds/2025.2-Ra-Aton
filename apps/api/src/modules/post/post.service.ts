import { postRepository } from "./post.repository";
import { Prisma, Post } from "@prisma/client";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";

export const postService = {
  listPosts: async (): Promise<Post[]> => {
    return await postRepository.findAll();
  },

  createPost: async (data: Prisma.PostCreateInput): Promise<Post> => {
    return await postRepository.create(data);
  },

  getPostById: async (id: string): Promise<Post> => {
    const post = await postRepository.findById(id);
    if (!post) {
      throw new ApiError(httpStatus.NOT_FOUND, "Post não encontrado");
    }
    return post;
  },

  deletePost: async (id: string): Promise<void> => {
    const post = await postRepository.findById(id);
    if (!post) {
      throw new ApiError(httpStatus.NOT_FOUND, "Post não encontrado");
    }
    await postRepository.delete(id);
  },

  updatePost: async (
    id: string,
    data: Prisma.PostUpdateInput,
  ): Promise<Post> => {
    const post = await postRepository.findById(id);
    if (!post) {
      throw new ApiError(httpStatus.NOT_FOUND, "Post não encontrado");
    }
    return await postRepository.update(id, data);
  },
};
