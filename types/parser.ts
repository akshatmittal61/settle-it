export type Model<T> = T & { id: string; createdAt: string; updatedAt: string };
export type UnModel<T> = Omit<T, "id" | "createdAt" | "updatedAt">;
export type Schema<T> = Record<keyof UnModel<T>, any>;
export type CreateModel<T> = UnModel<T>;
export type UpdateModel<T> = Partial<UnModel<T>>;
export type ValidationModel<T> = Partial<Record<keyof T, string>>;
