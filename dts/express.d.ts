// ${{empty-app-hasura:/Users/diniden/Desktop/VoidRay/dev-ops/node-devops/bin/lib/template/empty-app-hasura/dts/express.d.ts}}
import type { IncomingHttpHeaders } from "http";

import type { IJsonType } from "../util/types.js";

declare global {
  export interface IJwt {
    sub: string;
    exp: number;
    user: string;
    "https://hasura.io/jwt/claims": {
      "x-hasura-allowed-roles": string[];
      "x-hasura-default-role": string;
      "x-hasura-user-id": string;
    };
  }

  namespace Express {
    export interface Request {
      session?: IJwt;
      body: IJsonType;
      headers: IncomingHttpHeaders;
    }
  }
}
