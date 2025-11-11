// apps/mobile/src/interfaces/IPost.ts
export interface IPost {
  id: string,
  authorId:string,
    
  title:string,
  content:string,
  type?:string,
  groupId?:string,
  createdAt?:string,
  updatedAt?:string,
  eventDate?:string,
  eventFinishDate?:string,
  location?:string,
  likeCount?:number,
  commentCount?:number,
  attendancesCount?:number,
  userLiked?:boolean,
  userGoing?:boolean
}
