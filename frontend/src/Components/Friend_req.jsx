import { useState, useEffect } from 'react';
import toast from "react-hot-toast";
import { api } from "../services/api";

function Friend() {
    const [result, setResult] = useState([]);

    const AddFriend = async () => {
        try {
            const data = await api.search.getFriendsRequest();
            setResult(data);
        } catch (error) {
            console.error("Error fetching friend requests", error);
        }
    }

    const AcceptFriend = async (name) => {
        try {
            const data = await api.search.acceptFriendRequest(name);
            if (data.success) toast.success("Friend Request Accepted");
            else toast.error("Failure");
        } catch (error) {
            toast.error("Error accepting friend request");
        }
    }

    const DeleteFriend = async (name) => {
        try {
            const data = await api.search.rejectFriendRequest(name);
            if (data.success) toast.success("Friend Request Declined");
            else toast.error("Failure");
        } catch (error) {
            toast.error("Error declining friend request");
        }
    }

    useEffect(() => {
        AddFriend();
        const interval = setInterval(() => {
            AddFriend();
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const l = structuredClone(result);
    for (let i = 0; i < l.length; i++) {
        const words = l[i].split(' ');
        let temp = '';
        for (let j = 0; j < words.length; j++) {
            temp += words[j].charAt(0).toUpperCase() + words[j].slice(1) + ' ';
        }
        l[i] = temp;
    }

    return (
        <div className="w-full">
            <div className="mb-4">
                <h2 className="text-white font-extrabold text-2xl text-center underline">
                    Friend Requests <span className="font-normal">({l.length})</span>
                </h2>
            </div>

            <div className="h-48 overflow-y-scroll border-2 border-white rounded-lg p-4 bg-black shadow-[0_0_5px_white]">
                <div className="flex flex-col w-full gap-2">
                    {l.slice(0, l.length).map((name, i) => (
                        <div
                            key={i}
                            className="bg-black border border-white rounded-md px-4 py-2 w-full shadow-[0_0_5px_white] hover:shadow-[0_0_10px_white] transition-shadow duration-300 flex flex-col items-center gap-2"
                        >
                            <h2 className="w-full text-left font-semibold text-lg text-white">{name}</h2>
                            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                                <button
                                    className="bg-green-300 text-black font-semibold py-1 px-3 rounded text-sm hover:bg-green-400 transition-colors duration-200"
                                    onClick={() => {
                                        AcceptFriend(result[i]);
                                        AddFriend();
                                    }}
                                >
                                    Accept
                                </button>
                                <button
                                    className="bg-red-300 text-black font-semibold py-1 px-3 rounded text-sm hover:bg-red-400 transition-colors duration-200"
                                    onClick={() => {
                                        DeleteFriend(result[i]);
                                        AddFriend();
                                    }}
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Friend;
