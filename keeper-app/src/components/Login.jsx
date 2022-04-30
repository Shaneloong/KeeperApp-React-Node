import React, {useState} from "react";

function Login (props){
    const [credentials, setCredentials] = useState({username: "", password: ""});
    function handleChange(event){
        const {name: inputName, value: inputValue} = event.target;
        setCredentials((prevCredentials) => {
            return {
                ...prevCredentials,
                [inputName]: inputValue
            }
        });
    }
    return <div className="container-fluid my-5 w-25">
        <h1 className="my-5 text-center">Login</h1>
        {!props.isLoggedIn && <p className="text-danger">Invalid Credentials</p>}
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
                <p>Dont have an account? <button className="btn text-decoration-underline text-primary" onClick={props.clicked}>Register Here</button></p>
            </div>
            <div className="mb-3">
                <button className="btn btn-primary" onClick={(event) =>{
                    props.onSubmitForm(credentials);
                    event.preventDefault();
                }}>Login</button>
            </div>
        </form>
    </div>
}

export default Login;