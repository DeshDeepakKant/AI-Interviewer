import {z} from "zod";


const aiInterviewWaySchema = z.object({
    position: z.string().min(2).max(100),
    experienceLevel: z.string().min(2).max(100),
    numberOfQuestionYouShouldAsk: z.number().min(1).optional(),
    sessionId: z.string().uuid(),
    interviewMode: z.enum(["Guided Mode", "Hard Mode"])
})

const aiInterviewStartSchema = z.object({
    sessionId: z.string().uuid(),
    answer: z.string(),
    interviewMode: z.enum(["Guided Mode", "Hard Mode"]).optional()
})

export {  aiInterviewWaySchema, aiInterviewStartSchema }