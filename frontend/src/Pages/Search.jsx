import { useState, useEffect } from "react";
import React from "react";
import Header from "../Components/Header_other"

import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../services/api";

const Search=()=>{
    const [message, setMessage]= useState('');
    const [result, setResult]= useState([]);

    const Navigate=useNavigate();
    const location=useLocation();
    const link=new URLSearchParams(location.search);
    const username=link.get("username")||'';

    const AddFriend=async(name)=>{
      try{
        const data = await api.search.addFriend(name);
        if (data.success){
            toast.success("Friend Request Sent")
        }
        else{
            toast.error("User is already your friend");
        }
      }catch(error){
        toast.error("Error adding friend");
      }
    }


    useEffect(()=>{
        if (username.trim()==="") return;
        
        const Userlist=async()=>{
            try{
                const data = await api.search.search(username);
                setResult(data);
            }catch(error){
                console.error("Error searching users", error);
            }
        };
        Userlist();
    }, [username]);

    useEffect(()=>{
        const fetchMessage=async()=>{
            try{
                const data = await api.main.getMainData();
                if (data.success){
                    setMessage(data.message);
                }
                else{
                    Navigate("/");
                    toast.error("Access Denied");
                    }
            }catch (error){
                setMessage("Error");
                console.error("Error fetching main data", error);
            }
        };
        fetchMessage();
    },[Navigate]);
    const l=structuredClone(result);
    const MyName=localStorage.getItem("Username");
    let test=-1;
    for (let i=0; i<l.length;i++){
        if (MyName===l[i]){
            test=i;
        }
        const words=l[i].split(' ');
        let temp='';
        for (let j=0;j<words.length;j++){
            temp+=words[j].charAt(0).toUpperCase()+ words[j].slice(1)+' ';
        }
        l[i]=temp;
    }
    if (test>-1){
        l.splice(test,1);
    }
    return(
        <div className="mt-20 mb-19 min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
        <Header />

        <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(300px,1fr))] justify-items-center w-full max-w-screen-xl mx-auto">
            {l.slice(0, l.length).map((name, i) => (
                <div key={i} className="card bg-primary text-primary-content w-80">
                <div className="card-body">
                    <h2 className="card-title font-bold text-3xl justify-center">{name}</h2>
                    <div className="card-actions justify-center" >
                        <button className="btn btn-active" onClick={()=>AddFriend(result[i])}>
                            + Add Friend
                        </button>
                    </div>
                </div>
                </div>
        ))}
        </div>
        
        </div>
    );
};

export default Search;