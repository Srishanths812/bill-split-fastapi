import { useState, useEffect } from "react";
import React from "react";
import Header from "../Components/Header_other2"

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Group_in from "../Components/group_info";
import { api } from "../services/api";

const Group = () => {
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
        <div className="min-h-screen flex flex-col items-center justify-start bg-black p-4 font-sans text-white">
            <Header />
            <div className="flex flex-col w-full mt-24">
                <Group_in className="bg-black text-white border border-white rounded-lg shadow-md p-4" />
            </div>
        </div>
    );
};

export default Group;
