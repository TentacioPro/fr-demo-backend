import express from "express";
import { MongoClient } from 'mongodb';
import { ObjectId } from "mongodb";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const app = express();
const url ="mongodb+srv://maharajanabishek:abishek123@abishekm.cow2tws.mongodb.net/?retryWrites=true&w=majority&appName=AbishekM";
const client = new MongoClient(url);
await client.connect();
console.log("mongoDB connected successfully");

app.use(express.json());
app.use(cors(
    //origin:"*",                    // global access 
   // origin:"http://localhost:3000",  // vercel.app
    // origin:"https:// vercel.app",

));

const auth = (request, response, next) => {
    try {
        const token = request.header("backend-token"); // keyname
        jwt.verify(token, "student");
        next();

    } catch (error) {
        response.status(401).send({message:error.message});        
    }
};

app.get("/",function(request,response){
    response.status(200).send("hello world")
});

app.post("/post",async function(request,response){
    const getPostman = request.body;
    const sendMethod = await client.db("CRUD").collection("data").insertOne(getPostman);
    response.status(201).send(sendMethod);

});
app.post("/postmany", async function(request,response){
    const getMany = request.body;
    const sendMethod = await client.db("CRUD").collection("data").insertMany(getMany);
    response.status(201).send(sendMethod);
});

app.get("/get",auth,async function(request,response){
    const getMethod = await client.db("CRUD").collection("data").find({}).toArray();
    response.status(200).send(getMethod);
});

app.get("/getone/:id",async function(request,response){
    const {id} = request.params ;
    const getMethod = await client.db("CRUD").collection("data").findOne({_id:new ObjectId(id)});
    response.status(200).send(getMethod);
});

app.put("/update/:id",async function(request,response){
    const {id} = request.params;
    const getPostman = request.body;
    const updateMethod = await client.db("CRUD").collection("data").updateOne({_id:new ObjectId(id)}, {$set:getPostman});
    response.status(201).send(updateMethod);
    
});

app.delete("/delete/:id",async function(request,response){
    const {id} = request.params;
    const deleteMethod = await client.db("CRUD").collection("data").deleteOne({_id:new ObjectId(id)});
    response.status(200).send(deleteMethod);
});

app.post("/register", async function(request,response){
    const {username, email, password} = request.body;
    const userFind = await client.db("CRUD").collection("private").findOne({email:email});
    if(userFind){
        response.status(400).send("Existing User");
    }
    else{
         
         const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(password,salt);
         console.log(hashedPassword);
         const registerMethod = await client.db("CRUD").collection("private").insertOne({username:username, email:email, password: hashedPassword});
         response.status(201).send(registerMethod); //201 - creation 200 - ok 400 - bad req
    }    
})

app.post("/login",async function(request,response){
    const {email, password} = request.body;
    // console.log(email,password);
    const userFind = await client.db("CRUD").collection("private").findOne({email:email});
    // console.log(userFind);
    if(userFind) {
        const mongoDBpassword = userFind.password;
        const passwordCheck = await bcrypt.compare(password, mongoDBpassword);
        // console.log(passwordCheck);
        if(passwordCheck) {
            const token = jwt.sign({id:userFind._id} , "student"); //jwt token student
            response.status(200).send({token:token});
        }
        else{
            response.status(400).send({message:"Invalid Password"});
        }
    }
    else {
        response.status(400).send({message:"Invalid Email-id"});
    }
});

app.listen(4000, () => {
    console.log("server connected successfully");
})

// 65f404eab3ad91fb84829286