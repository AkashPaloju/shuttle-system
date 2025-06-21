import {
  Alert,
  Box,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { API_BASE_URL } from "../constants";

const WalletPage = () => {
  const { user, login } = useContext(AuthContext);
  const [amount, setAmount] = useState(0);
  const [walletBalance, setWalletBalance] = useState(user?.walletBalance || 0);
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState("Loading wallet data...");

  const fetchWalletData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/wallet/get`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMessage("");
      setWalletBalance(res.data.walletBalance);
      // Update wallet balance in AuthContext
      login(localStorage.getItem("token"), {
        ...user,
        walletBalance: res.data.walletBalance,
      });
      setTransactions(res.data.transactions || []);
      console.log("Wallet data fetched successfully:", res.data.transactions);
    } catch (err) {
      console.error("Failed to fetch wallet data:", err);
      setMessage("Failed to fetch wallet data.");
      setTransactions([]);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleAddFunds = async () => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/wallet/recharge`,
        { amount: parseInt(amount, 10) },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const newBalance = res.data.newBalance;

      setWalletBalance(newBalance);
      setMessage("Wallet updated successfully!");
      setAmount("");
      fetchWalletData();
    } catch (err) {
      console.error("Error updating wallet:", err);
      setMessage("Error updating wallet.");
    }
  };

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", p: 4 }}>
      <Typography variant="h4" textAlign="center">
        Wallet
      </Typography>
      <Typography variant="h6" color="textSecondary" textAlign="center" mt={2}>
        Balance: {walletBalance} points
      </Typography>

      {message && (
        <Alert severity="info" sx={{ mt: 2, mx: "auto", maxWidth: 600 }}>
          {message}
        </Alert>
      )}

      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <TextField
          type="number"
          label="Enter Amount (₹)"
          value={amount}
          onChange={(e) => {
            // Only allow integer values
            const val = e.target.value.replace(/[^0-9]/g, "");
            setAmount(val);
          }}
          inputProps={{ step: 1, min: 1 }}
          sx={{ width: 300 }}
        />
        <Button
          variant="contained"
          color="primary"
          sx={{ ml: 2 }}
          onClick={handleAddFunds}
        >
          Add Funds
        </Button>
      </Box>

      {/* Transaction History */}
      <Box mt={4}>
        <Typography variant="h6" textAlign="center" mb={2}>
          Transaction History
        </Typography>
        <Paper sx={{ height: 400, width: "100%", maxWidth: 900, mx: "auto" }}>
          <DataGrid
            rows={transactions.map((t, idx) => ({
              id: idx + 1,
              amount: t.amount,
              type: t.type === "debit" ? "Debited" : "Credited",
              description: t.description,
              date: t.createdAt ? new Date(t.createdAt).toLocaleString() : "N/A",
            }))}
            columns={[
              { field: "id", headerName: "ID", width: 70 },
              { field: "amount", headerName: "Amount (points)", width: 140 },
              { field: "type", headerName: "Type", width: 110 },
              { field: "description", headerName: "Description", width: 250 },
              { field: "date", headerName: "Date", width: 200 },
            ]}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 5 } },
            }}
            pageSizeOptions={[5, 10]}
            sx={{ border: 0 }}
            disableRowSelectionOnClick
            getRowId={(row) => row.id}
            localeText={{
              noRowsLabel: "No transactions yet.",
            }}
          />
        </Paper>
      </Box>
    </Box>
  );
};

export default WalletPage;
