import Hallo from "../../components/Hallo";
import LoginForm from "./LoginForm";

export default function LoginPage() {
    return (
        <div className="flex h-screen">
            <div className="w-1/2 bg-gradient-to-br from-violet-600 to-indigo-900 flex items-center justify-center text-white p-8">
            </div>

            <div className="w-1/2 bg-white flex items-center justify-center p-10">
                <div className="w-full max-w-md">
                    <Hallo/>
                    <LoginForm/>
                </div>
            </div>
        </div>
    )
}