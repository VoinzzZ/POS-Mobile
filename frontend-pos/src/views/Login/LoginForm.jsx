import Button from "../../components/Button";
import Inputpassword from "../../components/InputPassword";
import { Link } from "react-router-dom";

export default function LoginForm() {
    return (
        <form className="space-y-4" onSubmit={onsubmit}>
            <div>
                <label className="text-gray-700 text-sm">Email</label>
                <input
                 type="text"
                 name="email"
                 placeholder="Email"
                 className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
            </div>

            <div>
                <label className="text-gray-700 text-sm">Password</label>
                <Inputpassword
                name="password"
                />
            </div>

            <Button type="submit">Masuk</Button>
            <p className="text-center">
                Belum punya akun?{" "}
                <Link to="/register" className="text-indigo-800 hover:underline">
                    Daftar
                </Link>
            </p>
        </form>
    )
}