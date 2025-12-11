import { z } from "zod"

export const findSchema = z.object({
    params: z.object({
        id: z.uuid()
    })
})

export const createSchema = z.object({
    body: z.object({
        score: z.number().min(0).max(5),
        message: z.string().optional()
    })
})

export const updateSchema = z.object({
    params: z.object({
        id: z.uuid()
    }),
    body: z.object({
        message: z.string().optional()
    })
})

export const deleteSchema = z.object({
    params: z.object({
        id: z.uuid()
    })
})