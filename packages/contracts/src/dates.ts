import { z } from "zod";

export const IsoDateSchema = z.string().datetime();
export type IsoDate = z.infer<typeof IsoDateSchema>;
