import { useState, useEffect } from "react";
import React from "react";
import Header from "../Components/Header_other";
import Friend from "../Components/Friend_req";
import Friendlist from "../Components/Friend_list";
import Groups from "../Components/Group_Names";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../services/api";

const MainPage = () => {
  const [message, setMessage] = useState('');
  const Navigate = useNavigate();

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const data = await api.main.getMainData();
        if (data.success) {
          setMessage(data.message);
        } else {
          Navigate("/");
          toast.error("Access Denied");
        }
      } catch (error) {
        setMessage("Error");
        console.error("Error fetching main data", error);
      }
    };
    fetchMessage();
  }, [Navigate]);

  return (
    <div className="min-h-screen w-full bg-black text-white font-sans flex flex-col">
      
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex-1 mt-24 p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Groups Section */}
        <div className="lg:col-span-2 bg-black rounded-2xl border border-white p-6 shadow-[0_0_10px_white] hover:shadow-[0_0_20px_white] transition-shadow duration-300">
          <Groups />
        </div>

        {/* Friends Section */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="bg-black rounded-2xl border border-white p-4 shadow-[0_0_10px_white] hover:shadow-[0_0_20px_white] transition-shadow duration-300">
            <Friend />
          </div>
          <div className="bg-black rounded-2xl border border-white p-4 shadow-[0_0_10px_white] hover:shadow-[0_0_20px_white] transition-shadow duration-300">
            <Friendlist />
          </div>
        </div>

      </div>
    </div>
  );
};

export default MainPage;
