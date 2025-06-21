import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import theme from "../theme";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const handleAdminMenuToggle = () => {
    setAdminMenuOpen((prev) => !prev);
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: theme.palette.primary.main }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ flexGrow: 1, textDecoration: "none", color: "inherit" }}
        >
          Shuttle Management System
        </Typography>

        <Box>
          {user ? (
            <>
              <Button color="inherit" component={Link} to="/booking" onClick={() => setAdminMenuOpen(false)}>
                Book Shuttle
              </Button>
              <Button color="inherit" component={Link} to="/wallet" onClick={() => setAdminMenuOpen(false)}>
                My Wallet
              </Button>
              <Button color="inherit" component={Link} to="/my-bookings" onClick={() => setAdminMenuOpen(false)}>
                My Bookings
              </Button>

              {user.role === "admin" && (
                <Box sx={{ display: "inline-block", position: "relative" }}>
                  <Button
                    color="inherit"
                    onClick={handleAdminMenuToggle}
                  >
                    Admin Dashboard
                    <span className="arrow-icon">▼</span>
                  </Button>
                  {adminMenuOpen && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        backgroundColor: "background.paper",
                        boxShadow: 3,
                        zIndex: 10,
                        minWidth: 180,
                        borderRadius: 1,
                        p: 1,
                      }}
                    >
                      <Button
                        color="inherit"
                        component={Link}
                        to="/admin/users"
                        sx={{ display: "block", width: "100%", justifyContent: "flex-start" }}
                        onClick={() => setAdminMenuOpen(false)}
                      >
                        Manage Wallets
                      </Button>
                      <Button
                        color="inherit"
                        component={Link}
                        to="/admin/stops"
                        sx={{ display: "block", width: "100%", justifyContent: "flex-start" }}
                        onClick={() => setAdminMenuOpen(false)}
                      >
                        Manage Stops
                      </Button>
                      <Button
                        color="inherit"
                        component={Link}
                        to="/admin/routes"
                        sx={{ display: "block", width: "100%", justifyContent: "flex-start" }}
                        onClick={() => setAdminMenuOpen(false)}
                      >
                        Manage Routes
                      </Button>
                      <Button
                        color="inherit"
                        component={Link}
                        to="/admin/shuttles"
                        sx={{ display: "block", width: "100%", justifyContent: "flex-start" }}
                        onClick={() => setAdminMenuOpen(false)}
                      >
                        Manage Shuttles
                      </Button>
                    </Box>
                  )}
                </Box>
              )}

              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
