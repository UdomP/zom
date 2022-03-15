import React, { useState, useRef, useEffect } from 'react';
import './call.css'
import Peer from 'simple-peer'

export default function Roomcall({socket}) {
	const [ me, setMe ] = useState("");
	const [ stream, setStream ] = useState();
	const [ receivingCall, setReceivingCall ] = useState(false);
	const [ caller, setCaller ] = useState("");
	const [ callerSignal, setCallerSignal ] = useState();
	const [ callAccepted, setCallAccepted ] = useState(false);
	const [ idToCall, setIdToCall ] = useState("");
	const [ callEnded, setCallEnded] = useState(false);
	const [ name, setName ] = useState("");
    const [ initiator, setInitiator ] = useState(false);
	const myVideo = useRef();
	const userVideo = useRef();
	const connectionRef= useRef();
    const [ newuser, setnewuser ] = useState('')

	useEffect(() => {
		navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
			setStream(stream)
				myVideo.current.srcObject = stream
		})

        socket.on('me', async(id) => {
			setMe(id)
		})
        console.log(`${me}`)

		socket.on("callUser", (data) => {
			setReceivingCall(true)
			setCaller(data.from)
			setName(data.name)
			setCallerSignal(data.signal)
		})

        socket.on("new-user", async(id) => {
            setnewuser(id);
            callUser(id);
        })
        
	}, [])

    const newUser = () => {

    }

	const callUser = (id) => {
            setInitiator(true);
            const peer = new Peer({
                initiator: true,
                trickle: false,
                stream: stream
            })
            peer.on("signal", (data) => {
                socket.emit("callUser", {
                    userToCall: id,
                    signalData: data,
                    from: me,
                    name: name
                })
            })
            peer.on("stream", (stream) => {
                
                    userVideo.current.srcObject = stream
                
            })
            socket.on("callAccepted", (signal) => {
                setCallAccepted(true)
                peer.signal(signal)
            })

            connectionRef.current = peer
	}

    const getID = () => {
        socket.on('me', async(id) => {
			setMe(id)
		})
        console.log(`${me}`)
    }

	const answerCall =() =>  {
		setCallAccepted(true)
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream: stream
		})
		peer.on("signal", (data) => {
			socket.emit("answerCall", { signal: data, to: caller })
		})
		peer.on("stream", (stream) => {
			userVideo.current.srcObject = stream
		})

		peer.signal(callerSignal)
		connectionRef.current = peer
	}

	const leaveCall = () => {
		setCallEnded(true)
		connectionRef.current.destroy()
	}


	return (
        <div>
            <h1 className = "heading" > Your ID is  {me} {newuser}</h1>
            <div className = 'joinOuterContainer'>
                <div className = 'joinInnerContainer'> 
                        <div className = 'container'>
                            <div className = 'video-container'>
                                <div className = 'video'>
                                    {stream &&<video ref={myVideo} autoPlay muted width = '500px' height = '500'/>}
                                </div>
                                <div className = 'video'>
                                    {callAccepted && !callEnded ?
                                        <video playsInline ref={userVideo} autoPlay style={{ width: "300px"}} />
                                        :null}
                                </div>
                            </div>
                        </div>
                        <div className = 'myId'>
                            <input className = 'joinInput mt-20' type = "text" placeholder = "ID to Call" onchange = {(e) => setIdToCall(e.target.value)}/>
                            <div className="call-button">
                            {callAccepted && !callEnded ? (
                                <button className = 'button-end mt-20' onClick={leaveCall}>
                                    End Call
                                </button>
                                ) : (
                                <button className = 'button mt-20' onClick={() => newUser}>
                                    Start Call
                                </button>
                            )}
                            {idToCall}
                            </div>
                        </div>
                        <div>
                            {receivingCall && !callAccepted && !initiator ? (
                                    <div className="caller">
                                    <h1>incoming call</h1>
                                    <button className = 'button-answer mt-20' onClick={answerCall}>
                                        Answer
                                    </button>
                                </div>
                            ) : null}
                        </div>
                </div>
            </div>
        </div>
	);
}
