import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import { useSocket } from "../context/SocketProvider";
import peer from "../service/Peer";

const Room = () => {
  const socket = useSocket();
  const [remoteSocketID, setRemoteSocketID] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`User Joined ${email} id ${id}`);
    setRemoteSocketID(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketID, offer });
    setMyStream(stream);
    console.log(myStream);
  }, [remoteSocketID, socket]);

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketID(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(myStream);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log(myStream, "===========================");
      debugger;
      for (const track of myStream?.getTracks()) {
        peer.peer.addTrack(track, myStream);
      }
    },
    [myStream]
  );

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
    };
  }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted]);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream);
    });
  });

  return (
    <div>
      <h1>Room Page</h1>
      <h4>{remoteSocketID ? "Connected" : "You are alone :'( "}</h4>
      {remoteSocketID && <button onClick={handleCallUser}>Call</button>}
      {myStream && (
        <>
          <h5>Your Stream</h5>
          <ReactPlayer
            playing
            muted
            height="100px"
            width="150px"
            url={myStream}
          />
        </>
      )}
      {remoteStream && (
        <>
          <h5>Remote Stream</h5>
          <ReactPlayer
            playing
            muted
            height="100px"
            width="150px"
            url={remoteStream}
          />
        </>
      )}
    </div>
  );
};

export default Room;
