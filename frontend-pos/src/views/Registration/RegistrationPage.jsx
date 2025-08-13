import Hallo from './../../components/Hallo';
import RegistForm from './RegistForm';

export default function RegistrationPage() {
    return (
        <div className="flex h-screen">
            <div className="w-1/2 bg-gradient-to-br from-violet-600 to-indigo-900 flex items-center justify-center text-white p-8">
            </div>

            <div className="w-1/2 bg-white flex items-center justify-center p-10">
                <Hallo/>
                <RegistForm/>
            </div>
        </div>
    )
}