#!/usr/bin/env node

/**
 * TCP Proxy for Supabase PostgreSQL
 * Forwards connections from localhost:5432 to Supabase IPv6 address
 * Allows Docker on Windows to connect to Supabase database
 */

const net = require('net');

const LOCAL_PORT = 54320;
const REMOTE_HOST = 'db.bkxtfznmmnsjllogwazf.supabase.co';
const REMOTE_PORT = 5432;

const server = net.createServer((clientSocket) => {
  console.log(`[${new Date().toISOString()}] Client connected`);

  const serverSocket = net.createConnection({
    host: REMOTE_HOST,
    port: REMOTE_PORT,
    family: 0, // Let Node.js choose (will prefer IPv6 if available, fallback to IPv4)
    timeout: 30000, // 30 second timeout
  });

  serverSocket.on('connect', () => {
    console.log(`[${new Date().toISOString()}] Connected to Supabase database`);
    // Disable Nagle's algorithm for lower latency
    serverSocket.setNoDelay(true);
    clientSocket.setNoDelay(true);
  });

  serverSocket.on('timeout', () => {
    console.error(`[${new Date().toISOString()}] Server socket timeout`);
    serverSocket.destroy();
    clientSocket.end();
  });

  serverSocket.on('error', (err) => {
    console.error(`[${new Date().toISOString()}] Server socket error:`, err.message);
    if (!clientSocket.destroyed) {
      clientSocket.end();
    }
  });

  clientSocket.on('error', (err) => {
    console.error(`[${new Date().toISOString()}] Client socket error:`, err.message);
    if (!serverSocket.destroyed) {
      serverSocket.end();
    }
  });

  // Pipe data bidirectionally
  clientSocket.pipe(serverSocket);
  serverSocket.pipe(clientSocket);

  clientSocket.on('end', () => {
    console.log(`[${new Date().toISOString()}] Client disconnected`);
    if (!serverSocket.destroyed) {
      serverSocket.end();
    }
  });

  serverSocket.on('end', () => {
    if (!clientSocket.destroyed) {
      clientSocket.end();
    }
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${LOCAL_PORT} is already in use. Please stop any other service using this port.`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});

server.listen(LOCAL_PORT, '0.0.0.0', () => {
  console.log(`TCP Proxy listening on 0.0.0.0:${LOCAL_PORT}`);
  console.log(`Forwarding to ${REMOTE_HOST}:${REMOTE_PORT} (IPv6)`);
  console.log('Docker containers can connect to: host.docker.internal:54320');
  console.log('Press Ctrl+C to stop');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down proxy...');
  server.close(() => {
    console.log('Proxy stopped');
    process.exit(0);
  });
});
