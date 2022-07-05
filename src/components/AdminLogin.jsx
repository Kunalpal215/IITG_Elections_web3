import React from 'react'
import { useNavigate } from 'react-router-dom';
import './AuthStyle.css';

export const AdminLogin = () => {
    let navigate = useNavigate();
    function onSubmit(){
        let useremail = document.getElementById("useremail").value;
        let secret = document.getElementById("secret").value;
        if(!useremail || !secret){
            alert("All fields are required");
            return;
        }
        fetch("/login/admin",{
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "email": useremail,
                "secret": secret
            }),
            withCredentials: true,
            credentials: 'include'
        }).then((resp) => resp.json()).then((jsonResp) => {
            console.log(jsonResp);
            if(jsonResp["result"]==="not verified"){
                alert("Not valid admin credentials");
            }
            else{
                navigate("/admin/home");
            }
        })
    }

  return (
    <div className='card' id='credentials-container'>
        <h3 id='page-header'>Admin Login (Continue with below credentials)</h3>
        <div className="mb-3 cred-input">
            <label htmlFor="useremail" className="form-label"><h5>Enter your email</h5></label>
            <input type="email" name="" className="form-control" id="useremail" value="kunalpal215@gmail.com"/>
        </div>
        <div className="mb-3 cred-input">
            <label htmlFor="secret" className="form-label"><h5>Enter secret</h5></label>
            <input type="password" name="" className="form-control" id="secret" value="IamDeveloper"/>
        </div>
        <div className='d-grid gap-2 col-6 mx-aut'>
        <button onClick={onSubmit} className="btn btn-primary submit-button">Log In</button>
        </div>
    </div>
  )
}
