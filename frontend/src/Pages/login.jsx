import { useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Components/Header"

import { api } from "../services/api";

const Login =()=>{
    localStorage.setItem("Token",'');
    localStorage.setItem("Username",'');
    
    const Navigate=useNavigate();
    const [username, setUsername]= useState('');
    const [password, setPassword]= useState('');
    const [message, setMessage]= useState('');

    const formHandle= async(e)=>{
        e.preventDefault();
        setMessage("Brewing your financial portions....");
        try{
            const data = await api.auth.login({ username, password });

            if (data.success){
                localStorage.setItem("Token",data.token);
                localStorage.setItem("Username",data.username);
                Navigate("/main");
            }
            else{
                setMessage(data.message);
                setUsername('');
                setPassword('');
            }
        }catch (error){
            setMessage("An Error Occured. Please Try Again Later")
            setUsername('');
            setPassword('');
        }
    };
    return(
    <div className="min-h-screen flex items-center justify-center bg-black p-4 font-sans">
    <Header />
    
      <div className="bg-gray-900 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
        <h2 className="text-3xl font-bold text-center text-white mb-8">Welcome Back!!!</h2>
        <form onSubmit={formHandle} className="space-y-6">
          <div>
            <label className="label text-gray-300">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="input input-primary bg-gray-800 text-white w-full border border-gray-600"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <p className="label text-red-400">*required</p>
          </div>
          <div>
            <label className="label text-gray-300">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="input input-primary bg-gray-800 text-white w-full border border-gray-600"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="label text-red-400 p-1">*required</p>
          </div>
          <button
            type="submit"
            className="w-full bg-gray-700 text-white py-2 px-4 rounded-md font-semibold hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
          >
            Log In
          </button>
          <button
            type="button"
            onClick= {()=> Navigate("/signup")}
            className="w-full bg-red-700 text-white py-2 px-4 rounded-md font-semibold hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 transition ease-in-out duration-150"
          >
            Sign Up
          </button>
          {/* <button
            type="button"
            onClick= {()=> Navigate("/forgotpassword")}
            className="w-full bg-yellow-500 text-white py-2 px-4 rounded-md font-semibold hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:ring-offset-2 transition ease-in-out duration-150"
          >
            Forgot Password
          </button> */}
        </form>
        {message && (
          <p className={`mt-6 text-center text-md ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
