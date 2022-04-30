import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";

function Register(props){
    const [credentials, setCredentials] = useState({username: "", password: "", retypePassword: ""});
    function handleChange(event){
        const {name: inputName, value: inputValue} = event.target;
        setCredentials((prevCredentials) => {
            return {
                ...prevCredentials,
                [inputName]: inputValue
            }
        });
    }
    return (<div>
                <Header isLoggedIn={props.isLoggedIn} />
                <div className="my-5 container-fluid w-25">
                    <h1 className="my-5 text-center">Register</h1>
                    <p className="text-success">{props.success && "Successfully Registered"}</p>
                    <p className="d-none">{props.success && (setTimeout(props.clicked, 3000))}</p>
                    <form>
                        <div className="mb-3">
                            <label className="form-label">Username</label>
                            <input type="text" onChange={handleChange} value={credentials.username} name="username" placeholder="Username" className="form-control" />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Password</label>
                            <input type="password" onChange={handleChange} value={credentials.password} name="password" placeholder="Password" className="form-control" />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Retype Password</label>
                            <input type="password" onChange={handleChange} value={credentials.retypePassword} name="retypePassword" placeholder="Retype Password" className="form-control" />
                        </div>
                        <div className="mb-3">
                            <p>Already have an account? <button className="btn text-primary text-decoration-underline" onClick={(event)=>{
                                props.clicked();
                                event.preventDefault();
                            }}>Login Here</button></p>
                        </div>
                        <div className="mb-3">
                            <button className="btn btn-primary" onClick={(event) =>{
                                props.onSubmitForm(credentials);
                                event.preventDefault();
                            }}>Register</button>
                        </div>
                    </form>
                </div>
                <Footer />
            </div>
        )
}

export default Register;