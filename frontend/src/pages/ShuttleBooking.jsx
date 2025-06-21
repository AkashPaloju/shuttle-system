import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  MenuItem,
  Select,
  Snackbar,
  Typography,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { API_BASE_URL } from "../constants";

const ShuttleBooking = () => {
  const { user, login } = useContext(AuthContext);
  const [stops, setStops] = useState([]);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [bestRoutes, setBestRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [walletBalance, setWalletBalance] = useState(user?.walletBalance || 0);

  useEffect(() => {
    setWalletBalance(user?.walletBalance || 0);
    fetchStops();
  }, []);

  const fetchStops = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/stop/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setStops(res.data.stops || []);
    } catch (err) {
      showMessage("Failed to load shuttle stops.", "error");
      console.error("Error fetching stops:", err);
    }
  };

  const fetchBestRoutes = async () => {
    if (!source || !destination || source === destination) {
      showMessage("Please select valid source and destination stops.", "error");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/route/best-routes`,
        { source, destination },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setBestRoutes(data.bestRoutes || []);
      showMessage("Available routes found!", "success");
      console.log("Best Routes:", data.bestRoutes);
    } catch (err) {
      showMessage(err.response?.data?.msg || "Failed to find a route.", "error");
    }
    setLoading(false);
  };

  const handleBooking = async (route) => {
    const token = localStorage.getItem("token");
    if (!token) {
      showMessage("User not authenticated.", "error");
      return;
    }
    if (parseInt(route.fare) > parseInt(walletBalance)) {
      console.log("Insufficient wallet balance:", walletBalance, "for fare:", route.fare);
      showMessage(`Insufficient wallet balance: ${walletBalance} for fare: ${route.fare}`, "error");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/booking`,
        {
          sourceStopId: source,
          destinationStopId: destination,
          routeId: route.routeId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update wallet on client (optional: fetch again instead)
      login(token, {
        ...user,
        walletBalance: user.walletBalance - route.fare,
      });

      showMessage(data.message || "Ride booked successfully!", "success");
      setWalletBalance(user.walletBalance - route.fare); // Update local wallet balance 
    } catch (err) {
      showMessage(err.response?.data?.msg || "Failed to book ride.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
    setOpenSnackbar(true);
  };

  return (
    <Container maxWidth="md">
      <Box mt={5}>
        <Typography variant="h4" align="center" gutterBottom>
          Shuttle Booking
        </Typography>

        {/* Source, Destination, Button in a row */}
        <Grid container spacing={2} alignItems="center" mb={3}>
          <Grid item xs={4}>
            <Select
              fullWidth
              value={source}
              onChange={(e) => setSource(e.target.value)}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Source Stop
              </MenuItem>
              {stops.map((stop) => (
                <MenuItem key={stop._id} value={stop._id}>
                  {stop.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={4}>
            <Select
              fullWidth
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Destination Stop
              </MenuItem>
              {stops.map((stop) => (
                <MenuItem key={stop._id} value={stop._id}>
                  {stop.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={4}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={fetchBestRoutes}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Find Best Routes"}
            </Button>
          </Grid>
        </Grid>

        <Typography variant="h6" color="textSecondary" textAlign="center" mt={2}>
          Wallet Balance: {walletBalance} points
        </Typography>

        {/* Show best routes */}
        <Box mt={4}>
          {bestRoutes.map((route, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{route.routeName}</Typography>
                <Typography>
                  Stops: {route.allStops.map((s) => s.name).join(" → ")}
                </Typography>
                <Typography>Shuttle: {route.shuttleNumber}</Typography>
                <Typography>Fare: ₹{route.fare}</Typography>
                <Typography>Estimated Time: {route.estimatedTime}</Typography>
                <Typography>Arrival Time: {route.arrivalTime}</Typography>
                <Typography>Available Seats: {route.availableSeats}</Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleBooking(route)}
                  disabled={loading}
                >
                  Book
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={4000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert
            onClose={() => setOpenSnackbar(false)}
            severity={messageType}
            variant="filled"
          >
            {message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default ShuttleBooking;
