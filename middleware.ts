import NextAuth from "next-auth";
import edgeAuthConfig from "./auth.config.edge";
import {
    DEFAULT_LOGIN_REDIRECT,
    authRoutes,
    apiAuthPrefix,
    publicRoutes,
} from "@/routes";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const { auth } = NextAuth(edgeAuthConfig);

function setAuthorizationHeader(headers: Headers) {
    if (headers.has("Authorization")) {
        const existingHeaderCookie = headers.get("cookie")
        const newCookieString = "authjs.session-token=" + headers.get("Authorization")!.replace("Bearer ", "") + ";"
        headers.set("cookie", existingHeaderCookie !== null && !(existingHeaderCookie.trim().endsWith(";")) ? existingHeaderCookie + ";" + newCookieString : newCookieString)
        headers.set("x-diocan", "true")
    }
    return headers
}

export default auth(async (req) => {
    const newHeaders = setAuthorizationHeader(req.headers)
    return NextResponse.next({
        request: {
            headers: new Headers(newHeaders)
        }
    });
    const { nextUrl } = req;
    const session = req.auth;
    console.log(session, req.headers.get("Authorization"))
    const isLoggedIn = !!session;
    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);


    if (isApiAuthRoute) return null;

    if (isAuthRoute) {
        if (isLoggedIn) {
            return null;
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
        }
        return null;
    }

    if (!isLoggedIn && !isPublicRoute) {
        return Response.redirect(new URL("/auth/login", nextUrl));
    }

});

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
