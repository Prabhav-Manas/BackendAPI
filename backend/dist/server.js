"use strict";
const http = require("http");
const port = 8000;
const server = http.createServer((req, res) => {
    res.end("From SERVER!");
});
server.listen(port, () => {
    console.log(`Server is running on ${port}`);
});
// msWC7W5uKsqSvy0V
// Manas
// mongodb+srv://Manas:msWC7W5uKsqSvy0V@raftlabstestcluster.leldz.mongodb.net/?retryWrites=true&w=majority&appName=RaftLabsTestCluster
