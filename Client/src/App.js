import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import io from 'socket.io-client';
import './app.css';
import Chat from './component/chat/Chat';
import Call from './component/Call/call';
import Groupcall from './component/Groupcall/Groupcall'



const socket = io.connect('http://localhost:5000')

function App(){
  
  const [name, setName] = useState('');
  const [channel, setChannel] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [registration, setRregistration] = useState(false);
  
  const hideRegistration = () => {
    if(channel !== '' && name !== ''){
      socket.emit('join_channel', channel);
      setRregistration(true);
    }
  };

  const joinChat = () => {
    if(channel !== '' && name !== ''){
      socket.emit('join_channel', (channel));
      setRregistration(true);
      setShowChat(true);
    }else
      alert('Enter room and channel');
  };

  const joinCall = () => {
      socket.emit('join_call', (channel));
      setRregistration(true);
      setShowChat(false);
  };

  return(
    <div>
      {!registration ? (
        <div className = 'app-outercontainer'>
          <div className = 'app-innercontainer'>
            <h3 className = "app-heading">Chat</h3>
              <input type = "text" placeholder = "Name" className = 'app-joinInput' onChange = {(event) => {
                setName(event.target.value);
              }}
              />      
              <input type = "text" placeholder = "Channel" className = 'app-joinInput app-mt-20' onChange = {(event) => {
                setChannel(event.target.value);
              }}
              />
              <button onClick = {joinChat} className = 'app-button app-mt-20'>Submit</button>
              <h3 className = "heading">Call</h3>
              <button onClick = {joinCall} className = 'app-button app-mt-20'>Call</button>
          </div>
        </div>
      ) : (
        <div>
          {showChat ? (<Chat socket = {socket} name = {name} channel = {channel}/>) : (<Call socket = {socket} name = {name} channel = {channel}/>)}
        </div>
      )}
    </div>
  );
}
export default App;
