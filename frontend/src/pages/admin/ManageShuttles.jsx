import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  FormControlLabel,
  Tooltip,
  Snackbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DirectionsBus as BusIcon,
  People as PeopleIcon,
  LocationOn as LocationIcon,
  Route as RouteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from "axios";
import { API_BASE_URL } from "../../constants";

const ManageShuttles = () => {
  // State management
  const [shuttles, setShuttles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedShuttle, setSelectedShuttle] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form state
  const [formData, setFormData] = useState({
    shuttleNumber: '',
    capacity: '',
    currentRoute: '',
    active: true,
    currentLocation: ''
  });

  // Fetch shuttles from API
  const fetchShuttles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/shuttle`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShuttles(response.data.shuttles || []);
      setLoading(false);
    } catch (error) {
      showSnackbar('Error fetching shuttles', 'error');
      setLoading(false);
    }
  };

  // Fetch routes from API
  const fetchRoutes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/route`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoutes(response.data.routes || []);
    } catch (error) {
      showSnackbar('Error fetching routes', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAddShuttle = () => {
    setEditMode(false);
    setFormData({
      shuttleNumber: '',
      capacity: '',
      currentRoute: '',
      active: true,
      currentLocation: ''
    });
    setDialogOpen(true);
  };

  const handleEditShuttle = (shuttle) => {
    setEditMode(true);
    setSelectedShuttle(shuttle);
    setFormData({
      shuttleNumber: shuttle.shuttleNumber,
      capacity: shuttle.capacity.toString(),
      currentRoute: shuttle.currentRoute?._id || '',
      active: shuttle.active,
      currentLocation: shuttle.currentLocation || ''
    });
    setDialogOpen(true);
  };

  const handleDeleteShuttle = (shuttle) => {
    setSelectedShuttle(shuttle);
    setDeleteDialogOpen(true);
  };

  // Add or update shuttle
  const handleSubmit = async () => {
    try {
      if (!formData.shuttleNumber || !formData.capacity) {
        showSnackbar('Please fill in all required fields', 'error');
        return;
      }
      const token = localStorage.getItem("token");
      if (editMode) {
        // Update shuttle
        await axios.put(
          `${API_BASE_URL}/shuttle/${selectedShuttle._id}`,
          {
            shuttleNumber: formData.shuttleNumber,
            capacity: parseInt(formData.capacity),
            currentRoute: formData.currentRoute || null,
            active: formData.active,
            currentLocation: formData.currentLocation,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showSnackbar('Shuttle updated successfully');
      } else {
        // Add new shuttle
        await axios.post(
          `${API_BASE_URL}/shuttle`,
          {
            shuttleNumber: formData.shuttleNumber,
            capacity: parseInt(formData.capacity),
            currentRoute: formData.currentRoute || null,
            active: formData.active,
            currentLocation: formData.currentLocation,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showSnackbar('Shuttle added successfully');
      }
      setDialogOpen(false);
      fetchShuttles();
    } catch (error) {
      showSnackbar('Error saving shuttle', 'error');
    }
  };

  // Delete shuttle
  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/shuttle/${selectedShuttle._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteDialogOpen(false);
      showSnackbar('Shuttle deleted successfully');
      fetchShuttles();
    } catch (error) {
      showSnackbar('Error deleting shuttle', 'error');
    }
  };

  // Toggle shuttle status
  const toggleShuttleStatus = async (shuttleId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_BASE_URL}/shuttle/${shuttleId}/status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showSnackbar('Shuttle status updated');
      fetchShuttles();
    } catch (error) {
      showSnackbar('Error updating shuttle status', 'error');
    }
  };

  const getOccupancyColor = (occupancy, capacity) => {
    const percentage = (occupancy / capacity) * 100;
    if (percentage >= 90) return 'error';
    if (percentage >= 70) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Manage Shuttles 
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchShuttles}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddShuttle}
          >
            Add Shuttle
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <BusIcon color="primary" fontSize="large" />
                <Box>
                  <Typography variant="h6">{shuttles.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Shuttles
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <BusIcon color="success" fontSize="large" />
                <Box>
                  <Typography variant="h6">
                    {shuttles.filter(s => s.active).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Shuttles
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <PeopleIcon color="primary" fontSize="large" />
                <Box>
                  <Typography variant="h6">
                    {shuttles.reduce((sum, s) => sum + s.capacity, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Capacity
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <PeopleIcon color="warning" fontSize="large" />
                <Box>
                  <Typography variant="h6">
                    {shuttles.reduce((sum, s) => sum + s.occupancy, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Current Occupancy
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Shuttles Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Shuttle Number</TableCell>
                  <TableCell>Capacity</TableCell>
                  <TableCell>Current Route</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Occupancy</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shuttles.map((shuttle) => (
                  <TableRow key={shuttle._id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <BusIcon color="primary" />
                        <Typography fontWeight="medium">
                          {shuttle.shuttleNumber}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{shuttle.capacity}</TableCell>
                    <TableCell>
                      {shuttle.currentRoute ? (
                        <Chip
                          icon={<RouteIcon />}
                          label={shuttle.currentRoute.name}
                          variant="outlined"
                          size="small"
                        />
                      ) : (
                        <Typography color="text.secondary">No route</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationIcon fontSize="small" color="action" />
                        {shuttle.currentLocation || 'Unknown'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${shuttle.occupancy}/${shuttle.capacity}`}
                        color={getOccupancyColor(shuttle.occupancy, shuttle.capacity)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={shuttle.active}
                            onChange={() => toggleShuttleStatus(shuttle._id)}
                          />
                        }
                        label={shuttle.active ? 'Active' : 'Inactive'}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => handleEditShuttle(shuttle)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => handleDeleteShuttle(shuttle)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editMode ? 'Edit Shuttle' : 'Add New Shuttle'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} mt={2}>
            <TextField
              label="Shuttle Number"
              value={formData.shuttleNumber}
              onChange={(e) => setFormData({ ...formData, shuttleNumber: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              required
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Current Route</InputLabel>
              <Select
                value={formData.currentRoute}
                onChange={(e) => setFormData({ ...formData, currentRoute: e.target.value })}
                label="Current Route"
              >
                <MenuItem value="">
                  <em>No route assigned</em>
                </MenuItem>
                {routes.map((route) => (
                  <MenuItem key={route._id} value={route._id}>
                    {route.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Current Location"
              value={formData.currentLocation}
              onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? 'Update' : 'Add'} Shuttle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete shuttle {selectedShuttle?.shuttleNumber}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageShuttles;