export const allApiResourceNames = [] as const;

export type AllApiResourceName = (typeof allApiResourceNames)[number];
