const socket = io('/'); // require socket.io for the client side to emit events that will received by the server socket.io
const main__chat__window = document.getElementById('main__chat_window'); // Get the Div where are messages are going to be
const videoGrids = document.getElementById('video-grids'); // This div will contain other divs in which the video element and name will appear
const myVideo = document.createElement('video'); // This video element will show us our own video
const chat = document.getElementById('chat'); // Get our main right div
OtherUsername = ''; // It will hold our other user's name
chat.hidden = true; // Hide the chat window at first
myVideo.muted = true; // Sets The video's audeo to mute

window.onload = () => {
	// When Window load
	$(document).ready(function () {
		$('#getCodeModal').modal('show'); // Show our modal
	});
};

var peer = new Peer(undefined, {
	// Now with our peer server up an running, let's connect our cient peer js to ther server
	path: '/peerjs',
	host: '/',
	port: '3030',
});

let myVideoStream;
const peers = {};
var getUserMedia =
	navigator.getUserMedia ||
	navigator.webkitGetUserMedia ||
	navigator.mozGetUserMedia;

sendmessage = text => {
	if (event.key === 'Enter' && text.value != '') {
		// When enter is pressed and the type message box is not empty
		socket.emit('messagesend', myname + ' : ' + text.value); // Emit a send message event and pass chat message with userName
		text.value = ''; // Empty chat message box
		main__chat_window.scrollTop = main__chat_window.scrollHeight; // Scroll down
	}
};

navigator.mediaDevices // Webrtc provides a standard api for accessing cameras and microphones connected to the device
	.getUserMedia({
		video: true,
		audio: true,
	}) // It returns a promise here
	.then(stream => {
		// If permission is granted, it gives us the video and the audio track
		myVideoStream = stream;
		addVideoStream(myVideo, stream, myname); // This function add the div which contains the video and the name. Basically it add our video to the screen

		socket.on('user-connected', (id, username) => {
			// When server emits the "user-connected" event for all the cleints in the room
			//console.log("userid:" + id);
			connectToNewUser(id, stream, username); // We run this function and pass user's id, stream and user's name as arguments(Explnation At function)
			socket.emit('tellName', myname); // Emit a tellName emit to tell other clients thir name
		});

		socket.on('user-disconnected', id => {
			console.log(peers);
			if (peers[id]) peers[id].close();
		});
	});
peer.on('call', call => {
	// When We get a call
	getUserMedia(
		{ video: true, audio: true }, // Get our stream
		function (stream) {
			call.answer(stream); // Answer the call with our stream
			const video = document.createElement('video'); // Create a video element
			call.on('stream', function (remoteStream) {
				// Get other user's stream
				addVideoStream(video, remoteStream, OtherUsername); // And other user's stream to our window
			});
		},
		function (err) {
			console.log('Failed to get local stream', err);
		}
	);
});

peer.on('open', id => {
	// When ever user joins every user is given a unique id and its very imposrtant to know their id when communicating
	socket.emit('join-room', roomId, id, myname);
});

socket.on('createMessage', message => {
	// THis function appends a message to the chat area when we or ther user sends message
	var ul = document.getElementById('messageadd');
	var li = document.createElement('li');
	li.className = 'message';
	li.appendChild(document.createTextNode(message));
	ul.appendChild(li);
});

socket.on('AddName', username => {
	// Tell other user their name
	OtherUsername = username;
	console.log(username);
});

const RemoveUnusedDivs = () => {
	// This function is used to remove unused divs whenever if it is there
	//
	alldivs = videoGrids.getElementsByTagName('div'); // Get all divs in our video area
	for (var i = 0; i < alldivs.length; i++) {
		// loop through all the divs
		e = alldivs[i].getElementsByTagName('video').length; // Check if there is a video elemnt in each of the div
		if (e == 0) {
			// If no
			alldivs[i].remove; // remove
		}
	}
};

const connectToNewUser = (userId, streams, myname) => {
	const call = peer.call(userId, streams); // This will call the other user id with our own stream
	const video = document.createElement('video');
	call.on('stream', userVideoStream => {
		// When other user answers the call they send their steam to this user
		//       console.log(userVideoStream);
		addVideoStream(video, userVideoStream, myname); // And that stream
	});
	call.on('close', () => {
		// When call closses
		video.remove(); // Remove that video element
		RemoveUnusedDivs(); // Remove all unused divs
	});
	peers[userId] = call;
};

const cancel = () => {
	// Hide our invite modalwhen we click cancel
	$('#getCodeModal').modal('hide');
};

const copy = async () => {
	// copy our Invitation link when we press the copy button
	const roomid = document.getElementById('roomid').innerText;
	await navigator.clipboard.writeText('http://localhost:3030/join/' + roomid);
};
const invitebox = () => {
	// SHow our model when we click
	$('#getCodeModal').modal('show');
};

const muteUnmute = () => {
	// Mute Audio
	const enabled = myVideoStream.getAudioTracks()[0].enabled; // Audio tracks are those tracks whose kind property is audio. Chck if array in empty or not
	if (enabled) {
		// If not Mute
		myVideoStream.getAudioTracks()[0].enabled = false; // Mute
		document.getElementById('mic').style.color = 'red'; // Change color
	} else {
		document.getElementById('mic').style.color = 'white'; // Change color
		myVideoStream.getAudioTracks()[0].enabled = true; // UnMute
	}
};

const VideomuteUnmute = () => {
	const enabled = myVideoStream.getVideoTracks()[0].enabled;
	if (enabled) {
		// If Video on
		myVideoStream.getVideoTracks()[0].enabled = false; // Turn off
		document.getElementById('video').style.color = 'red'; // Change Color
	} else {
		document.getElementById('video').style.color = 'white'; // Change Color
		myVideoStream.getVideoTracks()[0].enabled = true; // Turn On
	}
};

const showchat = () => {
	// Show chat window or not
	if (chat.hidden == false) {
		chat.hidden = true; // Dont Show
	} else {
		chat.hidden = false; // SHow
	}
};

const addVideoStream = (videoEl, stream, name) => {
	videoEl.srcObject = stream; // Set the stream to the video element that we passed as arguments
	videoEl.addEventListener('loadedmetadata', () => {
		// When all the metadata has been loaded
		videoEl.play(); // Play the video
	});
	const h1 = document.createElement('h1'); // Create 1 h1 elemnt to display name
	const h1name = document.createTextNode(name); // Create a text node (text). Note: To display an proper h1 element with text, its important to create an h1 and a text node both
	h1.appendChild(h1name); // append text to h1 element
	const videoGrid = document.createElement('div'); // Create a div 'videoGrid' inside the "videoGridS" div
	videoGrid.classList.add('video-grid'); // add a class to videoGrid div
	videoGrid.appendChild(h1); // append the h1 to the div "videoGrid"
	videoGrids.appendChild(videoGrid); // append the name to the the div "videoGrid"
	videoGrid.append(videoEl); // append the video element to the the div "videoGrid"
	RemoveUnusedDivs(); // Remove all unsed divs
	let totalUsers = document.getElementsByTagName('video').length; // Get all video elemets
	if (totalUsers > 1) {
		// If more users than 1
		for (let index = 0; index < totalUsers; index++) {
			// loop through all videos
			document.getElementsByTagName('video')[index].style.width = // Set the width of each video to
				100 / totalUsers + '%'; // 👈👈
		}
	}
};
