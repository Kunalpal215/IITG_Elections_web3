import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "flatpickr/dist/themes/material_blue.css";
import './AdminHome.css';
import { ProgressIndicator } from './ProgressIndicator';

export const AdminHome = () => {
  let navigate = useNavigate();
  let [tokenCheck, setTokenCheck] = useState(false);
  let [saving, setSaving] = useState(false);
  let [position, setPosition] = useState("");
  let [candidatesList, setCandidatesList] = useState([{ name: "", idx: 1, agendas: "", punchline: "", imageFile: [], imageLink: "" }]);
  useEffect(() => {
    checkAdminLogin();
  }, []);
  console.log(process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
  async function checkAdminLogin() {
    let resp = await fetch("/login/admin/check", {
      method: "GET",
      credentials: "include"
    });
    let jsonResp = await resp.json();
    if (jsonResp["result"] === "token expired" | jsonResp["result"] === "No token passed") {
      alert("login to continue");
      navigate("/admin/login");
    }
    else {
      setTokenCheck(true);
    }
  }

  let candidateInfoForm = (idx) => {
    console.log(candidatesList[idx].name);
    console.log(idx);

    function shiftUp(shiftIdx) {
      console.log("here");
      if (shiftIdx > 0) {
        let tmp = candidatesList[shiftIdx]["imageFile"];
        candidatesList[shiftIdx]["imageFile"] = candidatesList[shiftIdx - 1]["imageFile"];
        candidatesList[shiftIdx - 1]["imageFile"] = tmp;
        setCandidatesList([...candidatesList.slice(0, shiftIdx - 1), candidatesList[shiftIdx], candidatesList[shiftIdx - 1], ...candidatesList.slice(shiftIdx + 1)]);
      }
    }

    function shiftDown(shiftIdx) {
      console.log("here");
      if (shiftIdx < candidatesList.length - 1) {
        let tmp = candidatesList[shiftIdx]["imageFile"];
        candidatesList[shiftIdx]["imageFile"] = candidatesList[shiftIdx + 1]["imageFile"];
        candidatesList[shiftIdx + 1]["imageFile"] = tmp;
        setCandidatesList([...candidatesList.slice(0, shiftIdx), candidatesList[shiftIdx + 1], candidatesList[shiftIdx], ...candidatesList.slice(shiftIdx + 2)]);
      }
    }

    function onChangeTextHandler(e, param) {
      setCandidatesList((currList) => {
        currList[idx][param] = e.target.value;
        return [...currList];
      });
    }

    function onChangeFileHandler(e, param) {
      setCandidatesList((currList) => {
        currList[idx][param] = [e.target.files[0]];
        return [...currList];
      });
    }

    return (
      <div className='card candidates-tile'>
        <div className='row'>
        <button onClick={() => shiftUp(idx)} className='btn btn-primary card-title col-md-2'>Shift up</button>
        <div style={{width: 20}}></div>
        <button onClick={() => shiftDown(idx)} className='btn btn-primary card-title col-md-2'>Shift down</button>
        </div>
        <div className='mb-3 card candidate-tile-input'>
          <label htmlFor="candidatename" className='form-label'><h5>Candidate name</h5></label>
          <input type="text" name="" className='form-control' id="candidateName" maxLength={20} onChange={(e) => { onChangeTextHandler(e, "name") }} value={candidatesList[idx].name} />
          <label htmlFor="candidateagenda" className='form-label' ><h5>Enter agendas</h5></label>
          <input type="text" name="" className='form-control' id="candidateagenda" maxLength={100} onChange={(e) => { onChangeTextHandler(e, "agendas") }} value={candidatesList[idx].agendas} />
          <label htmlFor="candidatepunchline" className='form-label'><h5>Enter punchline</h5></label>
          <input type="text" name="" className='form-control' id="candidatepunchline" maxLength={25} onChange={(e) => { onChangeTextHandler(e, "punchline") }} value={candidatesList[idx].punchline} />
          <label htmlFor="candidateimage" className='form-label'><h5>Choose Image</h5></label>
          <input type="file" accept='image/*' className='form-control' name="" id="candidateimage" onChange={(e) => { onChangeFileHandler(e, "imageFile") }} />
        </div>
      </div>
    )
  }

  function addCandidateForm() {
    if (candidatesList.length === 10) {
      alert("Max. candidates can be 10");
      return;
    }
    setCandidatesList([...candidatesList, { name: "", idx: candidatesList.length, agendas: "", punchline: "", imageFile: [], imageLink: "" }]);
  }
  console.log("list :", candidatesList);
  if (candidatesList.length > 1) {
    console.log(candidatesList[0].imageFile, candidatesList[1].imageFile);
  }

  function checkIfValidCandidatesList() {
    let result = true;
    for (let i = 0; i < candidatesList.length; i++) {
      if (candidatesList[i]["name"] === "" || candidatesList[i]["agendas"] === "" || candidatesList[i]["punchline"] === "" || candidatesList[i]["imageFile"].length === 0) {
        result = false;
        break;
      }
    }
    return result;
  }

  async function addElection() {
    if (position == "") {
      alert("Enter election position");
      return;
    }
    if (candidatesList.length == 0) {
      alert("Add atleast one candidate for auction");
      return;
    }
    let valid = checkIfValidCandidatesList();
    if (valid === false) {
      alert("Some fields are empty");
      return;
    }
    setSaving(true);
    for (let i = 0; i < candidatesList.length; i++) {
      let data = new FormData();
      console.log(process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
      data.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
      data.append('file', candidatesList[i]["imageFile"][0]);
      await fetch("https://api.Cloudinary.com/v1_1/kunalpal215/image/upload", {
        method: 'POST',
        body: data
      }).then((resp) => resp.json()).then((jsonResp) => { candidatesList[i]["imageLink"] = jsonResp["secure_url"]; });
    }
    for (let i = 0; i < candidatesList.length; i++) {
      let resp = await fetch("/election/candidate", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "name": candidatesList[i]["name"],
          "agendas": candidatesList[i]["agendas"],
          "imageLink": candidatesList[i]["imageLink"],
          "punchline": candidatesList[i]["punchline"],
        })
      });
      let jsonResp = await resp.json();
      console.log(jsonResp);
    }
    fetch("/election", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        "position": position
      })
    }).then((resp) => resp.json()).then((jsonResp) => {
      if (jsonResp["result"] === true) {
        setSaving(false);
        setCandidatesList([{ name: "", idx: 1, agendas: "", punchline: "", imageFile: [], imageLink: "" }]);
        position = "";
        alert("Election added");
      }
      else {
        alert("error occured while saving");
      }
    })
  }

  return (
    <>
      {tokenCheck === false ? <ProgressIndicator content="Loading..."/> :
        (
          saving === true ? <ProgressIndicator content="Saving..."/> :
          <div className="card" id='form-container'>
          <h2 className="card-header">Add Election</h2>
          <div className="card-body">
            <div className="row">
            <h4 className="card-title col-md-8">Election Form</h4>
            <button onClick={addCandidateForm} className='btn btn-primary d-grid gap-2 col-4  mx-auto'>Add Candidate</button>
            </div>
            <div className='mb-3 card' id='position-name'>
              <label htmlFor="position" className='form-label'><h5>Enter the position</h5></label>
              <input type="text" name="" className='form-control' id="position" placeholder='General Secretary ...' maxLength={30} onChange={(e) => setPosition(e.target.value)} />
            </div>
            {candidatesList.map((element, index) => {
              return <div key={index.toString()}>{candidateInfoForm(index)}</div>
            })}
            <div className='d-grid gap-2 col-6 mx-aut'>
            <button id='addElectionButton' className='btn btn-success btn-lg' onClick={addElection}>Add Election</button>
            </div>
          </div>
        </div>
        )
      }
    </>
  )
}
