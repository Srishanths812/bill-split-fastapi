import { useState, useEffect } from 'react';
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

function GroupInfo() {
    const Navigate = useNavigate();
    const [result, setResult] = useState([]);
    const [groupName, setgroupName] = useState([localStorage.getItem("Username")]);
    const [groupinput, setGroupinput] = useState('');

    const groupData = {
        groupName: groupinput,
        groupAdmin: localStorage.getItem("Username"),
        members: groupName.map(name => ({ username: name }))
    }

    const AddFriend = async () => {
        try {
            const data = await api.search.getFriendsList();
            setResult(data);
        } catch (error) {
            console.error("Error fetching friends list", error);
        }
    }

    useEffect(() => {
        AddFriend();
    }, []);

    const Add = (namee) => {
        setgroupName(prev => [...prev, namee]);
        setResult(prev => prev.filter(name => name !== namee));
    }

    const Delete = (namee) => {
        setResult(prev => [...prev, namee]);
        setgroupName(prev => prev.filter(name => name !== namee));
    }

    const CreateGroup = async () => {
        try {
            const data = await api.group.createGroup(groupData);
            if (data.success) {
                toast.success("Group Created Successfully");
                Navigate('/main');
            } else {
                toast.error("Enter Group Name");
            }
        } catch (error) {
            console.error("Error creating group", error);
            toast.error("Error creating group");
        }
    }

    // Capitalize names
    const l = structuredClone(result).map(name => name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    const m = structuredClone(groupName).map(name => name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center px-4 mx-auto mt-10">
            
            {/* Group Name Input & Current Members */}
            <div className="w-full max-w-md p-6 bg-black border border-white rounded-xl shadow-md 
                            hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-shadow duration-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] items-center gap-2">
                    <label className="text-xl font-semibold text-white">Group Name:</label>
                    <input
                        type="text"
                        className="w-full border border-white text-white bg-black rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white"
                        placeholder="Enter group name"
                        value={groupinput}
                        onChange={(e) => setGroupinput(e.target.value)}
                    />
                </div>

                <div className="h-48 space-y-2 overflow-y-scroll p-2 rounded-md border border-white">
                    {m.map((name, i) => (
                        <div key={i} className="bg-black border border-white rounded-md px-4 py-2 shadow-md 
                                                hover:shadow-[0_0_10px_rgba(255,255,255,0.2)] transition-shadow duration-200 flex flex-col items-center gap-2">
                            <h2 className="w-full text-left font-semibold text-white">{name}</h2>
                            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                                {localStorage.getItem("Username") !== groupName[i] &&
                                    <button
                                        className="bg-[#f79a9a] hover:shadow-[0_0_8px_rgba(255,255,255,0.5)] text-black font-semibold py-1 px-3 rounded text-sm transition-all duration-200"
                                        onClick={() => Delete(groupName[i])}
                                    >
                                        - Remove
                                    </button>
                                }
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Friends List to Add */}
            <div className="w-full max-w-md p-6 bg-black border border-white rounded-xl shadow-md 
                            hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-shadow duration-200 space-y-2 h-96 overflow-y-scroll">
                {l.map((name, i) => (
                    <div key={i} className="bg-black border border-white rounded-md px-4 py-2 shadow-md 
                                            hover:shadow-[0_0_10px_rgba(255,255,255,0.2)] transition-shadow duration-200 flex flex-col items-center gap-2">
                        <h2 className="w-full text-left font-semibold text-white">{name}</h2>
                        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                            <button
                                className="bg-[#a0dca0] hover:shadow-[0_0_8px_rgba(255,255,255,0.5)] text-black font-semibold py-1 px-3 rounded text-sm transition-all duration-200"
                                onClick={() => Add(result[i])}
                            >
                                + Add
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Group Button */}
            <button
                className="w-full max-w-md py-3 mt-4 bg-white text-black font-semibold rounded-lg 
                           hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-shadow duration-200"
                onClick={CreateGroup}
            >
                Create Group
            </button>
        </div>
    )
}

export default GroupInfo;
