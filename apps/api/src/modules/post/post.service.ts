import { postRepository } from "./post.repository";
import { Post } from "@prisma/client";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";
import da from "zod/v4/locales/da.js";

export const postService = {
  listPosts: async (limit: number, page: number, userId: string) => {
    const offset = limit && page ? (page - 1) * limit : 0;

    const { posts, totalCount } = await postRepository.findAll(
      limit,
      offset,
      userId,
    );

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: posts,
      meta: {
        page: page,
        limit: limit,
        totalCount: totalCount,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  getPostById: async (id: string): Promise<Post> => {
    const post = await postRepository.findById(id);
    if (!post) {
      throw new ApiError(httpStatus.NOT_FOUND, "Post não encontrado");
    }
    return post;
  },

  createPost: async (data: any): Promise<Post> => {
    if (!data.author || !data.author.id) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Author da postagem não encontrado",
      );
    }

    if (!data.groupId) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Grupo não encontrado, somente grupos podem fazer postagens",
      );
    }

    if (data.type === "EVENT") {
      if (!data.eventDate || !data.location) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Data de inicio, Data de termino e Localização do evento são obrigatórios em postagens do tipo evento",
        );
      }
      else if(new Date(data.eventDate) > new Date(data.eventFinishDate)) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Data de término do evento deve ser maior que a data de início",
        );
      }
      else if(new Date(data.eventDate) < new Date()) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Data de início do evento deve ser uma data futura",
        );
      }
    }

    const newPost: Post = await postRepository.create(
      data,
      data.author.id,
      data.groupId,
    );
    return newPost;
  },

  updatePost: async (
    id: string,
    authUserId: string,
    data: any,
  ): Promise<Post> => {
    const postFound = await postRepository.findById(id);
    if (!postFound) {
      throw new ApiError(httpStatus.NOT_FOUND, "Postagem não encontrada");
    }
    console.log(">>> post author: " + postFound.authorId);
    if (postFound.authorId !== authUserId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Você não tem permissão para atualizar esta postagem",
      );
    }

    const updatedPost: Post = await postRepository.update(postFound.id, data);
    return updatedPost;
  },

  deletePost: async (id: string, authUserId: string): Promise<void> => {
    const postFound = await postRepository.findById(id);
    if (!postFound) {
      throw new ApiError(httpStatus.NOT_FOUND, "Postagem não encontrada");
    }

    if (postFound.authorId !== authUserId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Você não tem permissão para excluir esta postagem",
      );
    }

    await postRepository.deletePost(postFound.id);
  },
};
