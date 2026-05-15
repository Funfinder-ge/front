import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  Grid,
  Button,
  Container,
  Paper,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Chip,
  Rating,
  Tooltip,
} from "@mui/material";
import { FaArrowRight } from "react-icons/fa6";
import { Link as RouterLink } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import VisitorCounter from "../components/VisitorCounter";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "primary.main",
        color: "background.paper",
        py: 3,
        textAlign: "center",
      }}
    >
      <Paper
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: 4,
          borderRadius: 0,
          width: "100%",
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            align="center"
            fontWeight={700}
          >
            {t("app.name")}
          </Typography>
          <Typography
            variant="h2"
            align="center"
            paragraph
            style={{ fontFamily: "Tangerine, cursive" }}
          >
            {t("app.tagline")}
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 4 }}>
            {t("app.subtagline")}
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              size="large"
              sx={{ bgcolor: "white", color: "#87003A", fontWeight: 700 }}
            >
              {t("footer.getCard")}
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{ borderColor: "white", color: "white", fontWeight: 700 }}
            >
              <FaArrowRight /> &nbsp; {t("footer.more")}
            </Button>
          </Box>
        </Container>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: { xs: 1.5, sm: 3 },
            flexWrap: "wrap",
            mt: 3,
            opacity: 0.92,
          }}
        >
          <Button
            component={RouterLink}
            to="/terms"
            sx={{ color: "white", textTransform: "none", fontWeight: 600, fontSize: "0.9rem" }}
          >
            Terms of Service
          </Button>
          <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.5)" }} />
          <Button
            component={RouterLink}
            to="/privacy"
            sx={{ color: "white", textTransform: "none", fontWeight: 600, fontSize: "0.9rem" }}
          >
            Privacy Policy
          </Button>
          <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.5)" }} />
          <Button
            component={RouterLink}
            to="/contact"
            sx={{ color: "white", textTransform: "none", fontWeight: 600, fontSize: "0.9rem" }}
          >
            Contact
          </Button>
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 700, marginTop: "20px" }}>
          {t("footer.rights", { year: new Date().getFullYear() })}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <VisitorCounter />
        </Box>
      </Paper>

    </Box>
  );
}
