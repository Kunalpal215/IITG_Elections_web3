import React, {useState,useRef, useEffect} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ProgressIndicator } from './ProgressIndicator';
import './HomePage.css'

export const HomePage = () => {
  let toShow= useRef(false);
  let [electionsList,setElectionsList] = useState([]);
  let navigate = useNavigate();
  useEffect(() => {
    getElectionInfo();
  },[]);

  const ElectionListItem = function (props){
    console.log(props);
    console.log(props.electionInfo["endtime"]);
    console.log(typeof(props.electionInfo));
    let dateTime = new Date(parseInt(props.electionInfo["endtime"]));
    let electionPageRouteUrl = "/election/info/" + props.electionInfo["id"];
    return (
      <Link to={electionPageRouteUrl} className='card election-list-item' key={props.keyToComp}>
        <div className="d-flex w-100 justify-content-between">
          <h3 className='card-title'>{props.electionInfo["position"]}</h3>
          <p className="rounded-pill btn btn-primary">{"Total casted votes: " + props.electionInfo["votes"]}</p>
        </div>
        <p className='card-title'>{"Ends at: " + dateTime.toString() + " | " + "Total candidates: " + props.electionInfo["totalCandidates"]}</p>
      </Link>
    );
  }

  async function getElectionInfo(){
    // let electionsList = document.getElementById("listDiv");
    let newList = [];
    fetch("/election",
      {
        credentials: "include"
      }
    ).then((resp) => resp.json())
    .then((jsonResp) => {
      if(jsonResp["result"]==="take to auth"){
        navigate("/auth");
      }
      jsonResp["details"].forEach((element) => {
        console.log("here");
        newList.push(element);
      })
      console.log(newList);
      toShow.current=true;
      setElectionsList([...newList]);
    })
    // electionsList.removeChild(document.getElementById("loadingElection"));
    // return electionsList;
  }
  console.log("xyz");
  console.log(electionsList);
  console.log(toShow);
  return (
    <div>
      <div class="d-grid gap-2">
      <Link to="/admin/home" style={{"margin":"16px"}}><button class="btn btn-warning" type="button"><h3>Click for Admin Dashboard</h3></button></Link>
</div>
      {toShow.current===false ? <ProgressIndicator content="Loading..." /> : 
        <div id='listDiv'>
        {
          electionsList.map((electionInfo,idx) => <ElectionListItem electionInfo={electionInfo} keyToComp={idx}/>)
        }
    </div>
      }
    </div>
  );
}
