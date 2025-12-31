import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

function Groups() {
    const [result, setResult] = useState([]);
    const Navigate = useNavigate();
    const MyName = localStorage.getItem("Username");

    const GroupNames = async () => {
        try {
            const data = await api.group.getMainPageGroups(MyName);
            setResult(data);
        } catch (error) {
            console.error("Error fetching groups", error);
        }
    }

    function topay(expenses) {
        let pay = 0;
        for (let i = 0; i < expenses.length; i++) {
            const exp = expenses[i];
            if (exp.paidBy !== MyName) {
                const split = exp.splits.find(s => s.username === MyName);
                if (split) pay += split.amount;
            }
        }
        return pay;
    }

    function tocollect(expenses) {
        let collect = 0;
        for (let i = 0; i < expenses.length; i++) {
            const exp = expenses[i];
            if (exp.paidBy === MyName) {
                const split = exp.splits.find(s => s.username === MyName);
                if (split) collect += exp.cost - split.amount;
            }
        }
        return collect;
    }

    useEffect(() => {
        GroupNames();
        const interval = setInterval(() => {
            GroupNames();
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full grid gap-4">
            {result.map((group) => (
                <div
                    key={group.groupId}
                    onClick={() => Navigate(`/group?groupId=${encodeURIComponent(group.groupId)}`)}
                    className="cursor-pointer bg-black text-white p-6 rounded-2xl border-2 border-white
                               shadow-[0_0_0_rgba(255,255,255,0)] 
                               transition-all duration-300 
                               hover:shadow-[0_0_20px_4px_rgba(255,255,255,0.6)] 
                               hover:scale-[1.03] mb-2"
                >
                    <div className='grid grid-cols-2 gap-2'>
                        <div className="text-2xl font-semibold">{group.groupName}</div>

                        <div className="grid grid-cols-1">
                            <div className="col-span-1 text-right text-white/70">
                                <div>To Collect: ₹{tocollect(group.expenses)}</div>
                                <div>To Pay: ₹{topay(group.expenses)}</div>
                            </div>
                        </div>

                        <div className="text-lg font-medium mt-2">Amount: ₹{group.amount}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Groups;
