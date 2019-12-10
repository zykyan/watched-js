import { getServerValidators } from "@watchedcom/schema";
import fetch from "node-fetch";

import { Addon } from "./addon";

export class Context {
    action: string;
    schema: any;
    fn: (ctx: any, args: any) => Promise<any>;

    constructor(addon: Addon, action: string) {
        switch (action) {
            case "addon":
            case "directory":
            case "item":
            case "source":
            case "subtitle":
            case "resolve": {
                this.fn = async (ctx, args) => await addon[action](ctx, args);
                break;
            }

            default:
                throw new Error(`Unknown action: ${action}`);
        }

        this.action = action;
        this.schema = getServerValidators().actions[action];
        if (!this.schema)
            throw new Error(`Found no schema for action ${action}`);
    }

    async run(request: any) {
        this.schema.request(request);
        console.debug(`Calling ${this.action}: ${JSON.stringify(request)}`);
        const response = await this.fn(this, request);
        return this.schema.response(response);
    }

    async fetch(props: any) {
        return await fetch(props);
    }

    async fetchRemote(props: any) {
        return await this.fetch(props);
    }
}
