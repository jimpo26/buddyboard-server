"use client";

import { HashLoader } from "react-spinners";
import { useSearchParams } from "next/navigation";

import { CardWrapper } from "@/components/card-wrapper";
import { useCallback, useEffect, useState } from "react";
import { newVerification } from "@/actions/new-verification";
import { FormSuccess } from "@/components/form-success";
import { FormError } from "@/components/form-error";

export const NewVerificationForm = () => {
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const onSubmit = useCallback(() => {
        if (success || error) return

        if (!token) {
            setError("Missing token!");
            return
        }

        newVerification(token)
            .then((data) => {
                setSuccess(data.success);
                setError(data.error);
            })
            .catch(() => {
                setError("Something went wrong");
            })
    }, [token, success, error])

    useEffect(() => {
        onSubmit();
    }, [onSubmit])
    return (
        <CardWrapper
            headerLabel="Confirm your verification"
        >
            <div className="flex items-center justify-center w-full flex-col gap-5">
                {!success && !error &&
                    <HashLoader color="#be3455" />
                }
                <FormSuccess message={success} />
                {!success &&
                    <FormError message={error} />
                }
            </div>
        </CardWrapper>
    )
}