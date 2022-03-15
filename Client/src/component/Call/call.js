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
	}, [])

	const callUser = (id) => {
            setInitiator(true);
            const peer = new Peer({
                initiator: true,
                trickle: false,
                stream: stream
            })
            peer.on("signal", (data) => {//send caller data to call receiver
                socket.emit("callUser", {
                    userToCall: id,
                    signalData: data,
                    from: me,
                    name: name
                })
            })
            peer.on("stream", (stream) => {//stream my stream
                
                userVideo.current.srcObject = stream
                
            })
            socket.on("callAccepted", (signal) => {//accept signal
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
		peer.on("signal", (data) => {//send data to caller
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
            <h1 className = "heading" > Your ID is  {me}</h1>
            <div className = 'joinOuterContainer'>
                <div className = 'joinInnerContainer'> 
                                <div className = 'video'>
                                    {stream &&<video ref={myVideo} autoPlay muted width = '400px' height = '400px'/>}

                                </div>

                        <div className = 'myId'>
                            <input className = 'joinInput mt-20' type = "text" placeholder = "ID to Call" onchange = {(e) => setIdToCall(e.target.value)}/>
                            <div className="call-button">
                            {callAccepted && !callEnded ? (
                                <button className = 'button-end mt-20' onClick={leaveCall}>
                                    End Call
                                </button>
                                ) : (
                                <button className = 'button mt-20' onClick={() => callUser(idToCall)}>
                                    Start Call
                                </button>
                            )}
                            {idToCall}
                            </div>
                        </div>

                </div>
                <div className = 'joinInnerContainer'>
                    {receivingCall && !callAccepted && !initiator ? (
                        <div>
                            <h1>incoming call</h1>
                            <button className = 'button-answer mt-20' onClick={answerCall}>
                                Answer
                            </button>
                        </div>
                    ) : null}
                        {callAccepted && !callEnded ?
                        <video playsInline ref={userVideo} autoPlay width = '400px' height = '400px' />
                        :null}
                    </div>
            </div>
        </div>
	);
}
