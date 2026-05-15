import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Container,
  Chip,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { QRCodeCanvas } from "qrcode.react";
import { useAuth } from "../../contexts/AuthContext";
import orderApiService from "../../services/orderApi";

const Tickets = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [qrOrder, setQrOrder] = useState(null);

  // Load order feed and filter for current user
  useEffect(() => {
    const loadOrders = async () => {
      if (!user?.email) return;
      try {
        setOrdersLoading(true);
        setOrdersError("");
        const feed = await orderApiService.getOrderFeed();
        const list = Array.isArray(feed)
          ? feed
          : Array.isArray(feed?.orders)
            ? feed.orders
            : Array.isArray(feed?.data)
              ? feed.data
              : [];
        // Filter only this user's orders, exclude failed
        const failedStatuses = ['failed', 'cancelled', 'canceled', 'rejected', 'expired'];
        const myOrders = list.filter((o) => {
          const status = (o.status || o.payment_status || '').toLowerCase();
          if (failedStatuses.includes(status)) return false;
          const emails = [o.customer_email, o.email, o.customer?.email, o.user?.email]
            .filter(Boolean)
            .map((e) => (typeof e === "string" ? e.toLowerCase() : e));
          return emails.includes(user.email.toLowerCase());
        });
        setOrders(myOrders);
      } catch (e) {
        setOrdersError(e.message || "Failed to load orders");
      } finally {
        setOrdersLoading(false);
      }
    };
    loadOrders();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "used":
        return "default";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Active";
      case "pending":
        return "Pending";
      case "used":
        return "Used";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const mapOrderToTicket = (order) => {
    const statusRaw = (order.status || "").toString().toLowerCase();
    let status = "pending";
    if (/(paid|approved|confirmed|active)/.test(statusRaw)) status = "active";
    else if (/(completed|used|done)/.test(statusRaw)) status = "used";
    else if (/(cancel)/.test(statusRaw)) status = "cancelled";

    return {
      id: order.order_number || order.number || order.id,
      activity: order.event_title || order.title || order.event?.title || "Event",
      description: order.event_description || order.description || order.event?.description || "",
      date: order.event_date || order.date || order.event?.date || "",
      time: order.event_time || order.time || order.event?.time || "",
      location: order.location || order.event?.location || "",
      latitude: order.latitude || order.lat || order.event?.latitude || order.event?.lat || null,
      longitude: order.longitude || order.lng || order.lon || order.event?.longitude || order.event?.lng || order.event?.lon || null,
      price: order.total_price || order.price || order.amount || "",
      peopleCount: order.people_count || order.quantity || order.tickets_count || null,
      qr: true,
      status,
      _raw: order,
    };
  };

  const TicketCard = ({ ticket }) => (
    <Card sx={{ mb: 2, borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h6" color="primary" fontWeight={700}>
              {ticket.activity}
            </Typography>
            {ticket.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {ticket.description}
              </Typography>
            )}
            {ticket.location && (
              <Typography variant="body2" color="text.secondary">
                {ticket.location}
              </Typography>
            )}
            {(ticket.date || ticket.time) && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Date: <b>{ticket.date}</b> | Time: <b>{ticket.time}</b>
              </Typography>
            )}
            {(ticket.latitude != null && ticket.longitude != null) && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Latitude: <b>{ticket.latitude}</b>, Longitude: <b>{ticket.longitude}</b>
              </Typography>
            )}
            {(ticket.price !== "" || ticket.peopleCount != null) && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {ticket.price !== "" && (
                  <>
                    Price: <b>{ticket.price} ₾</b>
                  </>
                )}
                {(ticket.price !== "" && ticket.peopleCount != null) && " • "}
                {ticket.peopleCount != null && (
                  <>
                    Number of People: <b>{ticket.peopleCount}</b>
                  </>
                )}
              </Typography>
            )}
            <Chip
              label={getStatusText(ticket.status)}
              color={getStatusColor(ticket.status)}
              size="small"
              sx={{ mt: 1 }}
            />
          </Grid>
          <Grid item xs={12} md={4} textAlign={{ xs: "left", md: "right" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                alignItems: { xs: "flex-start", md: "flex-end" },
              }}
            >
              {ticket.qr ? (
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{ borderRadius: 2 }}
                  onClick={() => setQrOrder(ticket._raw)}
                >
                  QR Code
                </Button>
              ) : (
                <Typography variant="caption" color="text.disabled">
                  QR Unavailable
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // If user is not logged in, show login message
  if (!user) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", my: 8 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            fontWeight={700}
            color="#87003A"
          >
            My Cards
          </Typography>
          <Alert severity="info" sx={{ mt: 4, maxWidth: 600, mx: "auto" }}>
            <Typography variant="h6" gutterBottom>
              to see your tickets, log in first
            </Typography>
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          fontWeight={700}
          color="#87003A"
        >
          My Cards
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          
        </Typography>
      </Box>

      {/* Current Tickets */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" fontWeight={700} mb={3} color="primary">
          My Orders
        </Typography>
        <Divider sx={{ mb: 3 }} />
        {ordersLoading && (
          <Typography color="text.secondary">Loading...</Typography>
        )}
        {ordersError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {ordersError}
          </Alert>
        )}
        {!ordersLoading && !ordersError && orders.length === 0 && (
          <Typography color="text.secondary">No orders found</Typography>
        )}
        {!ordersLoading && !ordersError && orders.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {orders.map((o) => (
              <TicketCard
                key={(o.order_number || o.number || o.id || Math.random()).toString()}
                ticket={mapOrderToTicket(o)}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* QR Code Dialog */}
      <Dialog
        open={!!qrOrder}
        onClose={() => setQrOrder(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Ticket QR Code</DialogTitle>
        <DialogContent sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          {qrOrder && (
            <QRCodeCanvas
              value={JSON.stringify({
                order_number: qrOrder.order_number || qrOrder.number || qrOrder.id,
                event: {
                  id: qrOrder.event_id || qrOrder.event?.id,
                  title: qrOrder.event_title || qrOrder.title || qrOrder.event?.title,
                  date: qrOrder.event_date || qrOrder.event?.date,
                  time: qrOrder.event_time || qrOrder.event?.time,
                  location: qrOrder.location || qrOrder.event?.location,
                },
                customer: {
                  name: user?.name || user?.firstname || user?.lastname,
                  email: user?.email,
                  phone: user?.phone,
                },
                people_count: qrOrder.people_count || qrOrder.quantity,
                price: qrOrder.total_price || qrOrder.price || qrOrder.amount,
              })}
              size={220}
              includeMargin
              level="M"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrOrder(null)}>Close</Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};

export default Tickets;
