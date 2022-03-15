import React, { useState, useRef, useEffect } from 'react';
import './Groupcall.css'
import Peer from 'simple-peer'

export default function Roomcall({socket, name, channel}) {
	const myVideo = useRef();
	const userVideo = useRef();
	const connectionRef= useRef();
	//const video = useRef();

    const myPeer = new Peer()
	const videoGrid = document.getElementById('video-grid') // Find the Video-Grid element

	useEffect(() => {
		navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
			myVideo.current.srcObject = stream

			myPeer.on('call', call => { // When we join someone's room we will receive a call from them
				call.answer(stream) // Stream them our video/audio
				const video = document.createElement('video') // Create a video tag for them
				call.on('stream', userVideoStream => { // When we recieve their stream
					addVideoStream(video, userVideoStream) // Display their video to ourselves
				})
			})

			socket.on('user-connected', userId => { // If a new user connect
				connectToNewUser(userId, stream) 
			})
		})



	}, [])

	const leaveCall = () => {
		connectionRef.current.destroy()
	}

	const addVideoStream = (video, stream) => {
		video.srcObject = stream 
		video.addEventListener('loadedmetadata', () => { // Play the video as it loads
			video.play()
		})
		videoGrid.append(video) // Append video element to videoGrid
	}

	const connectToNewUser = (userId, stream) => { // This runs when someone joins our room
		const call = myPeer.call(userId, stream) // Call the user who just joined
		// Add their video
		const video = document.createElement('video') 
		call.on('stream', userVideoStream => {
			addVideoStream(video, userVideoStream)
		})
		// If they leave, remove their video
		call.on('close', () => {
			video.remove()
		})
	}

	return (
		<div className="call">
			<video ref={myVideo} autoPlay muted width = '500px' height = '500'/>
            <video ref={userVideo} autoPlay muted width = '500px' height = '500'/>
		</div>
	);
}
