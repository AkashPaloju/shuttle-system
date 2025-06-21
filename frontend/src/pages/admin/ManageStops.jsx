import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  Fab,
  Snackbar,
  CircularProgress,
  Paper,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon
} from "@mui/icons-material";
import axios from "axios";
import { API_BASE_URL } from "../../constants";

const ManageStops = () => {
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // "add" or "edit"
  const [selectedStop, setSelectedStop] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    location: { lat: "", lng: "" },
    campusZone: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch all stops
  const fetchStops = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/stop/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStops(response.data.stops || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to fetch stops");
      setStops([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStops();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "lat" || name === "lng") {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = "Stop name is required";
    }
    
    if (!formData.location.lat || isNaN(formData.location.lat)) {
      errors.lat = "Valid latitude is required";
    }
    
    if (!formData.location.lng || isNaN(formData.location.lng)) {
      errors.lng = "Valid longitude is required";
    }
    
    if (!formData.campusZone.trim()) {
      errors.campusZone = "Campus zone is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle add stop
  const handleAddStop = () => {
    setDialogMode("add");
    setSelectedStop(null);
    setFormData({
      name: "",
      location: { lat: "", lng: "" },
      campusZone: ""
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  // Handle edit stop
  const handleEditStop = (stop) => {
    setDialogMode("edit");
    setSelectedStop(stop);
    setFormData({
      name: stop.name,
      location: {
        lat: stop.location.lat.toString(),
        lng: stop.location.lng.toString()
      },
      campusZone: stop.campusZone
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  // Handle dialog submit
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const submitData = {
        name: formData.name.trim(),
        location: {
          lat: parseFloat(formData.location.lat),
          lng: parseFloat(formData.location.lng)
        },
        campusZone: formData.campusZone.trim()
      };

      if (dialogMode === "add") {
        await axios.post(`${API_BASE_URL}/stop/`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess("Stop created successfully!");
      } else {
        await axios.put(`${API_BASE_URL}/stop/${selectedStop._id}`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess("Stop updated successfully!");
      }

      setOpenDialog(false);
      fetchStops();
    } catch (err) {
      setError(err.response?.data?.msg || `Failed to ${dialogMode} stop`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete stop
  const handleDeleteStop = async (stopId, stopName) => {
    if (!window.confirm(`Are you sure you want to delete "${stopName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/stop/${stopId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Stop deleted successfully!");
      fetchStops();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to delete stop");
    }
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormErrors({});
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setError("");
    setSuccess("");
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Manage Stops
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Add, edit, and manage bus stops for your university
        </Typography>
      </Box>

      {/* Stops List */}
      {stops.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No stops found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Get started by adding your first bus stop
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddStop}>
            Add First Stop
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {stops.map((stop) => (
            <Grid item xs={12} md={6} lg={4} key={stop._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {stop.name}
                    </Typography>
                    <Box>
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditStop(stop)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteStop(stop._id, stop.name)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label={stop.campusZone} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    <LocationIcon sx={{ fontSize: 16, mr: 1 }} />
                    <Typography variant="body2">
                      {stop.location.lat.toFixed(6)}, {stop.location.lng.toFixed(6)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={handleAddStop}
      >
        <AddIcon />
      </Fab>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === "add" ? "Add New Stop" : "Edit Stop"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              name="name"
              label="Stop Name"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              error={!!formErrors.name}
              helperText={formErrors.name}
              disabled={submitting}
            />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  name="lat"
                  label="Latitude"
                  type="number"
                  value={formData.location.lat}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  error={!!formErrors.lat}
                  helperText={formErrors.lat}
                  disabled={submitting}
                  inputProps={{ step: "any" }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="lng"
                  label="Longitude"
                  type="number"
                  value={formData.location.lng}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  error={!!formErrors.lng}
                  helperText={formErrors.lng}
                  disabled={submitting}
                  inputProps={{ step: "any" }}
                />
              </Grid>
            </Grid>
            
            <TextField
              name="campusZone"
              label="Campus Zone"
              value={formData.campusZone}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              error={!!formErrors.campusZone}
              helperText={formErrors.campusZone}
              disabled={submitting}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : null}
          >
            {submitting ? "Saving..." : dialogMode === "add" ? "Add Stop" : "Update Stop"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbars */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ManageStops;