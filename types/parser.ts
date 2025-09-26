export type Model<T> = T & { id: string; createdAt: string; updatedAt: string };
export type CreateModel<T> = Omit<T, "id" | "createdAt" | "updatedAt">;
export type UpdateModel<T> = Partial<Omit<T, "id" | "createdAt" | "updatedAt">>;
export type ValidationModel<T> = Partial<Record<keyof T, string>>;
