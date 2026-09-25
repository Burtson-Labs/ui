// MIT (c) 2022 WorkOS. Local replacement for package export conditions.
// Local ambient type keeps copied source independent of @types/node.
declare const process: { env: { NODE_ENV?: string } };
export const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';
