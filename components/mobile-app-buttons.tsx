"use client"
import {
    GooglePlayButton,
    ButtonsContainer,
    AppStoreButton,
} from "@/components/lib";


export const MobileAppButton = ({ iosUrl, apkUrl }: { iosUrl: string, apkUrl: string }) => {
    return (
        <ButtonsContainer>
            <GooglePlayButton
                url={apkUrl}
                theme={"light"}
                className={"custom-style"}
                width={190}
            />

            <AppStoreButton
                url={iosUrl}
                theme={"light"}
                className={"custom-style"}
                width={190}
            />
        </ButtonsContainer>
    )
}