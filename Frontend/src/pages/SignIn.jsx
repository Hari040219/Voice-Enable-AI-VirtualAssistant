import React, { useContext, useState } from 'react'
import bg from "../assets/authBg.png"
import { IoEye } from "react-icons/io5";
import { IoEyeOff } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { userDataContext } from '../context/UserContext';
import axios from "axios"
function SignIn() {
  const [showPassword,setShowPassword]=useState(false)
  const {serverUrl,userData,setUserData}=useContext(userDataContext)
  const navigate=useNavigate()
  const [email,setEmail]=useState("")
  const [loading,setLoading]=useState(false)
    const [password,setPassword]=useState("")
const [err,setErr]=useState("")
  const handleSignIn=async (e)=>{
    e.preventDefault()
    setErr("")
    setLoading(true)
try {
  let result=await axios.post(`${serverUrl}/api/auth/signin`,{
   email,password
  },{withCredentials:true} )
 setUserData(result.data)
  setLoading(false)
   navigate("/")
} catch (error) {
  console.log(error)
  setUserData(null)
  setLoading(false)
  setErr(error.response.data.message)
}
    }
  return (
    <div 
  className="w-full h-[100vh] bg-gradient-to-br from-gray-900 via-black to-gray-800 flex justify-center items-center" 
  style={{ backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundBlendMode: "overlay" }}
>
  <form 
    className="w-[90%] h-[600px] max-w-[500px] bg-[#0d0d0dcc] backdrop-blur-lg shadow-2xl shadow-black/70 flex flex-col items-center justify-center gap-[20px] px-[20px] rounded-2xl border border-gray-700" 
    onSubmit={handleSignIn}
  >
    <h1 className="text-white text-[32px] font-bold mb-[30px] tracking-wide">
      Sign In to <span className="text-blue-400 drop-shadow-md">Virtual Assistant</span>
    </h1>

    <input 
      type="email" 
      placeholder="Email" 
      className="w-full h-[55px] outline-none border border-gray-500 bg-[#1a1a1a] text-white placeholder-gray-400 px-[20px] rounded-xl text-[17px] focus:ring-2 focus:ring-blue-400 transition-all duration-300" 
      required 
      onChange={(e)=>setEmail(e.target.value)} 
      value={email}
    />

    <div className="w-full h-[55px] border border-gray-500 bg-[#1a1a1a] text-white rounded-xl text-[17px] relative flex items-center px-[15px]">
      <input 
        type={showPassword ? "text" : "password"} 
        placeholder="Password" 
        className="w-full h-full outline-none bg-transparent placeholder-gray-400 pr-[50px]" 
        required 
        onChange={(e)=>setPassword(e.target.value)} 
        value={password}
      />
      {!showPassword && (
        <IoEye 
          className="absolute right-[15px] w-[24px] h-[24px] text-gray-300 hover:text-white cursor-pointer transition" 
          onClick={()=>setShowPassword(true)}
        />
      )}
      {showPassword && (
        <IoEyeOff 
          className="absolute right-[15px] w-[24px] h-[24px] text-gray-300 hover:text-white cursor-pointer transition" 
          onClick={()=>setShowPassword(false)}
        />
      )}
    </div>

    {err.length > 0 && (
      <p className="text-red-400 text-[15px] mt-[-10px]">*{err}</p>
    )}

    <button 
      className="min-w-[150px] h-[55px] mt-[25px] text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-600 hover:to-blue-600 rounded-xl text-[18px] shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50" 
      disabled={loading}
    >
      {loading ? "Loading..." : "Sign In"}
    </button>

    <p 
      className="text-gray-300 text-[16px] cursor-pointer mt-[15px] hover:text-blue-400 transition"
      onClick={()=>navigate("/signup")}
    >
      Want to create a new account? <span className="text-blue-400 font-medium">Sign Up</span>
    </p>
  </form>
</div>

  )
}

export default SignIn
