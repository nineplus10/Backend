import { Message, Response, OnErrorFx } from "_lib/Websocket";

export type WsServeFx = (
    msg: Message, 
    res: Response,
    onError: OnErrorFx
) => void

export interface WsRouter {
    serve: WsServeFx
}

/**
 * Matches payload destination to routers using longest matching substring 
 * strategy. Wildcards aren't supported.
 * 
 * @returns [router, matchingRouteLength]
 */ 
export function findRouting(
    destination: string,
    routes: [string, WsServeFx][]
): [WsServeFx | undefined, number] {
    const match: [WsServeFx | undefined, number] = [undefined, -1]
    routes.forEach(r => {
        const [route, serveFx] = r
        const isBetterCandidate = destination.startsWith(route)
                                && route.length > match[1]
        if(isBetterCandidate) {
            match[0] = serveFx
            match[1] = route.length
        }
    })

    match[1]++ // Plus delimiter
    return match
}