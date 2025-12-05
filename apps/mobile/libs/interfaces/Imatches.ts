
export type Imatches = {
    id : string,

    title: string,
    description: string,
    authorId: string,
    matchDate: string,
    matchStatus: string,
    location: string,
    sport: string,
    maxPlayers: number,
    teamNameA: string,
    teamNameB: string,
    teamAScore: number,
    teamBScore: number,
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
