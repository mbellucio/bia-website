import { z } from "zod";

export const messageSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  content: z.string().min(5, "Message must be at least 5 characters"),
});

export type MessageFormData = z.infer<typeof messageSchema>;

export type Message = {
  id: number;
  name: string;
  content: string;
  createdAt: Date;
};
