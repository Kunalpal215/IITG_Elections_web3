import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './ElectionResults.css';
import { ProgressIndicator } from './ProgressIndicator';

export const ElectionResults = () => {
  let { electionID } = useParams();
  let navigate = useNavigate();
  let [votesInfo, setVotesInfo] = useState(false);
  let [electionWinner, setElectionWinner] = useState(false);

  async function getElectionWinner() {
    let resp = await fetch("/election/winner/" + electionID, {
      method: "GET",
      credentials: "include"
    });
    let jsonResp = await resp.json();
    if (jsonResp["result"] === "take to auth") {
      alert("login to continue");
      navigate("/auth");
    }
    else {
      setElectionWinner(jsonResp["result"]);
    }
  }

  async function fetchCandidatesVotes() {
    let firstResp = await fetch("/election/names/" + electionID, {
      method: "GET",
      credentials: "include"
    });
    let secondResp = await fetch("/election/votes/" + electionID, {
      method: "GET",
      credentials: "include"
    });
    let firstJsonResp = await firstResp.json();
    let secondJsonResp = await secondResp.json();
    let resVotesInfo = [];
    if (secondJsonResp["result"] === "take to auth") {
      alert("login to continue");
      navigate("/auth");
    }
    console.log(firstJsonResp["result"]);
    console.log(secondJsonResp["result"]);
    for (let i = 0; i < firstJsonResp["result"].length; i++) {
      resVotesInfo.push({ "name": firstJsonResp["result"][i], "votes": parseInt(secondJsonResp["result"][i]) });
    }
    console.log(resVotesInfo);
    setVotesInfo(() => resVotesInfo);
  }

  useEffect(() => {
    fetchCandidatesVotes();
    getElectionWinner();
  }, [])

  const VotesTable = function (props) {
    return (
      <div className='card w-75 card-header election-stats'>
        <h2 className="card-title">Election Statistics</h2>
        <table className="table table-success">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name of candidate</th>
              <th scope="col">Votes</th>
            </tr>
          </thead>
          <tbody>
            {
              props.votesInfo.map((element, index) =>
                <tr>
                  <th scope='row'>{index + 1}</th>
                  <td>{element.name}</td>
                  <td>{element.votes}</td>
                </tr>)
            }
          </tbody>
        </table>
      </div>
    );
  }

  const WinnerCandidateTile = function (props) {
    return (
      <div className="card w-75 election-winner">
        <div className="card-header">
    <h1>Election Winner</h1>
  </div>
        <img src={props.candidateInfo.imageLink} className="card-img-top" alt="..." height="200px"/>
          <div className="card-body">
            <h3 className="card-title">Name: {props.candidateInfo.name}</h3>
          </div>
          <ul className="list-group list-group-flush">
            <li className="list-group-item"><h4>Punchline: {props.candidateInfo.punchline}</h4></li>
            <li className="list-group-item"><h4>Agendas: {props.candidateInfo.agendas}</h4></li>
            <li className="list-group-item"><h4>Votes: {props.candidateInfo.votes}</h4></li>
          </ul>
      </div>
    );
  }

  return (
    <div className='card'>
      {
        votesInfo !== false ? <VotesTable votesInfo={votesInfo} /> : <ProgressIndicator content="Loading..."/>
      }
      {
        electionWinner !== false ? <WinnerCandidateTile candidateInfo={electionWinner} /> : <ProgressIndicator content="Loading..."/>
      }
    </div>
  )
}
