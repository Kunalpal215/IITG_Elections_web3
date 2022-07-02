import React from 'react'
import { useNavigate } from 'react-router-dom';
import './AuthStyle.css';

export const SignUp = () => {
    let navigate = useNavigate();
    function onSubmit(){
        let username = document.getElementById("username").value;
        let useremail = document.getElementById("useremail").value;
        let password = document.getElementById("password").value;
        if(!useremail || !username || !password){
            alert("All fields are required");
            return;
        }
        fetch("/signup",{
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "username": username,
                "password": password,
                "useremail": useremail
            }),
            credentials: "include",
        }).then((resp) => resp.json()).then((jsonResp) => {
            if(jsonResp["result"]==="This email is already registered"){
                alert("This email is already registered, try loggin in.");
            }
            else if(jsonResp["result"]==="This username is already taken"){
                alert("This username is already taken, try different.");
            }
            else if(jsonResp["result"]==="An error occured while resgistering"){
                alert("An error occured while resgistering, please try again.");
            }
            else{
                alert("Successfully registered");
                navigate("/user/login");
            }
        })
    }

  return (
        <div className='card' id='credentials-container'>
        <h3 id='page-header'>User Login</h3>
        <div className="mb-3 cred-input">
            <label htmlFor="username" className="form-label"><h5>Enter username</h5></label>
            <input type="email" name="" className="form-control" id="username" />
        </div>
        <div className="mb-3 cred-input">
            <label htmlFor="useremail" className="form-label"><h5>Enter your email</h5></label>
            <input type="email" name="" className="form-control" id="useremail" />
        </div>
        <div className="mb-3 cred-input">
            <label htmlFor="password" className="form-label"><h5>Enter password</h5></label>
            <input type="password" name="" className="form-control" id="password" />
        </div>
        <div className='d-grid gap-2 col-6 mx-aut'>
        <button onClick={onSubmit} className="btn btn-primary submit-button">Sign up</button>
        </div>
    </div>
  )
}
