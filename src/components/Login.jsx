import React from 'react'
import { useNavigate } from 'react-router-dom';
import './AuthStyle.css';

export const Login = () => {
    let navigate = useNavigate();
    function onSubmit(){
        let useremail = document.getElementById("useremail").value;
        let password = document.getElementById("password").value;
        if(!useremail || !password){
            alert("All fields are required");
            return;
        }
        fetch("/login",{
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "password": password,
                "useremail": useremail
            }),
            credentials: "include",
        }).then((resp) => resp.json()).then((jsonResp) => {
            if(jsonResp["result"]==="This email is not registered"){
                alert("This email is not registered");
            }
            else if(jsonResp["result"]==="Password is incorrect"){
                alert("Entered password is incorrect");
            }
            else{
                navigate("/");
            }
        })
    }

  return (
    <>
        <div className='card' id='credentials-container'>
        <h3 id='page-header'>User Login</h3>
        <div className="mb-3 cred-input">
            <label htmlFor="useremail" className="form-label"><h5>Enter your email</h5></label>
            <input type="email" name="" className="form-control" id="useremail" />
        </div>
        <div className="mb-3 cred-input">
            <label htmlFor="password" className="form-label"><h5>Enter password</h5></label>
            <input type="password" name="" className="form-control" id="password" />
        </div>
        <div className='d-grid gap-2 col-6 mx-aut'>
        <button onClick={onSubmit} className="btn btn-primary submit-button">Log In</button>
        </div>
    </div>
    </>
  )
}
