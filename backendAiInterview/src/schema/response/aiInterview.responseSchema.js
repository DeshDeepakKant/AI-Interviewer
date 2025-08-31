import {z} from "zod"

const aiInterviewWayResponseSchema = z.object({
    statusCode: z.number(),
    data: z.object({
        numberOfQuestion: z.number().min(1),
        interviewMode: z.enum(["Guided Mode", "Hard Mode"])
    })
})

export { aiInterviewWayResponseSchema }