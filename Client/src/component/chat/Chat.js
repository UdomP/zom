import React, { useState, useEffect } from 'react'
import './Chat.css'
import ScrollToBottom from 'react-scroll-to-bottom'

export default function Chat({socket, name, channel}) {
        const [currentMessage, setCurrentMessage] = useState('');
        const [messageList, setMessageList] = useState([]);

        const sendMessage = async () => {
            if(currentMessage !== ''){
                const messageData = {
                    channel: channel,
                    name: name,
                    message: currentMessage,
                    time: new Date(Date.now()).getHours() 
                    + ':' + 
                    new Date(Date.now()).getMinutes(),
                }
                await socket.emit('send_message', messageData);
                setMessageList((list) => [...list, messageData]);
                setCurrentMessage('');
            }
        };

        useEffect(() => {
            socket.on('receive_message', (data) => {//backend to front end
                setMessageList((list) => [...list, data]);
            });
        }, [socket]);

    return (
        <div className="chat-window center ">
            <div className = "chat-header">
                <p>Channel    {channel}</p>
            </div>

            <div className = "chat-body">
                <ScrollToBottom className = 'message-container'>
                    {messageList.map((messageContent) => {
                        return (
                            <div className = "message" id = {name === messageContent.name ? "you" : "other"}>
                                <div>
                                    <div className = "message-content">
                                        <p>{messageContent.message}</p>
                                    </div>
                                    <div className = "message-meta">
                                        <p id= 'name'> {messageContent.name}</p>
                                        <p id= 'time'>{messageContent.time}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </ScrollToBottom>
            </div>

            <div className = "chat-footer">
                <input type = "text" value = {currentMessage} placeholder = "Text" onChange = {(event) => {setCurrentMessage(event.target.value)}} onKeyPress = {(event) => {event.key === "Enter" && sendMessage()}}/>
                <button onClick = {sendMessage} >Send</button>
            </div>
        </div>
    );
}
