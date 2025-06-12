let ioInstance;

function setupSocketHandlers(io) {
  ioInstance = io;
  io.on('connection', (socket) => {
    // Join project room
    socket.on('joinProject', (projectId) => {
      socket.join(`project_${projectId}`);
    });
    // Leave project room
    socket.on('leaveProject', (projectId) => {
      socket.leave(`project_${projectId}`);
    });
    // Task events
    socket.on('task:create', (data) => {
      io.to(`project_${data.projectId}`).emit('task:created', data);
    });
    socket.on('task:update', (data) => {
      io.to(`project_${data.projectId}`).emit('task:updated', data);
    });
    socket.on('task:delete', (data) => {
      io.to(`project_${data.projectId}`).emit('task:deleted', data);
    });
    socket.on('task:move', (data) => {
      io.to(`project_${data.projectId}`).emit('task:moved', data);
    });
    // Comment events
    socket.on('comment:add', (data) => {
      io.to(`project_${data.projectId}`).emit('comment:added', data);
    });
    socket.on('comment:delete', (data) => {
      io.to(`project_${data.projectId}`).emit('comment:deleted', data);
    });
    // Attachment events
    socket.on('attachment:add', (data) => {
      io.to(`project_${data.projectId}`).emit('attachment:added', data);
    });
    socket.on('attachment:delete', (data) => {
      io.to(`project_${data.projectId}`).emit('attachment:deleted', data);
    });
    // Tag events
    socket.on('tag:add', (data) => {
      io.to(`project_${data.projectId}`).emit('tag:added', data);
    });
    socket.on('tag:delete', (data) => {
      io.to(`project_${data.projectId}`).emit('tag:deleted', data);
    });
  });
}

function emitToProject(projectId, event, data) {
  if (ioInstance) {
    ioInstance.to(`project_${projectId}`).emit(event, data);
  }
}

module.exports = { setupSocketHandlers, emitToProject }; 