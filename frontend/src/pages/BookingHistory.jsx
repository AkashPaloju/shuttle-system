import {
  Alert,
  Box,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import axios from "axios";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../constants";

const BookingHistory = () => {
  const [message, setMessage] = useState("Loading Bookings...");
  const [pastbookings, setPastBookings] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/booking/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMessage("");
      const upcomingBookings = res.data.bookings.filter(
        (b) => b.status === "upcoming"
      );
      const pastBookings = res.data.bookings.filter(
        (b) => b.status === "completed" || b.status === "cancelled"
      );
      setUpcomingBookings(upcomingBookings);
      setPastBookings(pastBookings);
      console.log("Booking history fetched:", res.data.pastbookings);
    } catch (err) {
      console.error("Failed to fetch Booking history:", err);
      setMessage("Failed to fetch Booking history.");
      setPastBookings([]);
      setUpcomingBookings([]);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const cancelBooking = async (bookingId) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/booking/cancel`,
        { bookingId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setMessage(res.data.message);
      fetchBookings(); // Refresh bookings after cancellation
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      setMessage("Failed to cancel booking.");
    }
  }

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", p: 4 }}>
      <Typography variant="h4" textAlign="center">
        Upcoming Bookings
      </Typography>
      {message && (
        <Alert severity="info" sx={{ mt: 2, mx: "auto", maxWidth: 600 }}>
          {message}
        </Alert>
      )}
      <Box mt={4}>
        <Paper sx={{ height: 300, width: "100%", maxWidth: 1100, mx: "auto" }}>
          <DataGrid
            rows={upcomingBookings.map((b, idx) => ({
              id: b._id || idx + 1,
              bookingId: b._id,
              routeName: b.routeId?.name || "N/A",
              shuttleNumber: b.shuttleId?.shuttleNumber || "N/A",
              sourceStop: b.sourceStopId?.name || "N/A",
              destinationStop: b.destinationStopId?.name || "N/A",
              fare: b.fare,
              bookingTime: b.bookingTime ? new Date(b.bookingTime).toLocaleString() : "N/A",
              rideStartTime: b.rideStartTime ? new Date(b.rideStartTime).toLocaleString() : "N/A",
              rideEndTime: b.rideEndTime ? new Date(b.rideEndTime).toLocaleString() : "N/A",
            }))}
            columns={[
              { field: "routeName", headerName: "Route", width: 150 },
              { field: "shuttleNumber", headerName: "Shuttle", width: 120 },
              { field: "sourceStop", headerName: "Source", width: 130 },
              { field: "destinationStop", headerName: "Destination", width: 130 },
              { field: "fare", headerName: "Fare", width: 90 },
              { field: "bookingTime", headerName: "Booking Time", width: 170 },
              { field: "rideStartTime", headerName: "Ride Start", width: 170 },
              { field: "rideEndTime", headerName: "Ride End", width: 170 },
              {
                field: "actions",
                headerName: "Actions",
                width: 140,
                sortable: false,
                filterable: false,
                renderCell: (params) => (
                  <Box>
                    <button
                      style={{
                        background: "#d32f2f",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        padding: "6px 12px",
                        cursor: "pointer",
                        fontWeight: 500,
                      }}
                      onClick={() => cancelBooking(params.row.bookingId)}
                      disabled={params.row.status !== "upcoming"}
                    >
                      Cancel
                    </button>
                  </Box>
                ),
              },
            ]}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 3 } },
            }}
            pageSizeOptions={[3, 5, 10, 20]}
            sx={{ border: 0 }}
            disableRowSelectionOnClick
            getRowId={(row) => row.id}
            localeText={{
              noRowsLabel: "No upcoming bookings yet.",
            }}
          />
        </Paper>
      </Box>

      <Typography variant="h4" textAlign="center" mt={6}>
        Booking History
      </Typography>

      {message && (
        <Alert severity="info" sx={{ mt: 2, mx: "auto", maxWidth: 600 }}>
          {message}
        </Alert>
      )}

      <Box mt={4}>
        <Paper sx={{ height: 380, width: "100%", maxWidth: 1100, mx: "auto" }}>
          <DataGrid
            rows={pastbookings.map((b, idx) => ({
              id: b._id || idx + 1,
              routeName: b.routeId?.name || "N/A",
              shuttleNumber: b.shuttleId?.shuttleNumber || "N/A",
              sourceStop: b.sourceStopId?.name || "N/A",
              destinationStop: b.destinationStopId?.name || "N/A",
              fare: b.fare,
              bookingTime: b.bookingTime ? new Date(b.bookingTime).toLocaleString() : "N/A",
              rideStartTime: b.rideStartTime ? new Date(b.rideStartTime).toLocaleString() : "N/A",
              rideEndTime: b.rideEndTime ? new Date(b.rideEndTime).toLocaleString() : "N/A",
              status: b.status,
            }))}
            columns={[
              { field: "routeName", headerName: "Route", width: 150 },
              { field: "shuttleNumber", headerName: "Shuttle", width: 120 },
              { field: "sourceStop", headerName: "Source", width: 130 },
              { field: "destinationStop", headerName: "Destination", width: 130 },
              { field: "fare", headerName: "Fare", width: 90 },
              { field: "bookingTime", headerName: "Booking Time", width: 170 },
              { field: "rideStartTime", headerName: "Ride Start", width: 170 },
              { field: "rideEndTime", headerName: "Ride End", width: 170 },
              { field: "status", headerName: "Status", width: 110 },
            ]}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 5 } },
            }}
            pageSizeOptions={[5, 10, 20]}
            sx={{ border: 0 }}
            disableRowSelectionOnClick
            getRowId={(row) => row.id}
            localeText={{
              noRowsLabel: "No pastbookings yet.",
            }}
          />
        </Paper>
      </Box>
    </Box>
  );
};

export default BookingHistory;
