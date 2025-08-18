import React, { useContext, useEffect, useRef, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import aiImg from "../assets/ai.gif"
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";
import userImg from "../assets/user.gif"
function Home() {
  const {userData,serverUrl,setUserData,getGeminiResponse}=useContext(userDataContext)
  const navigate=useNavigate()
  const [listening,setListening]=useState(false)
  const [userText,setUserText]=useState("")
  const [aiText,setAiText]=useState("")
  const isSpeakingRef=useRef(false)
  const recognitionRef=useRef(null)
  const [ham,setHam]=useState(false)
  const isRecognizingRef=useRef(false)
  const synth=window.speechSynthesis

  const handleLogOut=async ()=>{
    try {
      const result=await axios.get(`${serverUrl}/api/auth/logout`,{withCredentials:true})
      setUserData(null)
      navigate("/signin")
    } catch (error) {
      setUserData(null)
      console.log(error)
    }
  }

  const startRecognition = () => {
    
   if (!isSpeakingRef.current && !isRecognizingRef.current) {
    try {
      recognitionRef.current?.start();
      console.log("Recognition requested to start");
    } catch (error) {
      if (error.name !== "InvalidStateError") {
        console.error("Start error:", error);
      }
    }
  }
    
  }

  const speak=(text)=>{
    const utterence=new SpeechSynthesisUtterance(text)
    utterence.lang = 'ka-IN';
    const voices =window.speechSynthesis.getVoices()
    const kannadaVoice = voices.find(v => v.lang === 'ka-IN');
    if (kannadaVoice) {
      utterence.voice = kannadaVoice;
    }


    isSpeakingRef.current=true
    utterence.onend=()=>{
        setAiText("");
  isSpeakingRef.current = false;
  setTimeout(() => {
    startRecognition(); 
  }, 800);
    }
   synth.cancel(); 
synth.speak(utterence);
  }

  const handleCommand=(data)=>{
    const {type,userInput,response}=data
      speak(response);
    
    if (type === 'google-search') {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
    }
     if (type === 'calculator-open') {
  
      window.open(`https://www.google.com/search?q=calculator`, '_blank');
    }
     if (type === "instagram-open") {
      window.open(`https://www.instagram.com/`, '_blank');
    }
    if (type ==="facebook-open") {
      window.open(`https://www.facebook.com/`, '_blank');
    }
     if (type ==="weather-show") {
      window.open(`https://www.google.com/search?q=weather`, '_blank');
    }

    if (type === 'youtube-search' || type === 'youtube-play') {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
    }

if (type === 'spotify-play') {
  const query = encodeURIComponent(userInput);
  window.open(`https://open.spotify.com/search/${query}`, '_blank');
}


  }

useEffect(() => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  recognitionRef.current = recognition;

  let isMounted = true;  // flag to avoid setState on unmounted component

  // Start recognition after 1 second delay only if component still mounted
  const startTimeout = setTimeout(() => {
    if (isMounted && !isSpeakingRef.current && !isRecognizingRef.current) {
      try {
        recognition.start();
        console.log("Recognition requested to start");
      } catch (e) {
        if (e.name !== "InvalidStateError") {
          console.error(e);
        }
      }
    }
  }, 1000);

  recognition.onstart = () => {
    isRecognizingRef.current = true;
    setListening(true);
  };

  recognition.onend = () => {
    isRecognizingRef.current = false;
    setListening(false);
    if (isMounted && !isSpeakingRef.current) {
      setTimeout(() => {
        if (isMounted) {
          try {
            recognition.start();
            console.log("Recognition restarted");
          } catch (e) {
            if (e.name !== "InvalidStateError") console.error(e);
          }
        }
      }, 1000);
    }
  };

  recognition.onerror = (event) => {
    console.warn("Recognition error:", event.error);
    isRecognizingRef.current = false;
    setListening(false);
    if (event.error !== "aborted" && isMounted && !isSpeakingRef.current) {
      setTimeout(() => {
        if (isMounted) {
          try {
            recognition.start();
            console.log("Recognition restarted after error");
          } catch (e) {
            if (e.name !== "InvalidStateError") console.error(e);
          }
        }
      }, 1000);
    }
  };

  recognition.onresult = async (e) => {
    const transcript = e.results[e.results.length - 1][0].transcript.trim();
    if (transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
      setAiText("");
      setUserText(transcript);
      recognition.stop();
      isRecognizingRef.current = false;
      setListening(false);
      const data = await getGeminiResponse(transcript);
      handleCommand(data);
      setAiText(data.response);
      setUserText("");
    }
  };


    const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name}, what can I help you with?`);
    greeting.lang = 'hi-IN';
   
    window.speechSynthesis.speak(greeting);
 

  return () => {
    isMounted = false;
    clearTimeout(startTimeout);
    recognition.stop();
    setListening(false);
    isRecognizingRef.current = false;
  };
}, []);




  return (
   <div className='w-full h-[100vh] bg-gradient-to-br from-[DC2525] via-[#111133] to-[#1a0033] flex justify-center items-center flex-col gap-[15px] overflow-hidden relative'>
  <CgMenuRight 
    className='lg:hidden text-white absolute top-[20px] right-[20px] w-[28px] h-[28px] cursor-pointer hover:text-blue-400 transition' 
    onClick={()=>setHam(true)}
  />

  <div 
    className={`absolute lg:hidden top-0 w-full h-full bg-[#0d0d0dcc] backdrop-blur-xl p-[25px] flex flex-col gap-[25px] items-start ${ham?"translate-x-0":"translate-x-full"} transition-transform duration-500 ease-in-out`}
  >
    <RxCross1 
      className='text-white absolute top-[20px] right-[20px] w-[26px] h-[26px] cursor-pointer hover:text-red-400 transition' 
      onClick={()=>setHam(false)}
    />
    
    <button 
      className='min-w-[150px] h-[55px] text-white font-semibold bg-gradient-to-r from-red-500 to-pink-500 hover:from-pink-600 hover:to-red-600 rounded-xl cursor-pointer text-[18px] shadow-md hover:shadow-lg transition' 
      onClick={handleLogOut}
    >
      Log Out
    </button>
    
    <button 
      className='min-w-[150px] h-[55px] text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-600 hover:to-blue-600 rounded-xl cursor-pointer text-[18px] px-[20px] py-[10px] shadow-md hover:shadow-lg transition' 
      onClick={()=>navigate("/customize")}
    >
      Customize your Assistant
    </button>

    <div className='w-full h-[2px] bg-gray-500/50'></div>
    <h1 className='text-white font-semibold text-[20px]'>History</h1>

    <div className='w-full h-[400px] gap-[15px] overflow-y-auto flex flex-col scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent'>
      {userData.history?.map((his)=>(
        <div className='text-gray-300 text-[17px] w-full h-[30px] hover:text-white transition truncate'>{his}</div>
      ))}
    </div>
  </div>

  <button 
    className='min-w-[150px] h-[55px] absolute hidden lg:block top-[20px] right-[20px] text-white font-semibold bg-gradient-to-r from-red-500 to-pink-500 hover:from-pink-600 hover:to-red-600 rounded-xl cursor-pointer text-[18px] shadow-md hover:shadow-lg transition' 
    onClick={handleLogOut}
  >
    Log Out
  </button>
  
  <button 
    className='min-w-[150px] h-[55px] absolute hidden lg:block top-[100px] right-[20px] text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-600 hover:to-blue-600 rounded-xl cursor-pointer text-[18px] px-[20px] py-[10px] shadow-md hover:shadow-lg transition' 
    onClick={()=>navigate("/customize")}
  >
    Customize your Assistant
  </button>

  <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-3xl shadow-2xl border border-gray-700/50'>
    <img src={userData?.assistantImage} alt="" className='h-full object-cover'/>
  </div>

  <h1 className='text-white text-[19px] font-semibold mt-[10px]'>I'm {userData?.assistantName}</h1>

  {!aiText && <img src={userImg} alt="" className='w-[180px] mt-[10px]'/>}
  {aiText && <img src={aiImg} alt="" className='w-[180px] mt-[10px]'/>}

  <h1 className='text-white text-[17px] font-medium mt-[10px] text-center max-w-[90%] break-words leading-relaxed'>
    {userText ? userText : aiText ? aiText : null}
  </h1>
</div>

  )
}

export default Home