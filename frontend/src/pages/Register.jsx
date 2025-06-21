import {
  Alert,
  Box,
  Button,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../constants";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    universityId: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_BASE_URL}/auth/register`,
        formData
      );
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error(err.response?.data);
      setError(err.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box textAlign="center" mt={5}>
        <Typography variant="h4" gutterBottom>
          Register
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Full Name"
            name="name"
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            type="email"
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            name="password"
            type="password"
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="University ID"
            name="universityId"
            onChange={handleChange}
            required
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            sx={{ mt: 2 }}
          >
            Register
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Register;
