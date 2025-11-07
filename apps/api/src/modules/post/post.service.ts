import { Post } from "@prisma/client";
import { ApiError } from "../../utils/ApiError";
import HttpStatus from "http-status";
import postRepository from "./post.repository";

export const postService = {
  getAllPosts: async (): Promise<Post[]> => {
    const posts = await postRepository.findAllPost();
    return posts.map((post) => {
      return post;
    });
  },

  createPost: async (data: any): Promise<Post> => {
    if (!data.author || !data.author.id) {
      throw new ApiError(
        HttpStatus.NOT_FOUND,
        "Author da postagem não encontrado",
      );
    }

    if (!data.group || data.groupId) {
      throw new ApiError(
        HttpStatus.NOT_FOUND,
        "Grupo não encontrado, somente grupos podem fazer postagens"
      )
    }

    if (data.type === "EVENT") {
      if (!data.eventDate || !data.eventFinishDate || !data.location) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          "Data de inicio, Data de terminó e Localização do evento são obrigatórios em postagens do tipo evento",
        );
      }
    }

    const newPost: Post = await postRepository.create(data, data.author.id, data.groupId);
    return newPost;
  },

  updatePost: async (
    id: string,
    authUserId: string,
    data: any,
  ): Promise<Post> => {
    const postFound = await postRepository.findPostById(id);
    if (!postFound) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Postagem não encontrada");
    }
    console.log(">>> post author: " + postFound.authorId);
    if (postFound.authorId !== authUserId) {
      throw new ApiError(
        HttpStatus.FORBIDDEN,
        "Você não tem permissão para atualizar esta postagem",
      );
    }

    const updatedPost: Post = await postRepository.update(postFound.id, data);
    return updatedPost;
  },

  deletePost: async (id: string, authUserId: string): Promise<void> => {
    const postFound = await postRepository.findPostById(id);
    if (!postFound) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Postagem não encontrada");
    }

    if (postFound.authorId !== authUserId) {
      throw new ApiError(
        HttpStatus.FORBIDDEN,
        "Você não tem permissão para excluir esta postagem",
      );
    }

    await postRepository.deletePost(postFound.id);
  },
};
