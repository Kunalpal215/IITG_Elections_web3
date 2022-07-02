import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ProgressIndicator } from './ProgressIndicator';
import './ElectionInfo.css'

export const ElectionInfo = () => {
  let { electionID } = useParams();
  let [electionInfo, setElectionInfo] = useState({});
  let [candidatesList, setCandidatesList] = useState([]);
  let [selectedCandidate, setSelectedCandidate] = useState(-1);
  let [voted, setVoted] = useState(false);
  let [electionEnded, setEnded] = useState(false);
  let [saving, setSaving] = useState(false);
  let navigate = useNavigate();
  useEffect(() => {
    console.log("I am here");
    console.log(electionInfo);
    fetch("/election/" + electionID, {
      method: "GET",
      credentials: "include"
    }).then((resp) => resp.json()).then((jsonResp) => {
      console.log("here");
      console.log(jsonResp["position"]);
      if (jsonResp["position"] !== undefined) {
        console.log(jsonResp);
        console.log(parseInt(jsonResp["endtime"]), Date.now());
        if (Date.now() >= parseInt(jsonResp["endtime"])) {
          console.log("election ended");
          setEnded(true);
        }
        setElectionInfo(jsonResp);
        checkIfVoted(parseInt(jsonResp["totalCandidates"]));
      }
      else {
        alert("Login to continue");
        navigate("/auth");
      }
    })
  }, []);

  async function checkIfVoted(totalCandidates) {
    let resp = await fetch("/election/vote/" + electionID, {
      method: "GET",
      credentials: "include"
    })
    let jsonResp = await resp.json();
    console.log(jsonResp);
    if (jsonResp["result"] === "take to auth") {
      alert("Login to continue");
      navigate("/auth");
    }
    else if (jsonResp["result"] === true) {
      console.log("Already voted");
      setVoted(true);
    }
    getCandidatesList(totalCandidates);
  }

  async function getCandidatesList(count) {
    let swapList = [];
    for (let i = 1; i <= count; i++) {
      let resp = await fetch("/election/candidate/" + electionID + "/" + i.toString(), {
        method: "GET",
        credentials: "include"
      });
      let jsonResp = await resp.json();
      if (jsonResp["result"] !== "take to auth" || jsonResp["result"] !== false) {
        console.log(jsonResp);
        swapList.push(jsonResp["result"]);
      }
      else {
        alert("Login to continue");
        navigate("/auth");
      }
    }
    setCandidatesList([...swapList]);
  }

  const CandidateTile = function (props) {
    console.log(props.candidateInfo);
    let candidateButtonId = "electionButton_" + props.keyForComp.toString();

    function onSelected() {
      console.log(selectedCandidate);
      setSelectedCandidate(props.keyForComp);
    }

    return (
      <div className="card w-75 tile-container">
        <img src={props.candidateInfo.imageLink} className="card-img-top" alt="..." height="200px"/>
        <h4>Candidate no.: {props.keyForComp}</h4>
          <ul className="list-group list-group-flush">
          <div className="card-body">
            <h3 className="card-title">Name: {props.candidateInfo.name}</h3>
          </div>
            <li className="list-group-item"><h4>Punchline: {props.candidateInfo.punchline}</h4></li>
            <li className="list-group-item"><h4>Agendas: {props.candidateInfo.agendas}</h4></li>
          </ul>
          <button type="button" className={selectedCandidate === props.keyForComp ? "btn btn-success w-50 candidate-button" : "btn btn-primary w-50 candidate-button"} data-bs-toggle="button" id={candidateButtonId} onClick={onSelected}>{selectedCandidate === props.keyForComp ? "You selected" : "Select Candidate"}</button>
      </div>
    );
  }

  const ElectionPageBody = function (props) {

    async function submitVote() {
      setSaving(true);
      console.log("fskldjf");
      if (selectedCandidate === -1) {
        alert("Select a candidate !");
        return;
      }
      let resp = await fetch(
        "/election/vote/" + electionID + "/" + selectedCandidate.toString(),
        {
          method: "POST",
          credentials: "include"
        }
      );
      console.log(electionID);
      console.log(selectedCandidate);
      let jsonResp = await resp.json();
      console.log(jsonResp);
      if (jsonResp["result"] === true) {
        alert("Thanks for voting !");
        navigate("/");
      }
      else if (jsonResp["result"] === false) {
        alert("Error occured ! Try again.");
      }
      else {
        alert("Login to continue");
        navigate("/auth");
      }
    }

    const MessageIfVoted = function () {
      return (
        <div className="card text-center">
          <div className="card-header">
            IITG Elections 2022
          </div>
          <div className="card-body">
            <h3 className="card-title">Thanks for voting !!</h3>
            <p className="card-text">We have already counted your vote. </p>
            <Link to="/" className="btn btn-primary">Go back to home</Link>
          </div>
        </div>
      );
    }

    const ELectionCandidatesListPortion = function () {
      return (
        <>
          {
            electionEnded === false ? <>
            <h2 id='list-heading'>Following are the candidates:</h2>
              {
                candidatesList.map((element, index) => <CandidateTile candidateInfo={element} keyForComp={index + 1} />)
              }
              <div className="d-grid gap-2 col-6 mx-auto" id='submit-button'>
                <button className="btn btn-primary" type="button" onClick={submitVote}>Submit !!</button>
              </div>
            </> : <></>
          }
        </>
      );
    }

    const MessageIfEnded = function () {
      console.log(electionEnded);
      return (
        <>
          {
            electionEnded === true ?
              <div className="col-sm ended-message">
                <div className="card">
                  <div className="card-body">
                    <h3 className="card-title">Election has ended</h3>
                    <p className="card-text">You can checkout the statistics and results from below: </p>
                    <Link to={"/election/results/" + electionID} className="btn btn-primary">Click to see results</Link>
                  </div>
                </div>
              </div>
              : <></>
          }
        </>
      );
    }

    let dateTime = new Date(parseInt(props.electionInfo.endtime));
    return (
      <div className="card election-content">
        <h1 className="card-header">{props.electionInfo.position} election</h1>
        <div className="card-body">
          <h5 className="card-title">Ends at: {dateTime.toString()}</h5>
        </div>
        {
          voted === false ? <ELectionCandidatesListPortion /> :
            <MessageIfVoted />
        }
        <MessageIfEnded />
      </div>
    );
  }


  console.log(electionInfo == {});
  console.log(electionInfo);
  console.log(voted);
  return (
    <form>
      {
        saving == true ? <ProgressIndicator content="Saving..." /> :
          <>
            <div id='candidatesList'>
              {
                electionInfo.position === undefined ? <ProgressIndicator content="Loading..." /> :
                  <ElectionPageBody electionInfo={electionInfo} />
              }
            </div>
          </>
      }
    </form>
  )
}
