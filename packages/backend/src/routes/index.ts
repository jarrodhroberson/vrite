import { usersRouter } from "./users";
import { contentPiecesRouter } from "./content-pieces";
import { utilsRouter, PreviewData, HostConfig } from "./utils";
import { tagsRouter } from "./tags";
import { tokensRouter } from "./tokens";
import { userSettingsRouter } from "./user-settings";
import { webhooksRouter } from "./webhooks";
import { workspacesRouter } from "./workspaces";
import { rolesRouter } from "./roles";
import { workspaceMembershipsRouter } from "./workspace-memberships";
import { workspaceSettingsRouter } from "./workspace-settings";
import { verificationRouter } from "./verification";
import { authRouter } from "./auth";
import { contentGroupsRouter } from "./content-groups";
import { extensionsRouter } from "./extensions";
import { commentsRouter } from "./comments";
import { variantsRouter } from "./variants";
import { gitRouter } from "./git";
import { searchRouter } from "./search";
import { transformersRouter } from "./transformers";
import type { TRPCClientError } from "@trpc/client";
import { Context, createContext } from "#lib";
import { router } from "#lib";

const appRouter = router({
  auth: authRouter,
  users: usersRouter,
  utils: utilsRouter,
  contentGroups: contentGroupsRouter,
  contentPieces: contentPiecesRouter,
  tags: tagsRouter,
  userSettings: userSettingsRouter,
  tokens: tokensRouter,
  webhooks: webhooksRouter,
  workspaces: workspacesRouter,
  roles: rolesRouter,
  workspaceMemberships: workspaceMembershipsRouter,
  workspaceSettings: workspaceSettingsRouter,
  verification: verificationRouter,
  extensions: extensionsRouter,
  comments: commentsRouter,
  variants: variantsRouter,
  git: gitRouter,
  search: searchRouter,
  transformers: transformersRouter
});

type Router = typeof appRouter;
type ClientError = TRPCClientError<Router> & {
  data: TRPCClientError<Router>["data"] & { cause?: { code: string } & Record<string, string> };
};

export { appRouter, createContext };
export type * from "#database";
export type { ClientError, Router, PreviewData, HostConfig, Context };
