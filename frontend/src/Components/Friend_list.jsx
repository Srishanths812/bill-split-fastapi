import {useState, useEffect} from 'react';
import toast from "react-hot-toast";
import { api } from "../services/api";

function Friendlist(){
    const [result, setResult]= useState([]);
    const AddFriend=async()=>{
      try{
        const data = await api.search.getFriendsList();
        setResult(data);
      }catch(error){
        console.error("Error fetching friends list", error);
      }
    }

    useEffect(()=>{
        AddFriend();
        const interval=setInterval(()=>{
            AddFriend();
        }, 3000);
        return()=> clearInterval(interval);
    }, []);

    const DeleteFriend=async(name)=>{
      try{
        const data = await api.search.deleteFriend(name);
        if (data.success){
            toast.success("Friend Removed")
        }
        else{
            toast.error("Failure");
        }
      }catch(error){
        toast.error("Error removing friend");
      }
    }

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
        <div className="w">
        <div className="mb-2">
        <h2 className=" text-black font-extrabold text-2xl text-center underline">Friends <span className="font-normal">({l.length})</span></h2>
        </div>
        
        <div className="h-48 overflow-y-scroll border-4 border-double hover:black border-black rounded-lg p-4 bg-white shadow">
            <div className="flex flex-col w-full gap-2">
                {l.slice(0, l.length).map((name, i) => (
                    <div key={i} className="bg-blue-800 rounded-md px-4 py-2 w-full shadow-md flex flex-col items-center gap-2">
                        <h2 className="w-full text-left font-semibold text-lg text-white">{name}</h2>
                        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                            <button 
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded text-sm"
                            onClick={()=>{
                                DeleteFriend(result[i]);
                                AddFriend;
                            }}>
                                Delete Friend
                            </button>
                        </div>
                    </div>
            ))}
            </div>
        </div>
    </div>
    )
}

export default Friendlist;