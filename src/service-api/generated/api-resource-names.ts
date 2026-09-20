export const allApiResourceNames = ["auth","profile","users"] as const;

export type AllApiResourceName = (typeof allApiResourceNames)[number];
