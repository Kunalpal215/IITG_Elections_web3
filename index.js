const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const cors = require("cors");
const cookieParser = require("cookie-parser");
const {ethers} = require("ethers");
const contractBuild = require("./utils/ElectionPortal.json");
require("dotenv").config();
const user = require("./models/user");
const election = require("./models/election");
// app.use(cors({
//     origin: 'http://localhost:3000',
//     methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
//     credentials: true
// }));
app.use(express.json());
app.use(cookieParser());

const provider = new ethers.providers.JsonRpcProvider(process.env.JSON_NODE_API);
const wallet = ethers.Wallet.fromMnemonic(process.env.WALLET_MNEMONIC);
const signer = wallet.connect(provider);
const ElectionContract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractBuild.abi, signer);
console.log(process.env.CONTRACT_ADDRESS);
// console.log(ElectionContract);

app.post("/signup",async (req,res) => {
    console.log(req.body);
    let username = req.body.username;
    let password = req.body.password;
    let useremail = req.body.useremail;
    console.log(username,password,useremail);
    const alreadyUser = await user.findOne({useremail: useremail}).clone();
    if(alreadyUser){
        res.status(400).json({"result" : "This email is already registered"});
        return;
    }
    const namedUser = await user.findOne({username: username});
    if(namedUser){
        res.status(400).json({"result" : "This username is already taken"});
        return;
    }
    password = bcryptjs.hashSync(password,10);
    let newUser = user({username,password,useremail});
    await newUser.save().then((retUser) => {
        console.log(retUser);
        res.json({"result" : "New user registered successfully"});
    }).catch((err) => {
        console.log(err);
        res.header("Access-Control-Allow-Origin","*");
        res.status(500).json({"result" : "An error occured while resgistering"});
    })
});


app.post("/login",async (req,res) => {
    console.log(req.body);
    let password = req.body.password;
    let useremail = req.body.useremail;
    console.log(useremail,password);
    let dbUser = await user.findOne({useremail: useremail});
    console.log("here");
    if(!dbUser){
        res.status(404).json({"result" : "This email is not registered"});
        return;
    }
    console.log(dbUser);
    let checkPassword = bcryptjs.compareSync(password,dbUser.password);
    if(!checkPassword){
        res.status(400).json({"result" : "Password is incorrect"});
        return;
    }
    let token = jwt.sign({data: useremail},process.env.JWT_SECRET,{expiresIn: "1h"});
    console.log(token);
    res.cookie("authCookie",token,{expires: new Date(Date.now() + 3600000)});
    res.json({"result" : "logged in successfully"});
});

app.post("/login/check",async (req,res) => {
    const token = req.cookies["authCookie"];
    if(token){
        jwt.verify(token,process.env.JWT_SECRET,(err,decoded) => {
            if(err){
                res.json({"result" : "token expired"});
                return;
            }
            console.log("Verified token");
            res.json({"result" : decoded["data"]});
        });
    }
    else{
        res.json({"result" : "No token passed"});
    }
});

app.get("/login/admin/check",async (req,res) => {
    const token = req.cookies["adminCookie"];
    console.log(token);
    if(token){
        jwt.verify(token,process.env.ADMIN_JWT_SECRET,(err,decoded) => {
            if(err){
                res.json({"result" : "token expired"});
                return;
            }
            console.log("Verified token");
            res.json({"result" : decoded["data"]});
        });
    }
    else{
        res.json({"result" : "No token passed"});
    }
});

app.post("/login/admin",(req,res) => {
    let adminemail = req.body.email;
    let adminSecret = req.body.secret;
    console.log(adminemail,adminSecret);
    if(adminemail===process.env.ADMIN_EMAIL && adminSecret===process.env.ADMIN_SECRET){
        let token = jwt.sign({data:adminemail},process.env.ADMIN_JWT_SECRET,{expiresIn: "1h"});
        console.log(token);
        res.cookie("adminCookie",token,{expires: new Date(Date.now() + 3600000)});
        res.json({"result" : "verified admin"});
        return;
    }
    res.json({"result" : "not verified"});
});


function checkUserLogin(req,res,next){
    let token = req.cookies["authCookie"];
    console.log(token);
    if(token){
        jwt.verify(token,process.env.JWT_SECRET,(err,decoded) => {
            if(err){
                res.json({"result" : "take to auth"});
                return "token expired";
            }
            console.log("Verified token");
            req.body.useremail = decoded["data"];
            console.log(req.body.useremail);
            next();
        });
    }
    else{
        res.json({"result" : "take to auth"});
        return "no token passed";
    }
}

function checkAdminLogin(req,res,next){
    let token = req.cookies["adminCookie"];
    console.log(token);
    if(token){
        jwt.verify(token,process.env.ADMIN_JWT_SECRET,(err,decoded) => {
            console.log(err);
            if(err){
                res.json({"result" : "take to auth"});
                return "token expired";
            }
            console.log("Verified token");
            req.body.useremail = decoded["data"];
            console.log(req.body.useremail);
            next();
        });
    }
    else{
        res.json({"result" : "take to auth"});
        return "no token passed";
    }
}

app.get("/election",checkUserLogin, async (req,res) => {
    console.log("here 1");
    console.log(req.body.useremail);
    try{
        let tx = await ElectionContract.getElectionInfo();
        let resDetailsArray = [];
        const electionValues = Object.values(tx);
        electionValues.forEach((element) => {
            let objToAdd = {
                "id": element["id"],
                "position": element["position"],
                "endtime": element["endtime"].toString(),
                "votes": element["votes"].toString(),
                "totalCandidates": element["totalCandidates"].toString(),
            }
            resDetailsArray.push(objToAdd);
        })
        res.json({"details" : resDetailsArray});
    }
    catch(err){
        console.log(err);
        res.json({"result" : false});
    }
})

app.post("/election",checkAdminLogin,async (req,res) => {
    if(!req.body.position){
        res.json({"result" : false});
        return;
    }
    let electionDoc = election();
    await electionDoc.save();
    let id = electionDoc["_id"].toString();
    let endtime = Date.now() + 86400000;
    let position = req.body.position;
    try{
        let tx = await ElectionContract.addElection(id,endtime,position);
        await tx.wait();
        res.json({"result" : true});
    }
    catch(err){
        console.log(err);
        res.json({"result": false});
    }
});

app.post("/election/candidate",checkAdminLogin,async (req,res) => {
    console.log(req.body);
    let name = req.body["name"];
    let agendas = req.body["agendas"];
    let imageLink = req.body["imageLink"];
    let punchline = req.body["punchline"];
    if(!name || !agendas || !imageLink || !punchline){
        res.json({"result" : false});
        return;
    }
    console.log(name);
    console.log(agendas);
    console.log(imageLink);
    console.log(punchline);
    try{
        let tx = await ElectionContract.addCandidate(name,agendas,imageLink,punchline);
        await tx.wait();
        console.log(tx);
        res.json({"result" : true});
    }
    catch(err){
        console.log(err);
        res.json({"result": false});
    }
})

app.get("/election/:electionID", checkUserLogin ,async (req,res) => {
    let electionID = req.params.electionID;
    let tx = await ElectionContract.getElectionDetails(electionID);
    let toRtn = {
        "position" : tx[0],
        "endtime" : tx[1],
        "totalCandidates" : tx[2]
    }
    res.json(toRtn);
})

app.get("/election/vote/:electionID",checkUserLogin,async (req,res) => {
    let email = req.body.useremail;
    if(!req.params.electionID){
        console.log("here 1");
        res.json({"result" : false});
        return;
    }
    let queriedElection = await election.findById(req.params.electionID);
    if(!queriedElection){
        console.log("here 2");
        res.json({"result" : false});
        return;
    }
    console.log(queriedElection);
    console.log(email);
    if(queriedElection.voters.includes(email)){
        res.json({"result" : true});
    }
    else{
        console.log("here 3");
        res.json({"result" : false});
    }
})

app.post("/election/vote/:electionID/:candidateID",checkUserLogin ,async (req,res) => {
    let email = req.body.useremail;
    let electionID = req.params.electionID;
    let candidateID = req.params.candidateID; // should be in 1/2/3/4
    console.log(email, electionID, candidateID);
    if(!email || !electionID || !candidateID){
        console.log("here");
        res.json({"result" : false});
        return;
    }
    try{
        console.log("here 1");
        let tx = await ElectionContract.getElectionEndTime(req.params.electionID);
        console.log(tx);
        if(parseInt(tx.toString()) < Date.now()){
            console.log("here 2");
            res.json({"result" : false});
            return;
        }
    }
    catch(err){
        console.log(err);
        console.log("here 3");
        res.json({"result": false});
        return;
    }
    let session = await mongoose.startSession();
    session.startTransaction();
    let savedToDb = false;
    try{
        let electionDoc = await election.findById(electionID).session(session);
        if(electionDoc.voters.includes(email)){
            throw new Error("Voter has already voted");
        }
        electionDoc.voters.push(email);
        await electionDoc.save();
        await session.commitTransaction();
        console.log("here 6");
        savedToDb=true;
    }
    catch(err){
        console.log(err);
        await session.abortTransaction();
    }
    finally{
        await session.endSession();
    }
    if(!savedToDb){
        console.log("here 7");
        res.json({"result": false});
        return;
    }
    else{
        try{
            let tx = await ElectionContract.incrVote(electionID,candidateID);
            console.log("here 4");
            await tx.wait();
        }
        catch(err){
            console.log(err);
            console.log("here 5");
            res.json({"result": false});
            return;
        }
    }
    res.json({"result" : true});
})

app.get("/election/votes/:electionID", async (req,res) => {
    let electionID = req.params.electionID;
    try{
        console.log(electionID);
        let tx = await ElectionContract.getElectionCandidatesVotes(electionID);
        console.log(tx);
        let toRtn = [];
        for(let i=0;i<tx.length;i++){
            toRtn.push(tx[i].toString());
        }
        res.json({"result" : toRtn});
    }
    catch(err){
        console.log(err);
        res.json({"result" : false});
    }
})

app.get("/election/candidate/:electionID/:candidateId", async (req,res) => {
    let candidateID = req.params.candidateId;
    let electionID = req.params.electionID;
    if(!electionID || !candidateID){
        res.json({"result" : false});
        return;
    }
    try{
        let tx = await ElectionContract.getCandidateDetails(candidateID,electionID);
        console.log(tx);
        let candidateDetails = {
            "name" : tx[0],
            "agendas" : tx[1],
            "punchline" : tx[2],
            "imageLink" : tx[3]
        }
        res.json({"result" : candidateDetails});
    }
    catch(err){
        console.log(err);
        res.json({"result" : false});
    }
})

app.get("/election/names/:electionID",async (req,res) => {
    let electionID = req.params.electionID;
    if(!electionID){
        res.json({"result" : false});
        return;
    }
    try{
        let tx = await ElectionContract.getElectionCandidatesNames(electionID);
        res.json({"result" : tx});
    }
    catch(err){
        console.log(err);
        res.json({"result" : false});
    }
})

app.get("/election/winner/:electionID", checkUserLogin,async (req,res) => {
    let electionID = req.params.electionID;
    if(!electionID){
        res.json({"result" : false});
        return;
    }
    try{
        let tx = await ElectionContract.getElectionWinner(electionID);
        let winnerDetails = {
            "name" : tx[0],
            "agendas" : tx[1],
            "punchline" : tx[2],
            "imageLink" : tx[3],
            "votes" : tx[4]
        }
        res.json({"result" : winnerDetails});
    }
    catch(err){
        console.log(err);
        res.json({"result" : false});
    }
})
console.log(__dirname);

app.use(express.static(__dirname + "/build"));

app.get("*",(req,res) => {
    res.sendFile(__dirname+ "/build/index.html"); 
})

mongoose.connect(process.env.MONGODB_URL, () => {
    console.log("Mongodb connected");
    app.listen(process.env.PORT || 3000,() => {
        console.log("Server started");
    });
});