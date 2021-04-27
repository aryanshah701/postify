import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Request, Response } from "express";

// Context object for resovlers
export type MyContext = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
  req: Request;
  res: Response;
};

// Declaration merging to add fields onto express session object
declare module "express-session" {
  export interface SessionData {
    userId: number;
  }
}
