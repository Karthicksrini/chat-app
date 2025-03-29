import { useState, useEffect } from "react";
import { TextField, Button, Paper, Typography, Box, Container } from "@mui/material";

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (joined) {
      const ws = new WebSocket("ws://localhost:8080");
      setSocket(ws);

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "join", username }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "chatHistory") {
          // Set past messages from Redis
          setMessages(data.messages);
        } else {
          // Append new message to chat
          setMessages((prev) => [...prev, data]);
        }

      };

      ws.onclose = () => {
        console.log("Disconnected from server");
      };

      return () => ws.close();
    }
  }, [joined]);

  useEffect(() => {
    const chatBox = document.getElementById("chat-box");
    if (chatBox) {
      chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: "smooth" });
    }
  }, [messages]); // Runs every time messages update


  const sendMessage = () => {
    if (socket && message.trim()) {
      socket.send(JSON.stringify({ type: "message", text: message, username }));
      setMessage("");
    }
  };

  const joinChat = () => {
    if (username.trim()) {
      setJoined(true);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      {!joined ? (
        <Paper elevation={3} sx={{ p: 4, width: "100%", textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>Join Chat</Typography>
          <TextField
            label="Enter your name"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button variant="contained" color="primary" fullWidth onClick={joinChat}>
            Join Now
          </Button>
        </Paper>
      ) : (
        <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
          <Typography variant="h5" gutterBottom textAlign="center">Chat Room</Typography>
          <Box id="chat-box"
            sx={{ height: 300, overflowY: "auto", p: 2, border: "1px solid #ccc", borderRadius: 2, mb: 2, backgroundColor: "#f9f9f9" }}>
            {messages.map((msg, index) => {
              return msg?.type === "user" ?
                <Box
                  key={index}
                  sx={{
                    p: 1,
                    mb: 1,
                    borderRadius: 2,
                    maxWidth: "75%",
                    textAlign: "center",
                    color: msg.action === "connect" ? "green" : "red",
                  }}
                >
                  <Typography variant="body1">{msg.message}</Typography>
                </Box> :
                <Box
                  key={index}
                  sx={{
                    p: 1,
                    mb: 1,
                    borderRadius: 2,
                    maxWidth: "75%",
                    ml: msg?.username === username ? "auto" : 0,
                    bgcolor: msg?.username === username ? "primary.main" : "grey.300",
                    color: msg?.username === username ? "white" : "black",
                  }}
                >
                  <Typography variant="body1">{msg?.text}</Typography>
                  <Typography variant="caption" color={msg?.username === username ? "white" : "textSecondary"}>
                    {msg?.username} - {msg?.timestamp ? new Date(msg?.timestamp).toLocaleTimeString() : "Invalid Date"}
                  </Typography>
                </Box>
            })}
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              variant="outlined"
              fullWidth
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button variant="contained" color="success" onClick={sendMessage}>
              Send
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default Chat;
