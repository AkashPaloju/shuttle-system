import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../constants";
import PropTypes from "prop-types";
import { DataGrid } from "@mui/x-data-grid";


const UserModal = ({ user, open, onClose, onWalletUpdate }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (user && open) {
      setAmount(0);
      setLoading(true);
      axios
        .get(`${API_BASE_URL}/booking/admin/${user._id}/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => setBookings(res.data.bookings || []))
        .catch(() => setError("Failed to load booking history."))
        .finally(() => setLoading(false));
    }
  }, [user, open]);

  const handleWalletUpdate = async () => {
    setSaving(true);
    const newBalance = user.walletBalance + Number(amount);
    try {
      console.log(
        `Updating wallet for user ${user._id}: ${amount} (${description})`
      );
      await axios.put(
        `${API_BASE_URL}/wallet/update`,
        { userId: user._id, amount: Number(amount), description },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      onWalletUpdate(user._id, newBalance);
      onClose();
    } catch {
      setError("Failed to update wallet balance.");
    } finally {
      setSaving(false);
    }
  };


  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>User Details</DialogTitle>
      <DialogContent>
        <Typography>Name: {user?.name}</Typography>
        <Typography>Email: {user?.email}</Typography>
        <Box mt={2}>
          <Typography>
            Current Wallet Balance: <b>{user.walletBalance} points</b>
          </Typography>
          <TextField
            label="Amount to Add/Subtract"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            fullWidth
            helperText="Enter positive to add, negative to subtract"
            sx={{ mt: 2 }}
          />
          <Typography sx={{ mt: 1 }}>
            New Balance: <b>{user.walletBalance + Number(amount)} points</b>
          </Typography>
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />
        </Box>
        <Box mt={3}>
          <Typography variant="h6">Ride History</Typography>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : (
            <Box mt={4}>
              <Paper sx={{ height: 400, width: "100%", maxWidth: 1100, mx: "auto" }}>
                <DataGrid
                  rows={bookings.map((b, idx) => ({
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
                    noRowsLabel: "No bookings yet.",
                  }}
                />
              </Paper>
            </Box>
          )}
        </Box>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Close</Button>
        <Button
          variant="contained"
          onClick={handleWalletUpdate}
          disabled={saving || amount === 0}
        >
          Save Wallet Balance
        </Button>
      </DialogActions>
    </Dialog>
  );
};

UserModal.propTypes = {
  user: PropTypes.object,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onWalletUpdate: PropTypes.func,
};

const ManageUsersWallet = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [savingAll, setSavingAll] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(res.data.users);
      console.log("Fetched users:", res.data.users);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const handleWalletUpdate = (userId, newBalance) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, walletBalance: newBalance } : u))
    );
  };

  const handleWalletUpdateToAllStudents = async () => {
    setSavingAll(true);
    setError("");
    try {
      await axios.put(
        `${API_BASE_URL}/wallet/update-all`,
        {
          amount: Number(amount),
          description,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      // Update all users' wallet balances locally
      setUsers((prev) =>
        prev.map((u) => ({
          ...u,
          walletBalance: u.walletBalance + Number(amount),
        }))
      );
      setAmount(0);
      setDescription("");
    } catch (err) {
      console.error("Failed to update wallet balances:", err);
      setError("Failed to update wallet balances.");
    } finally {
      setSavingAll(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Manage Users Wallet
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Update and manage wallet balances for users
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Box mt={4}>
        <Typography variant="h6">Bulk Wallet Update</Typography>
        <Paper sx={{ mt: 2, p: 2, mb: 4 }}>
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <TextField
              label="Amount to Add/Subtract"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              helperText="Enter positive to add, negative to subtract"
              sx={{ minWidth: 200 }}
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ minWidth: 300 }}
            />
            <Button
              variant="contained"
              onClick={handleWalletUpdateToAllStudents}
              disabled={savingAll || amount === 0}
            >
              {savingAll ? "Saving..." : "Update All Students"}
            </Button>
          </Box>
        </Paper>

        <Typography variant="h6">Manage Individual User&apos;s wallet</Typography>
        <Paper sx={{ mt: 2, p: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Wallet Balance</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.walletBalance} points</TableCell>
                  <TableCell>
                    <Button variant="contained" onClick={() => handleOpenModal(user)}>
                      View Bookings
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
      {selectedUser && (
        <UserModal
          user={selectedUser}
          open={modalOpen}
          onClose={handleCloseModal}
          onWalletUpdate={handleWalletUpdate}
        />
      )}
    </Container>
  );
};

export default ManageUsersWallet;
