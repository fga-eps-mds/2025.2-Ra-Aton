
export type Imatches = {
    id : string,

    title: string,
    description: string,
    authorId: string,
    matchDate: string,
    MatchStatus: string,
    location: string,
    maxPlayers: number,
    teamNameA: string,
    teamNameB: string,
    createdAt: string,
    isSubscriptionOpen: boolean,
    spots:{
        totalMax:number,
        totalFilled:number,
    },
    teamA:{
        name:string,
        max:number,
        filled:number,
        isOpen: number,
        players:{
            id:string,
            name:string,
            userName:string,
        }[]
    },
    teamB:{
        name:string,
        max:number,
        filled:number,
        isOpen: number,
        players:{
            id:string,
            name:string,
            userName:string,
        }[]
    }
};
