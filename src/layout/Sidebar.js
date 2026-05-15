import React, { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import IconButton from "@mui/material/IconButton";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import MenuIcon from "@mui/icons-material/Menu";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import Chip from "@mui/material/Chip";
import {
  ConfirmationNumber as ConfirmationNumberIcon,
  Gavel as GavelIcon,
  ContactMail as ContactMailIcon,
  DirectionsBoat,
  Kayaking,
  Water,
  BeachAccess,
  DirectionsCar,
  TwoWheeler,
  DirectionsBike,
  Flight,
  DirectionsRun,
  Speed,
  ElectricBike as ElectricBikeIcon,
  CarRental as CarRentalIcon,
  LocationOn as LocationOnIcon,
  Park,
  Language as LanguageIcon,
  Payment as PaymentIcon,
  MenuBook as MenuBookIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import zip from "./zip.png"
import { GiHorseHead } from "react-icons/gi";
import { TbParachute } from "react-icons/tb";

import SnowmobileIcon from "@mui/icons-material/Snowmobile";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import VideogameAssetIcon from "@mui/icons-material/VideogameAsset";
import DirectionsBoatFilledIcon from "@mui/icons-material/DirectionsBoatFilled";
import RowingIcon from "@mui/icons-material/Rowing";
import { useAuth } from "../contexts/AuthContext";
import { useCategoryList } from "../hooks/useApi";
import logo from "../assets/logo.jpg";
import "../layout/Nav.css";
import { useLanguage } from "../contexts/LanguageContext";
import SailingIcon from "@mui/icons-material/Sailing";
import { MdParagliding } from "react-icons/md";

import LocalBarIcon from "@mui/icons-material/LocalBar";
// Helper function to get icon for category
const getCategoryIcon = (categoryName) => {
  if (!categoryName) return <Park />;
  const cat = categoryName.toLowerCase();
  switch (cat) {
    // Water activities
    case "yacht":
      return <SailingIcon />;
    case "speed boat":
      return <DirectionsBoat />;
    case "rafting":
      return <RowingIcon />;
    case "parachute":
    case "Paragliding":
      return <MdParagliding />;
      case "skydiving":
        return <MdParagliding />
    case "jetcar":
    case "sea moto":
      return <Speed />;
    case "hydrocycle":
    case "cutter":
      return <BeachAccess />;
    // Land activities
    case "quadro tours":
    case "quad tours":
    case "quad":
      return <ElectricBikeIcon />;
    case "moto tour":
    case "moto tours":
      return <TwoWheeler />;
    case "jeep tours":
    case "jeep":
      return <DirectionsCar />;
    case "hiking":
      return <DirectionsRun />;
    case "karting":
      return <Speed />;
    case "zipline":
      return <img src={zip} width={30} height={30}/>;
    case "horse":
      return <GiHorseHead />;
    case "airsoft":
      return <VideogameAssetIcon />;
    case "snowmobile":
      return <SnowmobileIcon />;
    case "ship":
      return <DirectionsBoatFilledIcon />;

    case "beach":
      return <BeachAccessIcon />;
    case "night club":
      return <LocalBarIcon />;
    default:
      return <Park />;
  }
};

function SidebarContent({ onMobileClose }) {
  const location = useLocation();
  const { user } = useAuth();
  const { data: categories, loading: categoriesLoading } = useCategoryList();
  const { language, setLanguage, t } = useLanguage();

  // Helper function to translate category names
  const translateCategoryName = (categoryName) => {
    if (!categoryName) return "";
    const normalized = categoryName.toLowerCase().trim();

    // Map common category names to translation keys
    if (normalized.includes("parachute")) return t("category.parachute");
    if (normalized.includes("yacht")) return t("category.yacht");
    if (normalized.includes("rafting")) return t("category.rafting");
    if (
      normalized.includes("seamoto") ||
      normalized.includes("sea moto") ||
      normalized.includes("sea-moto")
    )
      return t("category.seaMoto");
    if (normalized.includes("quad") || normalized.includes("quadro"))
      return t("category.quadTours");
    if (normalized.includes("moto tour") || normalized.includes("mototour"))
      return t("category.motoTours");
    if (normalized.includes("jeep")) return t("category.jeepTours");
    if (normalized.includes("hiking")) return t("category.hiking");
    if (normalized.includes("bicycle") || normalized.includes("vip car"))
      return t("category.bicycles");
    if (normalized.includes("zipline")) return t("category.zipline");
    if (normalized.includes("paragliding")) return t("category.paragliding");
    if (normalized.includes("karting")) return t("category.karting");
    if (normalized.includes("airsoft")) return t("category.airsoft");
    if (normalized.includes("buran")) return t("category.buran");
    if (normalized.includes("jetcar")) return t("category.jetcar");
    if (normalized.includes("cutter")) return t("category.cutter");
    if (normalized.includes("hydrocycle")) return t("category.hydrocycle");
    if (normalized.includes("other")) return t("category.other");

    // If no translation found, return original name
    return categoryName;
  };

  // Filter water categories
  const waterCategories = useMemo(() => {
    if (!categories || !Array.isArray(categories)) return [];
    return categories.filter((cat) => cat.activity?.toLowerCase() === "water");
  }, [categories]);

  // Filter land categories
  const landCategories = useMemo(() => {
    if (!categories || !Array.isArray(categories)) return [];
    return categories.filter((cat) => cat.activity?.toLowerCase() === "land");
  }, [categories]);

  // Create water items dynamically
  const waterItems = useMemo(() => {
    const items = [
      {
        label: t("nav.allWaterActivities"),
        path: "/water-activities",
        icon: <Water />,
      },
    ];

    // Add dynamic water category items
    if (waterCategories && waterCategories.length > 0) {
      waterCategories.forEach((category) => {
        items.push({
          label: translateCategoryName(category.name),
          path: `/category/${category.id}`,
          icon: getCategoryIcon(category.name),
        });
      });
    }

    return items;
  }, [waterCategories, t]);

  // Create land items dynamically
  const landItems = useMemo(() => {
    const items = [
      {
        label: t("nav.allLandActivities"),
        path: "/land-activities",
        icon: <DirectionsBike />,
      },
    ];

    // Add dynamic land category items
    if (landCategories && landCategories.length > 0) {
      landCategories.forEach((category) => {
        items.push({
          label: translateCategoryName(category.name),
          path: `/category/${category.id}`,
          icon: getCategoryIcon(category.name),
        });
      });
    }

    return items;
  }, [landCategories, t]);

  // Static navigation sections with dynamic items
  const navSections = useMemo(
    () => [
      {
        header: t("nav.waterHeader"),
        items: waterItems,
      },
      {
        header: t("nav.landHeader"),
        items: landItems,
      },
      {
        header: t("nav.mainHeader"),
        items: [
          {
            label: t("nav.nearby"),
            path: "/nearby-activities",
            icon: <LocationOnIcon />,
          },
          {
            label: t("nav.tickets"),
            path: "/tickets",
            icon: <ConfirmationNumberIcon />,
          },
          { label: t("nav.rules"), path: "/rules", icon: <GavelIcon /> },
          {
            label: t("nav.touristLaw"),
            path: "https://matsne.gov.ge/ka/document/view/6012850?publication=4",
            icon: <MenuBookIcon />,
            external: true,
            badge: t("nav.touristLawBadge"),
          },
          {
            label: t("nav.contact"),
            path: "/contact",
            icon: <ContactMailIcon />,
          },
          {
            label: "Google Pay Test",
            path: "/google-pay-test",
            icon: <PaymentIcon />,
          },
        ],
      },
    ],
    [waterItems, landItems, t],
  );

  const handleItemClick = () => {
    if (onMobileClose) onMobileClose();
  };

  const handleLanguageChange = (_, value) => {
    if (!value) return;
    setLanguage(value);
  };

  return (
    <Box
      sx={{
        width: { xs: "100%", md: 260 },
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          borderBottom: "1px solid rgba(255,255,255,0.2)",
          marginTop: "50px",
        }}
      >
        <Link to="/">
          <img
            src={logo}
            alt="logo"
            style={{ maxWidth: "120px", height: "80px", objectFit: "contain" }}
          />
        </Link>
      </Box>

      {/* User Info */}
      <Box
        data-guide="sidebar-auth"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 2,
          borderBottom: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, color: "#fff", mb: 1 }}
        >
          {user ? user.name : t("nav.guest")}
        </Typography>
        {user ? (
          <Button
            component={Link}
            to="/profile"
            color="secondary"
            size="small"
            sx={{ mt: 1 }}
            onClick={handleItemClick}
          >
            {t("nav.profile")}
          </Button>
        ) : (
          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            <Button
              component={Link}
              to="/login"
              color="secondary"
              size="small"
              onClick={handleItemClick}
              data-guide="login-button"
            >
              {t("nav.login")}
            </Button>
            <Button
              component={Link}
              to="/register"
              color="secondary"
              size="small"
              variant="contained"
              onClick={handleItemClick}
              data-guide="register-button"
            >
              {t("nav.register")}
            </Button>
          </Box>
        )}
      </Box>

      {/* Navigation with custom scrollbar */}
      <Box
        data-guide="sidebar-navigation"
        className="sidebar-scroll"
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          py: 1,
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {navSections.map((section) => (
          <List
            key={section.header}
            subheader={
              <ListSubheader
                sx={{
                  bgcolor: "inherit",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#fff",
                  pl: 2,
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  backgroundColor: "#87003A",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                  py: 1,
                }}
              >
                {section.header}
              </ListSubheader>
            }
          >
            {categoriesLoading &&
            (section.header === t("nav.waterHeader") ||
              section.header === t("nav.landHeader")) ? (
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress size={20} sx={{ color: "#fff" }} />
              </Box>
            ) : (
              section.items.map((item) => {
                const linkProps = item.external
                  ? {
                      component: "a",
                      href: item.path,
                      target: "_blank",
                      rel: "noopener noreferrer",
                    }
                  : { component: Link, to: item.path };
                return (
                  <ListItem
                    key={item.path}
                    disablePadding
                    selected={!item.external && location.pathname === item.path}
                  >
                    <ListItemButton
                      {...linkProps}
                      onClick={handleItemClick}
                      sx={{
                        px: 3,
                        py: 1.5,
                        "&.Mui-selected": {
                          backgroundColor: "rgba(255,255,255,0.1)",
                        },
                        ...(item.external && {
                          mx: 1.5,
                          my: 0.5,
                          borderRadius: 1.5,
                          background:
                            "linear-gradient(135deg, rgba(255,193,7,0.15), rgba(255,152,0,0.08))",
                          borderLeft: "3px solid #FFC107",
                          "&:hover": {
                            background:
                              "linear-gradient(135deg, rgba(255,193,7,0.25), rgba(255,152,0,0.15))",
                          },
                        }),
                      }}
                    >
                      <Box
                        sx={{
                          mr: 2,
                          color: item.external ? "#FFC107" : "#fff",
                          display: "flex",
                          alignItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </Box>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              minWidth: 0,
                            }}
                          >
                            <Box
                              component="span"
                              sx={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                fontWeight: item.external ? 600 : 400,
                              }}
                            >
                              {item.label}
                            </Box>
                            {item.badge && (
                              <Chip
                                label={item.badge}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: "0.625rem",
                                  fontWeight: 700,
                                  bgcolor: "#FFC107",
                                  color: "#3d000f",
                                  "& .MuiChip-label": { px: 0.75 },
                                }}
                              />
                            )}
                          </Box>
                        }
                        sx={{ color: "#fff", m: 0 }}
                      />
                      {item.external && (
                        <OpenInNewIcon
                          sx={{
                            ml: 1,
                            fontSize: 16,
                            color: "rgba(255,193,7,0.8)",
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })
            )}
          </List>
        ))}
      </Box>

      {/* Language switcher inside sidebar */}
      <Box
        sx={{
          borderTop: "1px solid rgba(255,255,255,0.2)",
          py: 2,
          px: 2,
          mt: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1.5,
            px: 1,
          }}
        >
          <LanguageIcon sx={{ color: "rgba(255,255,255,0.9)", fontSize: 20 }} />
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255,255,255,0.9)",
              fontWeight: 500,
              fontSize: "0.875rem",
            }}
          >
            {t("nav.language") || "Language"}
          </Typography>
        </Box>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={language}
          onChange={handleLanguageChange}
          fullWidth
          sx={{
            "& .MuiToggleButtonGroup-grouped": {
              border: "1px solid rgba(255,255,255,0.3)",
              "&:not(:first-of-type)": {
                borderLeft: "1px solid rgba(255,255,255,0.3)",
                marginLeft: 0,
              },
              "&:first-of-type": {
                borderLeft: "1px solid rgba(255,255,255,0.3)",
              },
            },
          }}
        >
          <ToggleButton
            value="en"
            sx={{
              flex: 1,
              color: "rgba(255,255,255,0.8)",
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.75rem",
              py: 1,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              "&.Mui-selected": {
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "#fff",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.25)",
                },
              },
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            <span style={{ fontSize: "1.25rem", margin: "0 auto" }}>🇬🇧</span>
          </ToggleButton>
          <ToggleButton
            value="he"
            sx={{
              flex: 1,
              color: "rgba(255,255,255,0.8)",
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.75rem",
              py: 1,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              "&.Mui-selected": {
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "#fff",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.25)",
                },
              },
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            <span style={{ fontSize: "1.25rem", margin: "0 auto" }}>🇮🇱</span>
          </ToggleButton>
          <ToggleButton
            value="hi"
            sx={{
              flex: 1,
              color: "rgba(255,255,255,0.8)",
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.75rem",
              py: 1,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              "&.Mui-selected": {
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "#fff",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.25)",
                },
              },
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            <span style={{ fontSize: "1.25rem", margin: "0 auto" }}>🇮🇳</span>
          </ToggleButton>
          <ToggleButton
            value="ru"
            sx={{
              flex: 1,
              color: "rgba(255,255,255,0.8)",
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.75rem",
              py: 1,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              "&.Mui-selected": {
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "#fff",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.25)",
                },
              },
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            <span style={{ fontSize: "1.25rem", margin: "0 auto" }}>🇷🇺</span>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMobileClose = () => setMobileOpen(false);
  const handleMoreMenuOpen = (event) => {
    setMoreMenuAnchor(event.currentTarget);
    setMoreMenuOpen(true);
  };
  const handleMoreMenuClose = () => {
    setMoreMenuOpen(false);
    setMoreMenuAnchor(null);
  };
  const handleLogout = () => {
    logout();
    handleMoreMenuClose();
  };

  return (
    <>
      {/* Mobile App Bar */}
      <AppBar
        position="fixed"
        sx={{
          display: { xs: "flex", md: "none" },
          backgroundColor: "#87003A",
          zIndex: 1300,
          top: "50px",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            component={Link}
            to="/"
            variant="h6"
            sx={{
              flexGrow: 1,
              textDecoration: "none",
              color: "inherit",
              cursor: "pointer",
              "&:hover": {
                opacity: 0.8,
              },
            }}
          >
            Funfinder
          </Typography>
          <IconButton color="inherit" onClick={handleMoreMenuOpen} size="small">
            <MoreVertIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Desktop Sidebar */}
      <div className="sidebar-fixed">
        <SwipeableDrawer
          variant="permanent"
          open
          disableSwipeToOpen
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: 260,
              boxSizing: "border-box",
              top: 0,
              left: 0,
              height: "100vh",
              zIndex: 1200,
              background: "#87003A",
              overflowX: "hidden",
            },
            "& .PrivateSwipeArea-root": {
              display: "none",
            },
          }}
        >
          <SidebarContent />
        </SwipeableDrawer>
      </div>

      {/* Mobile Drawer */}
      <SwipeableDrawer
        anchor="left"
        open={mobileOpen}
        onClose={handleMobileClose}
        onOpen={handleDrawerToggle}
        disableBackdropTransition={false}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: "100%",
            height: "100vh",
            background: "#87003A",
            overflowY: "auto",
          },
          "& .PrivateSwipeArea-root": {
            display: "none",
          },
        }}
      >
        <SidebarContent onMobileClose={handleMobileClose} />
      </SwipeableDrawer>

      {/* Mobile More Menu */}
      <Menu
        anchorEl={moreMenuAnchor}
        open={moreMenuOpen}
        onClose={handleMoreMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {user ? (
          <>
            <MenuItem
              onClick={handleMoreMenuClose}
              component={Link}
              to="/profile"
            >
              {t("nav.profile")}
            </MenuItem>
            <MenuItem onClick={handleLogout}>{t("nav.logout")}</MenuItem>
          </>
        ) : (
          <>
            <MenuItem
              onClick={handleMoreMenuClose}
              component={Link}
              to="/contact"
            >
              {t("nav.contact")}
            </MenuItem>
            <MenuItem
              onClick={handleMoreMenuClose}
              component={Link}
              to="/rules"
            >
              {t("nav.rules")}
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
}
