import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from 'react';
import toast from "react-hot-toast";
import { api } from "../services/api";

function Header() {
  const Navigate = useNavigate();
  const location = useLocation();
  const inputbox = useRef(null);

  const link = new URLSearchParams(location.search);
  const initialvalue = link.get("username") || '';
  const [searchkey, setSearchKey] = useState(initialvalue);
  const [dp, setDp] = useState('');

  useEffect(() => {
    const fetchDP = async () => {
      try {
        const data = await api.profile.getDetails(localStorage.getItem("Username"));
        setDp(data.dp[0]);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchDP();
  }, []);

  const deleteAccount = async () => {
    try {
      const data = await api.profile.deleteAccount(localStorage.getItem("Username"));
      if (data.success) {
        toast.success("Account Deleted Successfully");
        document.getElementById('my_modal_1').close();
        Navigate('/');
      } else {
        toast.error("Account Deletion Failed");
        document.getElementById('my_modal_1').close();
      }
    } catch (error) {
      toast.error("Error deleting account");
    }
  }

  useEffect(() => {
    if (initialvalue !== '' && inputbox.current) inputbox.current.focus();
  }, [initialvalue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchkey.trim() !== '') {
        Navigate(`/search?username=${encodeURIComponent(searchkey.trim())}`);
      } else {
        Navigate('/main');
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchkey, Navigate]);

  let names = localStorage.getItem("Username");
  let temp = '';
  names = names.split(' ');
  for (let j = 0; j < names.length; j++) {
    temp += names[j].charAt(0).toUpperCase() + names[j].slice(1) + ' ';
  }
  names = temp;

  return (
    <header className="fixed top-0 left-0 right-0 w-full bg-black text-white py-4 z-50 border-b border-white backdrop-blur-sm">
      <div className="grid md:grid-cols-[auto_1fr_auto] grid-cols-1 items-center px-6 gap-4">

        {/* Left Section */}
        <div className="flex items-center gap-4">
          <h1 
            className="text-2xl font-semibold tracking-wide text-white"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Bill Split
          </h1>
          <button
            className="btn btn-circle bg-black border border-white text-white hover:bg-white hover:text-black transition-colors duration-200"
            title="Add Group"
            onClick={() => Navigate("/group_create")}
          >
            +
          </button>
          <button
            onClick={() => Navigate("/main")}
            title="Home"
            className="p-1 hover:text-gray-300 transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-auto justify-self-end">
          <input
            ref={inputbox}
            type="text"
            placeholder="Search Users..."
            className="input input-bordered border-white bg-black text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-white w-full max-w-sm transition-all"
            value={searchkey}
            onChange={(e) => setSearchKey(e.target.value)}
          />
        </div>

        {/* Profile Dropdown */}
        <div className="justify-self-end">
          <div className="dropdown dropdown-end ml-3">
            <div tabIndex="0" role="button" className="btn btn-ghost btn-circle avatar border border-white hover:border-white transition-all">
              <div className="w-10 rounded-full">
                <img src={dp || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} alt="profile" />
              </div>
            </div>
            <ul
              tabIndex="0"
              className="menu menu-sm dropdown-content bg-black text-white rounded-box z-10 mt-3 w-52 p-2 border border-white shadow-[0_0_5px_white]"
            >
              <h1 className="text-lg p-2">{names}</h1>
              <li><a onClick={() => Navigate("/profile")}>Change Profile Details</a></li>
              <li>
                <button className="bg-red-300 text-black py-1 px-3 rounded hover:bg-red-400 transition-colors duration-200" onClick={() => document.getElementById('my_modal_1').showModal()}>
                  Delete Account
                </button>
              </li>
              <li>
                <button className="w-full bg-black border border-white text-white py-1 px-3 rounded hover:bg-white hover:text-black transition-colors duration-200" onClick={() => Navigate("/")}>
                  Logout
                </button>
              </li>
            </ul>

            {/* Modal */}
            <dialog id='my_modal_1' className="modal">
              <div className="modal-box bg-black text-white border border-white">
                <h3 className="font-medium text-lg">Confirm Deletion</h3>
                <p className="py-4">Are you sure you want to delete your account? This action cannot be undone.</p>
                <div className="modal-action flex gap-2">
                  <button className="bg-red-300 text-black py-1 px-3 rounded hover:bg-red-400 transition-colors duration-200" onClick={deleteAccount}>
                    Yes
                  </button>
                  <button className="bg-black text-white border border-white py-1 px-3 rounded hover:bg-white hover:text-black transition-colors duration-200" onClick={() => document.getElementById('my_modal_1').close()}>
                    Cancel
                  </button>
                </div>
              </div>
            </dialog>
          </div>
        </div>

      </div>
    </header>
  );
}

export default Header;
