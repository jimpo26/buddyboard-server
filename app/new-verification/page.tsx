import { NewVerificationForm } from "@/components/new-verification-form";

const NewVerificationPage = () => {
    return (
        <div className="flex items-center justify-center h-screen w-full bg-gradient-to-r from-emerald-500 to-emerald-600">
            <div className="w-full h-full flex items-center justify-center" style={{
                position: "absolute",
                backgroundImage: "url('/noise-light.png')",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
            }} >
                <NewVerificationForm />
            </div>
        </div>
    )
}
export default NewVerificationPage;