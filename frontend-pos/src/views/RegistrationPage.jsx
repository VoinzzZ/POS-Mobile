export default function RegistrationPage() {
    return (
        <div className='regist'>
        <div className="container">
            {/* sign up */}
            <div className="form-container sign-up-container">
                <form className='form-register'>
                    <h1 className='title-login'>Create Account</h1>
                        <input 
                         className='input-regist text-sm' 
                         type="text" 
                         placeholder="Name"
                        />
                        <input 
                         className='input-regist text-sm' 
                         type="email" 
                         placeholder="Email"
                        />
                    <div className='mb-5'>
                        <PasswordInput
                        />
                    </div>

                    <button className='button-regist' type="submit">
                        Sign Up
                    </button>
                </form>
            </div>

            {/* sign in */}
            <div className="form-container sign-in-container">
                <form className='form-register' >
                    <h1 className='title-login'>Sign in</h1>
                         <input 
                          className='input-regist text-sm' 
                          type="email" 
                          placeholder="Email"
                        />
                    <div className='mb-5'>
                        <PasswordInput
                         autocomplete="current-password"
                        />
                    </div>

                    <button className='button-regist' type="submit">Sign In</button>
                </form>
            </div>

            {/* overlay */}
            <div className="overlay-container">
                <div className="overlay">
                    <div className="overlay-panel overlay-left">
                        <h1 className='title-login'>Welcome Back!</h1>
                        <p className='dec-login mb-5 mt-2'>To keep connected with us please login with your personal info</p>
                        <button className="ghost button-regist">Sign In</button>
                    </div>
                    <div className="overlay-panel overlay-right">
                        <h1 className='title-login'>Hello, Friend!</h1>
                        <p className='dec-login mb-5 mt-2'>Enter your personal details and start journey with us</p>
                        <button className="ghost button-regist">Sign Up</button>
                    </div>
                </div>
            </div>
        </div>
        </div>
    )
}