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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText as MuiListItemText,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Route as RouteIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  ExpandMore as ExpandMoreIcon,
  Schedule as ScheduleIcon,
  TrendingUp as OptimizeIcon
} from "@mui/icons-material";
import axios from "axios";
import { API_BASE_URL } from "../../constants";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const OPTIMIZATION_OPTIONS = ["Peak Hour", "Class Schedule", "Demand", "Energy Efficient", "Cost Effective"];

const ManageRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [selectedRoute, setSelectedRoute] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    stops: [],
    timingSlots: [{ startTime: "", endTime: "", days: [] }],
    optimizedFor: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch all routes
  const fetchRoutes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/route/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoutes(response.data.routes || []);
    } catch (err) {
      if (err.response?.status !== 404) {
        setError(err.response?.data?.msg || "Failed to fetch routes");
      }
      setRoutes([]);
    }
  };

  // Fetch all stops
  const fetchStops = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/stop/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStops(response.data.stops || []);
    } catch (err) {
      console.error("Failed to fetch stops:", err);
      setStops([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchRoutes(), fetchStops()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Handle stops selection
  const handleStopsChange = (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      stops: typeof value === 'string' ? value.split(',') : value
    }));
  };

  // Handle optimization options
  const handleOptimizationChange = (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      optimizedFor: typeof value === 'string' ? value.split(',') : value
    }));
  };

  // Handle timing slot changes
  const handleTimingSlotChange = (index, field, value) => {
    const newTimingSlots = [...formData.timingSlots];
    newTimingSlots[index] = {
      ...newTimingSlots[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      timingSlots: newTimingSlots
    }));
  };

  // Add new timing slot
  const addTimingSlot = () => {
    setFormData(prev => ({
      ...prev,
      timingSlots: [...prev.timingSlots, { startTime: "", endTime: "", days: [] }]
    }));
  };

  // Remove timing slot
  const removeTimingSlot = (index) => {
    if (formData.timingSlots.length > 1) {
      const newTimingSlots = formData.timingSlots.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        timingSlots: newTimingSlots
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = "Route name is required";
    }
    
    if (formData.stops.length < 2) {
      errors.stops = "Please select at least 2 stops";
    }

    // Validate timing slots
    formData.timingSlots.forEach((slot, index) => {
      if (!slot.startTime) {
        errors[`timingSlot${index}StartTime`] = "Start time is required";
      }
      if (!slot.endTime) {
        errors[`timingSlot${index}EndTime`] = "End time is required";
      }
      if (slot.days.length === 0) {
        errors[`timingSlot${index}Days`] = "Please select at least one day";
      }
      if (slot.startTime && slot.endTime && slot.startTime >= slot.endTime) {
        errors[`timingSlot${index}Time`] = "End time must be after start time";
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle add route
  const handleAddRoute = () => {
    setDialogMode("add");
    setSelectedRoute(null);
    setFormData({
      name: "",
      stops: [],
      timingSlots: [{ startTime: "", endTime: "", days: [] }],
      optimizedFor: []
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  // Handle edit route
  const handleEditRoute = (route) => {
    setDialogMode("edit");
    setSelectedRoute(route);
    setFormData({
      name: route.name,
      stops: route.stops.map(stop => stop._id),
      timingSlots: route.timingSlots.length > 0 ? route.timingSlots : [{ startTime: "", endTime: "", days: [] }],
      optimizedFor: route.optimizedFor || []
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
        stops: formData.stops,
        timingSlots: formData.timingSlots,
        optimizedFor: formData.optimizedFor
      };

      if (dialogMode === "add") {
        await axios.post(`${API_BASE_URL}/route/`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess("Route created successfully!");
      } else {
        await axios.put(`${API_BASE_URL}/route/${selectedRoute._id}`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess("Route updated successfully!");
      }

      setOpenDialog(false);
      fetchRoutes();
    } catch (err) {
      setError(err.response?.data?.msg || `Failed to ${dialogMode} route`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete route
  const handleDeleteRoute = async (routeId, routeName) => {
    if (!window.confirm(`Are you sure you want to delete "${routeName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/route/${routeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Route deleted successfully!");
      fetchRoutes();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to delete route");
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
          Manage Routes
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Create and manage shuttle routes for your university
        </Typography>
      </Box>

      {/* Routes List */}
      {routes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <RouteIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No routes found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Get started by creating your first shuttle route
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddRoute}>
            Create First Route
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {routes.map((route) => (
            <Grid item xs={12} key={route._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {route.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip 
                          icon={<LocationIcon />}
                          label={`${route.stops.length} stops`} 
                          size="small" 
                          variant="outlined"
                        />
                        <Chip 
                          icon={<ScheduleIcon />}
                          label={`${route.timingSlots.length} time slots`} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    <Box>
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditRoute(route)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteRoute(route._id, route.name)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Route Details</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={3}>
                        {/* Stops */}
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" gutterBottom>
                            Stops ({route.stops.length})
                          </Typography>
                          <List dense>
                            {route.stops.map((stop, index) => (
                              <ListItem key={stop._id}>
                                <ListItemIcon>
                                  <Typography variant="body2" color="primary">
                                    {index + 1}
                                  </Typography>
                                </ListItemIcon>
                                <MuiListItemText 
                                  primary={stop.name}
                                  secondary={stop.campusZone}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Grid>

                        {/* Timing Slots */}
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" gutterBottom>
                            Timing Slots
                          </Typography>
                          {route.timingSlots.map((slot, index) => (
                            <Paper key={index} variant="outlined" sx={{ p: 2, mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <TimeIcon fontSize="small" />
                                <Typography variant="body2">
                                  {slot.startTime} - {slot.endTime}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {slot.days.map(day => (
                                  <Chip key={day} label={day} size="small" />
                                ))}
                              </Box>
                            </Paper>
                          ))}
                        </Grid>

                        {/* Optimization */}
                        {route.optimizedFor && route.optimizedFor.length > 0 && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                              Optimized For
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {route.optimizedFor.map(opt => (
                                <Chip 
                                  key={opt} 
                                  icon={<OptimizeIcon />}
                                  label={opt} 
                                  size="small" 
                                  color="primary"
                                />
                              ))}
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
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
        onClick={handleAddRoute}
      >
        <AddIcon />
      </Fab>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === "add" ? "Create New Route" : "Edit Route"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {/* Route Name */}
            <TextField
              name="name"
              label="Route Name"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              error={!!formErrors.name}
              helperText={formErrors.name}
              disabled={submitting}
            />

            {/* Stops Selection */}
            <FormControl fullWidth margin="normal" error={!!formErrors.stops}>
              <InputLabel>Select Stops (in order)</InputLabel>
              <Select
                multiple
                value={formData.stops}
                onChange={handleStopsChange}
                input={<OutlinedInput label="Select Stops (in order)" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value, index) => {
                      const stop = stops.find(s => s._id === value);
                      return (
                        <Chip key={value} label={`${index + 1}. ${stop?.name}`} size="small" />
                      );
                    })}
                  </Box>
                )}
                disabled={submitting}
              >
                {stops.map((stop) => (
                  <MenuItem key={stop._id} value={stop._id}>
                    <Checkbox checked={formData.stops.indexOf(stop._id) > -1} />
                    <ListItemText primary={stop.name} secondary={stop.campusZone} />
                  </MenuItem>
                ))}
              </Select>
              {formErrors.stops && (
                <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                  {formErrors.stops}
                </Typography>
              )}
            </FormControl>

            {/* Timing Slots */}
            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Timing Slots
            </Typography>
            {formData.timingSlots.map((slot, index) => (
              <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2">Slot {index + 1}</Typography>
                  {formData.timingSlots.length > 1 && (
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => removeTimingSlot(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Start Time"
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => handleTimingSlotChange(index, 'startTime', e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!formErrors[`timingSlot${index}StartTime`]}
                      helperText={formErrors[`timingSlot${index}StartTime`]}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="End Time"
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => handleTimingSlotChange(index, 'endTime', e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!formErrors[`timingSlot${index}EndTime`]}
                      helperText={formErrors[`timingSlot${index}EndTime`] || formErrors[`timingSlot${index}Time`]}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth error={!!formErrors[`timingSlot${index}Days`]}>
                      <InputLabel>Days</InputLabel>
                      <Select
                        multiple
                        value={slot.days}
                        onChange={(e) => handleTimingSlotChange(index, 'days', e.target.value)}
                        input={<OutlinedInput label="Days" />}
                        renderValue={(selected) => selected.join(', ')}
                      >
                        {DAYS_OF_WEEK.map((day) => (
                          <MenuItem key={day} value={day}>
                            <Checkbox checked={slot.days.indexOf(day) > -1} />
                            <ListItemText primary={day} />
                          </MenuItem>
                        ))}
                      </Select>
                      {formErrors[`timingSlot${index}Days`] && (
                        <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                          {formErrors[`timingSlot${index}Days`]}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>
            ))}
            
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<AddIcon />} 
              onClick={addTimingSlot} 
              sx={{ mb: 2 }}
              disabled={submitting}
            >
              Add Timing Slot
            </Button>

            {/* Optimization Options */}
            <FormControl fullWidth margin="normal">
              <InputLabel>Optimization Options (Optional)</InputLabel>
              <Select
                multiple
                value={formData.optimizedFor}
                onChange={handleOptimizationChange}
                input={<OutlinedInput label="Optimization Options (Optional)" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
                disabled={submitting}
              >
                {OPTIMIZATION_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    <Checkbox checked={formData.optimizedFor.indexOf(option) > -1} />
                    <ListItemText primary={option} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Saving...' : (dialogMode === "add" ? "Create Route" : "Update Route")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
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

      {/* Error Snackbar */}
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

export default ManageRoutes;