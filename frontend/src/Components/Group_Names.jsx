import {useState, useEffect} from 'react';
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

function Groups() {
    const [result, setResult]= useState([]);
    const Navigate=useNavigate();
    const MyName=localStorage.getItem("Username")


    const GroupNames=async()=>{
      try{
        const data = await api.group.getMainPageGroups(localStorage.getItem("Username"));
        setResult(data);
      }catch(error){
        console.error("Error fetching groups", error);
      }
    }

    function topay(expenses){
        let pay=0;
        for (let i=0;i<expenses.length;i++){
            const exp=expenses[i];
            if (exp.paidBy!==MyName){
                const split=exp.splits.find(s=>s.username===MyName);
                if (split){
                    pay+=split.amount;
                }
            }
        }
        return pay;
    }
    function tocollect(expenses){
        let collect=0;
        for (let i=0;i<expenses.length;i++){
            const exp=expenses[i];
            if (exp.paidBy===MyName){
                const split=exp.splits.find(s=>s.username===MyName);
                if (split){
                    collect+=exp.cost-split.amount
                }
            }
        }
        return collect;
    }
    useEffect(()=>{
        GroupNames();
        const interval=setInterval(()=>{
            GroupNames();
            console.log(result);
        }, 3000);
        return()=> clearInterval(interval);
    }, []);

    return(
        <div className="w-full">
      {result.map((group) => (
        <div
          key={group.groupId}
          onClick={() => Navigate(`/group?groupId=${encodeURIComponent(group.groupId)}`)}
          className="cursor-pointer bg-orange-100 text-black p-6 rounded-2xl shadow-lg border-2 border-black transition duration-350 hover:bg-black hover:text-white mb-2"
        >
          <div className='grid grid-cols-2'>
          <div className="text-2xl font-bold mb-4">{group.groupName}</div>
          
          <div className="grid grid-cols-1">
                    <div className="col-span-1 text-right text-gray-800">
                        <div>To Collect: ₹{tocollect(group.expenses)}</div>
                        <div>To Pay: ₹{topay(group.expenses)}</div>
                    </div>
                </div>
                <div className="text-lg font-semibold">Amount: ₹{group.amount}</div>
                </div>
        </div>
      ))}
    </div>
    )
}

export default Groups;