import { useState, useEffect } from "react";
import React from "react";
import Header from "../Components/Header_other"

import Friend from "../Components/Friend_req";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Friendlist from "../Components/Friend_list";
import Groups from "../Components/Group_Names";
import { api } from "../services/api";

const MainPage=()=>{
    const [message, setMessage]= useState('');

    const Navigate=useNavigate();

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
    return(
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4 font-sans">
        <Header />
        <div className="grid grid-cols-1 lg:grid-cols-3 w-full items-start border-4 gap-x-3 gap-y-4">
        <div className="w-full lg:col-span-2 lg:row-span-5">
            <Groups/>
        </div>
        <div className="lg:col-span-1 w-full">
            <Friend />
            <Friendlist />
        </div>
        </div>
        
        </div>
    );
};

export default MainPage;