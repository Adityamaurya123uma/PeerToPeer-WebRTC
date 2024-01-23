import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import { useSocket } from "../context/SocketProvider";

const Room = () => {
  const socket = useSocket();
  const [remoteSocketID, setRemoteSocketID] = useState(null);
  const [myStream, setMyStream] = useState(null);

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`User Joined ${email} id ${id}`);
    setRemoteSocketID(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    return () => {
      socket.off("user:joined", handleUserJoined);
    };
  }, [socket, handleUserJoined]);

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
    </div>
  );
};

export default Room;
