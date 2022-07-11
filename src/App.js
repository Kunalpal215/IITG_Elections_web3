import './App.css';
import React, { useEffect } from "react";
import {ethers} from "ethers";
import contractBuild from "./utils/ElectionPortal.json";
import { HomePage } from './components/HomePage';
import { SignUp } from './components/SignUp';
import { Login } from './components/Login';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import { AuthPage } from './components/AuthPage';
import { AdminLogin } from './components/AdminLogin';
import { AdminHome } from './components/AdminHome';
import { ElectionInfo } from './components/ElectionInfo';
import { ElectionResults } from './components/ElectionResults';
import { Navbar } from './components/Navbar';
import {ErrorPage} from './components/ErrorPage';

function App() {

  async function checkLogin(){
    let tokenCheck=true;
    const url = "/login/check";
    await fetch(url,{
      method: 'POST',
      Headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }).then(resp => resp.json()).then(jsonResp => {
      if(jsonResp["result"]==="token expired" || jsonResp["result"]==="No token passed"){
        tokenCheck=false;
      }
    });
    return tokenCheck;
  }
  return (
    <BrowserRouter>
      <Navbar/>
        <Routes>
          <Route path='/' element={<HomePage/>}>
          </Route>
          <Route path='user/signup' element={<SignUp/>}>
          </Route>
          <Route path='user/login' element={<Login/>}>
          </Route>
          <Route path='auth' element={<AuthPage/>}>
          </Route>
          <Route path='admin/login' element={<AdminLogin/>}>
          </Route>
          <Route path='admin/home' element={<AdminHome/>}></Route>
          <Route path='election/info/:electionID' element={<ElectionInfo/>}></Route>
          <Route path='election/results/:electionID' element={<ElectionResults/>}></Route>
          <Route path='*' element={<ErrorPage/>}></Route>
        </Routes>
    </BrowserRouter>
  );
}

export default App;
