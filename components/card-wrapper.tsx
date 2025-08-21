"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";


interface CardWrapperProps {
    children: React.ReactNode,
    headerLabel: string,
}

export const CardWrapper = ({
    children,
    headerLabel,
}: CardWrapperProps) => {
    return (
        <Card className="w-[400px] shadow-md">
            <CardHeader>
                <Header label={headerLabel} />
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    )
}

const font = Poppins({
    subsets: ["latin"],
    weight: ["600"],
})

interface HeaderProps {
    label: string;
}

export const Header = ({ label }: HeaderProps) => {
    return (
        <div className="w-full flex flex-col gap-y-4 items-center justify-center">
            <h1 className={cn("text-3xl font-semibold", font.className)}>
                🔐 Auth
            </h1>
            <p className={"text-muted-foreground text-sm"}>
                {label}
            </p>
        </div>
    )
}