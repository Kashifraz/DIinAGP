import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Stack,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  OutlinedInput,
  Checkbox,
  ListItemText,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { api, socket } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DatePicker } from '@mui/lab';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

interface Column {
  _id: string;
  name: string;
  order: number;
  color: string;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  assignees: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  column: string;
  order: number;
}

interface Project {
  _id: string;
  name: string;
  columns: Column[];
  members: Array<{
    user: {
      _id: string;
      firstName: string;
      lastName: string;
    };
  }>;
}

const KanbanPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskColumn, setNewTaskColumn] = useState<string>('');
  const { user } = useAuth();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskDialogMode, setTaskDialogMode] = useState<'create' | 'edit'>('create');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [taskDueDate, setTaskDueDate] = useState<Date | null>(null);
  const [taskAssignees, setTaskAssignees] = useState<string[]>([]);
  const [manageMembersOpen, setManageMembersOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState('');

  // Fetch project and tasks
  const fetchKanbanData = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError('');
    try {
      const projectRes = await api.get(`/projects/${projectId}`);
      const projectData = projectRes.data.data.project;
      setProject(projectData);
      setColumns([...projectData.columns].sort((a: Column, b: Column) => a.order - b.order));
      setNewTaskColumn(projectData.columns[0]?._id || '');
      const tasksRes = await api.get(`/tasks?projectId=${projectId}`);
      setTasks(tasksRes.data.data.tasks);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load Kanban data');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    fetchKanbanData();
    // Real-time updates
    socket.connect();
    socket.emit('join', { projectId });
    socket.on('task:moved', (data) => {
      if (data.projectId === projectId) {
        fetchKanbanData();
      }
    });
    return () => {
      socket.emit('leave', { projectId });
      socket.off('task:moved');
      socket.disconnect();
    };
  }, [fetchKanbanData, projectId]);

  if (!projectId) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Alert severity="error">Project ID is required. Please select a project from the dashboard.</Alert>
      </Box>
    );
  }

  // Drag and drop handler
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    const taskId = draggableId;
    const newColumnId = destination.droppableId;
    try {
      await api.post(`/tasks/${taskId}/move`, {
        column: newColumnId,
        order: destination.index,
      });
      // Emit real-time event
      socket.emit('task:move', { projectId, taskId, column: newColumnId, order: destination.index });
      fetchKanbanData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to move task');
    }
  };

  // Add new task
  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !newTaskColumn) return;
    try {
      await api.post('/tasks', {
        title: newTaskTitle,
        project: projectId,
        column: newTaskColumn,
      });
      setOpenTaskDialog(false);
      setNewTaskTitle('');
      fetchKanbanData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add task');
    }
  };

  const openCreateTaskDialog = (columnId: string) => {
    setTaskDialogMode('create');
    setEditingTask(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskPriority('medium');
    setTaskDueDate(null);
    setTaskAssignees([]);
    setNewTaskColumn(columnId);
    setOpenTaskDialog(true);
  };

  const openEditTaskDialog = (task: Task) => {
    setTaskDialogMode('edit');
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    setTaskPriority(task.priority);
    setTaskDueDate(task.dueDate ? new Date(task.dueDate) : null);
    setTaskAssignees(task.assignees.map(a => a._id));
    setNewTaskColumn(task.column);
    setOpenTaskDialog(true);
  };

  const handleTaskDialogSave = async () => {
    if (!taskTitle.trim() || !newTaskColumn) return;
    try {
      if (taskDialogMode === 'create') {
        await api.post('/tasks', {
          title: taskTitle,
          description: taskDescription,
          project: projectId,
          column: newTaskColumn,
          priority: taskPriority,
          dueDate: taskDueDate ? taskDueDate.toISOString() : undefined,
          assignees: taskAssignees,
        });
      } else if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, {
          title: taskTitle,
          description: taskDescription,
          priority: taskPriority,
          dueDate: taskDueDate ? taskDueDate.toISOString() : undefined,
          assignees: taskAssignees,
        });
      }
      setOpenTaskDialog(false);
      setEditingTask(null);
      setTaskTitle('');
      setTaskDescription('');
      setTaskPriority('medium');
      setTaskDueDate(null);
      setTaskAssignees([]);
      fetchKanbanData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save task');
    }
  };

  const fetchAllUsers = async () => {
    setMemberLoading(true);
    setMemberError('');
    try {
      const res = await api.get('/users');
      setAllUsers(res.data.data.users);
    } catch (err: any) {
      setMemberError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setMemberLoading(false);
    }
  };

  const openManageMembers = () => {
    setManageMembersOpen(true);
    fetchAllUsers();
  };

  const handleAddMembers = async () => {
    if (!projectId) return;
    setMemberLoading(true);
    setMemberError('');
    try {
      for (const userId of selectedMembers) {
        await api.post(`/projects/${projectId}/members`, { userId });
      }
      setManageMembersOpen(false);
      setSelectedMembers([]);
      fetchKanbanData();
    } catch (err: any) {
      setMemberError(err.response?.data?.message || 'Failed to add members');
    } finally {
      setMemberLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // Group tasks by column
  const tasksByColumn: { [columnId: string]: Task[] } = {};
  columns.forEach((col) => {
    tasksByColumn[col._id] = [];
  });
  tasks.forEach((task) => {
    if (tasksByColumn[task.column]) {
      tasksByColumn[task.column].push(task);
    }
  });
  // Sort tasks in each column by order
  Object.values(tasksByColumn).forEach((arr) => arr.sort((a, b) => a.order - b.order));

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4" component="h1">
          {project?.name} Kanban Board
        </Typography>
        <Box>
          <Tooltip title="Manage Members">
            <IconButton onClick={openManageMembers} sx={{ mr: 1 }}>
              <PersonAddIcon />
            </IconButton>
          </Tooltip>
          {user && user.role !== 'member' && (
            <Button variant="contained" onClick={() => setOpenTaskDialog(true)}>
              Add Task
            </Button>
          )}
        </Box>
      </Box>
      <DragDropContext onDragEnd={onDragEnd}>
        <Box display="flex" gap={2} overflow="auto">
          {columns.map((column) => (
            <Box key={column._id} minWidth={300}>
              <Paper sx={{ p: 2, mb: 2, background: column.color }}>
                <Typography variant="h6" color="#fff">
                  {column.name}
                </Typography>
              </Paper>
              <Droppable droppableId={column._id}>
                {(provided, snapshot) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    minHeight={100}
                    sx={{
                      background: snapshot.isDraggingOver ? '#e3f2fd' : '#f4f6fa',
                      borderRadius: 2,
                      p: 1,
                      minHeight: 200,
                    }}
                  >
                    {tasksByColumn[column._id]?.map((task, idx) => (
                      <Draggable key={task._id} draggableId={task._id} index={idx}>
                        {(provided, snapshot) => (
                          <Paper
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{
                              mb: 2,
                              p: 2,
                              background: snapshot.isDragging ? '#bbdefb' : '#fff',
                              boxShadow: snapshot.isDragging ? 6 : 1,
                              cursor: 'pointer',
                            }}
                            onClick={() => openEditTaskDialog(task)}
                          >
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                              {task.title}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                              <Chip size="small" label={task.priority} />
                              {task.dueDate && (
                                <Chip size="small" label={`Due: ${new Date(task.dueDate).toLocaleDateString()}`} />
                              )}
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                              {task.assignees.map((assignee) => (
                                <Avatar key={assignee._id} src={assignee.avatar} sx={{ width: 24, height: 24 }}>
                                  {assignee.firstName.charAt(0)}
                                </Avatar>
                              ))}
                            </Stack>
                          </Paper>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
              <Button variant="contained" size="small" onClick={() => openCreateTaskDialog(column._id)} sx={{ mb: 1 }}>
                Add Task
              </Button>
            </Box>
          ))}
        </Box>
      </DragDropContext>

      {/* Task Dialog for Create/Edit */}
      <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)}>
        <DialogTitle>{taskDialogMode === 'create' ? 'Add New Task' : 'Edit Task'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            fullWidth
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            minRows={2}
            maxRows={4}
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Priority</Typography>
            <Stack direction="row" spacing={1}>
              {(['low', 'medium', 'high', 'urgent'] as const).map((level) => (
                <Chip
                  key={level}
                  label={level}
                  color={taskPriority === level ? 'primary' : 'default'}
                  onClick={() => setTaskPriority(level)}
                  variant={taskPriority === level ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          </Box>
          <DatePicker
            label="Due Date"
            value={taskDueDate}
            onChange={(date: Date | null) => setTaskDueDate(date)}
            renderInput={(params: any) => <TextField {...params} fullWidth />}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="assignees-label">Assignees</InputLabel>
            <Select
              labelId="assignees-label"
              multiple
              value={taskAssignees}
              onChange={e => setTaskAssignees(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
              input={<OutlinedInput label="Assignees" />}
              renderValue={selected =>
                project?.members
                  .filter(m => selected.includes(m.user._id))
                  .map(m => m.user.firstName + ' ' + m.user.lastName)
                  .join(', ')
              }
            >
              {project?.members.map(m => (
                <MenuItem key={m.user._id} value={m.user._id}>
                  <Checkbox checked={taskAssignees.indexOf(m.user._id) > -1} />
                  <ListItemText primary={m.user.firstName + ' ' + m.user.lastName} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
          <Button onClick={handleTaskDialogSave} variant="contained" disabled={!taskTitle.trim()}>
            {taskDialogMode === 'create' ? 'Add' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Members Dialog */}
      <Dialog open={manageMembersOpen} onClose={() => setManageMembersOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Manage Project Members</DialogTitle>
        <DialogContent>
          {memberError && <Alert severity="error">{memberError}</Alert>}
          {memberLoading ? (
            <CircularProgress />
          ) : (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="members-select-label">Add Members</InputLabel>
              <Select
                labelId="members-select-label"
                multiple
                value={selectedMembers}
                onChange={e => setSelectedMembers(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                input={<OutlinedInput label="Add Members" />}
                renderValue={selected =>
                  allUsers
                    .filter(u => selected.includes(u._id))
                    .map(u => `${u.firstName} ${u.lastName}`)
                    .join(', ')
                }
              >
                {allUsers.map(u => (
                  <MenuItem key={u._id} value={u._id}>
                    <Checkbox checked={selectedMembers.indexOf(u._id) > -1} />
                    <ListItemText primary={`${u.firstName} ${u.lastName}`} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManageMembersOpen(false)}>Cancel</Button>
          <Button onClick={handleAddMembers} variant="contained" disabled={memberLoading || selectedMembers.length === 0}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KanbanPage; 