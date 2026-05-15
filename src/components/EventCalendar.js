import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tab,
  Tabs,
  Chip,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00',
];

const BRAND = '#87003A';
const BRAND_BLUE = '#87003A';

const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const todayStart = () => {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
};

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const isSameMonth = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const slotIsUpcoming = (slot, dayDate, now) => {
  const [hh, mm] = slot.split(':').map(Number);
  if (!isSameDay(dayDate, now)) return true;
  return hh > now.getHours() || (hh === now.getHours() && mm > now.getMinutes());
};

const EventCalendar = ({ eventId, onDateSelect }) => {
  const [view, setView] = useState(0); // 0=month, 1=week, 2=day
  const today = useMemo(() => todayStart(), []);
  const nowRef = useMemo(() => new Date(), []);

  const [monthCursor, setMonthCursor] = useState(startOfMonth(today));
  const [dayCursor, setDayCursor] = useState(today);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookedDates, setBookedDates] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchBookedDates = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      let orders = [];
      try {
        const res = await fetch(
          `https://base.funfinder.ge/api/v5/event/${eventId}/bookings`,
          { credentials: 'include', headers: { Accept: 'application/json' } }
        );
        if (res.ok) {
          const data = await res.json();
          orders = Array.isArray(data) ? data : (data?.data || data?.results || []);
        }
      } catch (_) { /* fall through */ }

      if (orders.length === 0) {
        try {
          const res = await fetch(
            `https://base.funfinder.ge/api/v5/order/feed`,
            { credentials: 'include', headers: { Accept: 'application/json' } }
          );
          if (res.ok) {
            const data = await res.json();
            const all = Array.isArray(data) ? data : (data?.data || data?.results || []);
            orders = all.filter(
              (o) =>
                (String(o.event) === String(eventId) ||
                  String(o.event_id) === String(eventId)) &&
                o.status !== 'cancelled'
            );
          }
        } catch (_) { /* no data */ }
      }

      const booked = {};
      orders.forEach((order) => {
        if (!order.event_date) return;
        const dateKey = order.event_date.split('T')[0];
        if (!booked[dateKey]) booked[dateKey] = { count: 0, times: [] };
        booked[dateKey].count++;
        const isoTime = order.event_date.includes('T')
          ? order.event_date.split('T')[1]?.substring(0, 5)
          : null;
        const time = isoTime || order.event_time || null;
        if (time && !booked[dateKey].times.includes(time)) {
          booked[dateKey].times.push(time);
        }
      });

      setBookedDates(booked);
    } catch (err) {
      console.warn('EventCalendar: could not fetch bookings', err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchBookedDates();
  }, [fetchBookedDates]);

  // Clicking a day in month/week view jumps into Day view for that exact day
  // and clears any previously selected time.
  const handleDateClick = (date, { jumpToDay = true } = {}) => {
    const str = formatDate(date);
    setSelectedDate(str);
    setSelectedTime('');
    setDayCursor(new Date(date));
    if (jumpToDay) setView(2);
    if (onDateSelect) onDateSelect(str);
  };

  // Clicking an hour in Day view finalises the selection with a time.
  const handleTimeClick = (date, time) => {
    const dateStr = formatDate(date);
    setSelectedDate(dateStr);
    setSelectedTime(time);
    setDayCursor(new Date(date));
    if (onDateSelect) onDateSelect(`${dateStr} ${time}`);
  };

  const getDayStatus = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const dateStr = formatDate(date);
    return {
      isPast: d < today,
      isToday: d.getTime() === today.getTime(),
      isSelected: dateStr === selectedDate,
      bookings: bookedDates[dateStr] || null,
      dateStr,
    };
  };

  // Traditional 6-row, 7-col month grid. Leading and trailing cells fall
  // outside the visible month and render as faint placeholders (matching a
  // printed wall calendar).
  const monthGridCells = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

    const cells = [];
    const cursor = new Date(gridStart);
    for (let i = 0; i < 42; i++) {
      cells.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return cells;
  }, [monthCursor]);

  const currentWeekDays = useMemo(() => {
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [today]);

  const upcomingSlotsForDay = useCallback(
    (day) => TIME_SLOTS.filter((slot) => slotIsUpcoming(slot, day, nowRef)),
    [nowRef]
  );

  const canGoPrevMonth = monthCursor > startOfMonth(today);
  const canGoPrevDay = dayCursor > today;

  const handlePrev = () => {
    if (view === 0) {
      if (!canGoPrevMonth) return;
      const d = new Date(monthCursor);
      d.setMonth(d.getMonth() - 1);
      setMonthCursor(d);
    } else if (view === 2) {
      if (!canGoPrevDay) return;
      const d = new Date(dayCursor);
      d.setDate(d.getDate() - 1);
      setDayCursor(d);
    }
  };

  const handleNext = () => {
    if (view === 0) {
      const d = new Date(monthCursor);
      d.setMonth(d.getMonth() + 1);
      setMonthCursor(d);
    } else if (view === 2) {
      const d = new Date(dayCursor);
      d.setDate(d.getDate() + 1);
      setDayCursor(d);
    }
  };

  const getNavLabel = () => {
    if (view === 0) return `${MONTHS[monthCursor.getMonth()]} ${monthCursor.getFullYear()}`;
    if (view === 1) {
      const f = currentWeekDays[0];
      const l = currentWeekDays[6];
      const sameMonth = f.getMonth() === l.getMonth();
      return sameMonth
        ? `${MONTHS[f.getMonth()]} ${f.getDate()}–${l.getDate()}, ${f.getFullYear()}`
        : `${MONTHS[f.getMonth()]} ${f.getDate()} – ${MONTHS[l.getMonth()]} ${l.getDate()}, ${f.getFullYear()}`;
    }
    return `${DAYS_SHORT[dayCursor.getDay()]}, ${MONTHS[dayCursor.getMonth()]} ${dayCursor.getDate()}, ${dayCursor.getFullYear()}`;
  };

  // ── Traditional printable month grid ────────────────────────────────
  const renderMonthView = () => {
    return (
      <Box
        sx={{
          border: `2px solid ${BRAND_BLUE}`,
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: 'white',
        }}
      >
        {/* Month/year banner */}
        <Box
          sx={{
            textAlign: 'center',
            py: 1.25,
            color: BRAND_BLUE,
          }}
        >
          <Typography
            sx={{
              fontFamily: 'Arial, sans-serif',
              fontWeight: 400,
              fontSize: { xs: '1.6rem', sm: '2rem' },
              letterSpacing: '0.04em',
              color: BRAND_BLUE,
              textTransform: 'uppercase',
            }}
          >
            {MONTHS[monthCursor.getMonth()].toUpperCase()} {monthCursor.getFullYear()}
          </Typography>
        </Box>

        {/* Day-of-week header (blue strip, white text) */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            bgcolor: BRAND_BLUE,
            color: 'white',
          }}
        >
          {DAYS_LONG.map((d) => (
            <Box
              key={d}
              sx={{
                textAlign: 'center',
                py: 0.75,
                borderRight: '1px solid rgba(255,255,255,0.4)',
                '&:last-of-type': { borderRight: 0 },
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
                  fontWeight: 500,
                  textTransform: 'lowercase',
                }}
              >
                {d.toLowerCase()}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* 6 × 7 grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gridAutoRows: 'minmax(72px, 1fr)',
          }}
        >
          {monthGridCells.map((day, idx) => {
            const inMonth = isSameMonth(day, monthCursor);
            const { isPast, isToday, isSelected, bookings } = getDayStatus(day);
            const disabled = !inMonth || isPast;

            const numberColor = disabled ? '#c4c4c4' : BRAND_BLUE;
            let cellBg = 'white';
            if (!disabled && isSelected) cellBg = 'rgba(135,0,58,0.10)';
            else if (!disabled && bookings) cellBg = 'rgba(231,76,60,0.08)';
            else if (disabled) cellBg = '#f7f7f7';

            const rightBorder = idx % 7 === 6 ? 0 : `1px solid ${BRAND_BLUE}`;
            const bottomBorder = idx >= 35 ? 0 : `1px solid ${BRAND_BLUE}`;

            return (
              <Tooltip
                key={`day-${idx}`}
                title={
                  disabled
                    ? isPast ? 'Past date' : ''
                    : bookings
                    ? `${bookings.count} booking${bookings.count > 1 ? 's' : ''}`
                    : 'Available'
                }
                arrow
                disableHoverListener={disabled}
              >
                <Box
                  onClick={() => !disabled && handleDateClick(day)}
                  sx={{
                    position: 'relative',
                    bgcolor: cellBg,
                    borderRight: rightBorder,
                    borderBottom: bottomBorder,
                    cursor: disabled ? 'default' : 'pointer',
                    transition: 'background-color 0.15s',
                    '&:hover': !disabled ? { bgcolor: 'rgba(135,0,58,0.06)' } : {},
                    outline: isToday && !isSelected ? `2px solid ${BRAND}` : 'none',
                    outlineOffset: '-2px',
                    px: 0.75,
                    py: 0.75,
                  }}
                >
                  {inMonth && (
                    <Typography
                      sx={{
                        fontFamily: 'Arial, sans-serif',
                        fontWeight: 500,
                        fontSize: '0.95rem',
                        color: isSelected ? BRAND : numberColor,
                        lineHeight: 1,
                      }}
                    >
                      {day.getDate()}
                    </Typography>
                  )}
                  {!disabled && bookings && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: '#e74c3c',
                      }}
                    />
                  )}
                  {!disabled && isSelected && (
                    <Chip
                      label="Selected"
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: 4,
                        right: 4,
                        height: 16,
                        fontSize: '0.6rem',
                        bgcolor: BRAND,
                        color: 'white',
                        '& .MuiChip-label': { px: 0.5 },
                      }}
                    />
                  )}
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      </Box>
    );
  };

  // ── Week view: just the 7 weekday columns, no time grid ─────────────
  const renderWeekView = () => {
    return (
      <Box
        sx={{
          border: `2px solid ${BRAND_BLUE}`,
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: 'white',
        }}
      >
        {/* Day-of-week header */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            bgcolor: BRAND_BLUE,
            color: 'white',
          }}
        >
          {DAYS_LONG.map((d) => (
            <Box
              key={d}
              sx={{
                textAlign: 'center',
                py: 0.75,
                borderRight: '1px solid rgba(255,255,255,0.4)',
                '&:last-of-type': { borderRight: 0 },
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
                  fontWeight: 500,
                  textTransform: 'lowercase',
                }}
              >
                {d.toLowerCase()}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* The 7 day cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gridAutoRows: 'minmax(120px, 1fr)',
          }}
        >
          {currentWeekDays.map((day, idx) => {
            const { isPast, isToday, isSelected, bookings } = getDayStatus(day);
            const disabled = isPast;

            let cellBg = 'white';
            if (!disabled && isSelected) cellBg = 'rgba(135,0,58,0.10)';
            else if (!disabled && bookings) cellBg = 'rgba(231,76,60,0.08)';
            else if (disabled) cellBg = '#f7f7f7';

            return (
              <Box
                key={idx}
                onClick={() => !disabled && handleDateClick(day)}
                sx={{
                  position: 'relative',
                  bgcolor: cellBg,
                  borderRight: idx === 6 ? 0 : `1px solid ${BRAND_BLUE}`,
                  cursor: disabled ? 'default' : 'pointer',
                  transition: 'background-color 0.15s',
                  '&:hover': !disabled ? { bgcolor: 'rgba(135,0,58,0.06)' } : {},
                  outline: isToday && !isSelected ? `2px solid ${BRAND}` : 'none',
                  outlineOffset: '-2px',
                  px: 1,
                  py: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: 500,
                    fontSize: '1.2rem',
                    color: disabled ? '#c4c4c4' : BRAND_BLUE,
                    lineHeight: 1,
                  }}
                >
                  {day.getDate()}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: disabled ? '#bdbdbd' : 'text.secondary', mt: 0.25 }}
                >
                  {MONTHS[day.getMonth()].slice(0, 3)}
                </Typography>
                <Box flex={1} />
                {disabled ? (
                  <Chip
                    label="Past"
                    size="small"
                    sx={{ bgcolor: '#bdbdbd', color: 'white', height: 18, fontSize: '0.65rem', alignSelf: 'flex-start' }}
                  />
                ) : bookings ? (
                  <Chip
                    label={`${bookings.count} booking${bookings.count > 1 ? 's' : ''}`}
                    size="small"
                    sx={{ bgcolor: '#e74c3c', color: 'white', height: 18, fontSize: '0.65rem', alignSelf: 'flex-start' }}
                  />
                ) : (
                  <Chip
                    label="Available"
                    size="small"
                    sx={{ bgcolor: '#27ae60', color: 'white', height: 18, fontSize: '0.65rem', alignSelf: 'flex-start' }}
                  />
                )}
                {isToday && (
                  <Chip
                    label="Today"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      height: 16,
                      fontSize: '0.6rem',
                      bgcolor: BRAND,
                      color: 'white',
                      '& .MuiChip-label': { px: 0.5 },
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  // ── Day view: single day + its upcoming hours ───────────────────────
  const renderDayView = () => {
    const dateStr = formatDate(dayCursor);
    const bookings = bookedDates[dateStr];
    const slots = upcomingSlotsForDay(dayCursor);

    return (
      <Box
        sx={{
          border: `2px solid ${BRAND_BLUE}`,
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: 'white',
        }}
      >
        {/* Single day header */}
        <Box
          sx={{
            bgcolor: BRAND_BLUE,
            color: 'white',
            textAlign: 'center',
            py: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.85rem' },
              textTransform: 'lowercase',
              fontWeight: 500,
            }}
          >
            {DAYS_LONG[dayCursor.getDay()].toLowerCase()}
          </Typography>
        </Box>

        {/* Big day number */}
        <Box sx={{ textAlign: 'center', py: 2, borderBottom: `1px solid ${BRAND_BLUE}` }}>
          <Typography
            sx={{
              fontFamily: 'Arial, sans-serif',
              fontWeight: 400,
              fontSize: { xs: '2.2rem', sm: '2.8rem' },
              color: BRAND_BLUE,
              lineHeight: 1,
            }}
          >
            {dayCursor.getDate()}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}
          >
            {MONTHS[dayCursor.getMonth()]} {dayCursor.getFullYear()}
          </Typography>
          <Box mt={1}>
            {bookings ? (
              <Chip
                label={`${bookings.count} booking${bookings.count > 1 ? 's' : ''}`}
                size="small"
                sx={{ bgcolor: '#e74c3c', color: 'white', height: 20 }}
              />
            ) : (
              <Chip
                label="Available"
                size="small"
                sx={{ bgcolor: '#27ae60', color: 'white', height: 20 }}
              />
            )}
          </Box>
        </Box>

        {/* Upcoming hours list */}
        <Box sx={{ p: 1.5 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            display="block"
            mb={1}
            sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}
          >
            Upcoming hours
          </Typography>

          {slots.length === 0 ? (
            <Box
              p={2}
              borderRadius={2}
              bgcolor="#fafafa"
              border="1px dashed #e0e0e0"
              textAlign="center"
            >
              <Typography variant="body2" color="text.secondary">
                No more hours available today. Try tomorrow.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
                gap: 1,
              }}
            >
              {slots.map((time) => {
                const isBooked = bookings?.times?.includes(time);
                const isSlotSelected =
                  selectedDate === formatDate(dayCursor) && selectedTime === time;
                return (
                  <Box
                    key={time}
                    onClick={() => {
                      if (!isBooked) handleTimeClick(dayCursor, time);
                    }}
                    sx={{
                      p: 1.25,
                      borderRadius: 1.5,
                      textAlign: 'center',
                      bgcolor: isSlotSelected
                        ? BRAND
                        : isBooked
                        ? 'rgba(231,76,60,0.08)'
                        : 'rgba(39,174,96,0.08)',
                      border: '1px solid',
                      borderColor: isSlotSelected
                        ? BRAND
                        : isBooked
                        ? 'rgba(231,76,60,0.3)'
                        : 'rgba(39,174,96,0.3)',
                      cursor: isBooked ? 'default' : 'pointer',
                      transition: 'all 0.15s',
                      '&:hover': !isBooked && !isSlotSelected
                        ? { bgcolor: 'rgba(135,0,58,0.08)', borderColor: BRAND }
                        : {},
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ color: isSlotSelected ? 'white' : BRAND_BLUE }}
                    >
                      {time}
                    </Typography>
                    <Chip
                      label={isSlotSelected ? 'Selected' : isBooked ? 'Booked' : 'Open'}
                      size="small"
                      sx={{
                        mt: 0.5,
                        height: 16,
                        fontSize: '0.6rem',
                        bgcolor: isSlotSelected
                          ? 'rgba(255,255,255,0.25)'
                          : isBooked
                          ? '#e74c3c'
                          : '#27ae60',
                        color: 'white',
                        '& .MuiChip-label': { px: 0.5 },
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  const prevDisabled =
    (view === 0 && !canGoPrevMonth) || view === 1 || (view === 2 && !canGoPrevDay);
  const nextHidden = view === 1;

  return (
    <Box>
      {/* Top nav row with chevrons + label (kept above the printable card) */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
        <IconButton
          onClick={handlePrev}
          size="small"
          disabled={prevDisabled}
          sx={{ color: BRAND, visibility: view === 1 ? 'hidden' : 'visible' }}
        >
          <ChevronLeft />
        </IconButton>
        <Typography variant="subtitle1" fontWeight={700}>
          {getNavLabel()}
        </Typography>
        <IconButton
          onClick={handleNext}
          size="small"
          sx={{ color: BRAND, visibility: nextHidden ? 'hidden' : 'visible' }}
        >
          <ChevronRight />
        </IconButton>
      </Box>

      <Tabs
        value={view}
        onChange={(_, v) => setView(v)}
        centered
        sx={{
          mb: 2,
          minHeight: 36,
          '& .MuiTab-root': { minHeight: 36, py: 0.5, fontSize: '0.8rem' },
          '& .MuiTabs-indicator': { bgcolor: BRAND },
          '& .Mui-selected': { color: `${BRAND} !important` },
        }}
      >
        <Tab label="Month" />
        <Tab label="Week" />
        <Tab label="Day" />
      </Tabs>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={24} sx={{ color: BRAND }} />
        </Box>
      ) : (
        <>
          {view === 0 && renderMonthView()}
          {view === 1 && renderWeekView()}
          {view === 2 && renderDayView()}
        </>
      )}

      {/* Legend */}
      <Box display="flex" gap={2} mt={2} flexWrap="wrap">
        {[
          { color: '#27ae60', label: 'Available' },
          { color: '#e74c3c', label: 'Booked' },
          { color: BRAND, label: 'Selected' },
          { color: 'white', border: `2px solid ${BRAND}`, label: 'Today' },
        ].map(({ color, border, label }) => (
          <Box key={label} display="flex" alignItems="center" gap={0.5}>
            <Box
              sx={{
                width: 11,
                height: 11,
                borderRadius: '50%',
                bgcolor: color,
                border: border || 'none',
                flexShrink: 0,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
          </Box>
        ))}
      </Box>

      {selectedDate && (
        <Box
          mt={2}
          p={1.5}
          borderRadius={2}
          bgcolor="rgba(135,0,58,0.05)"
          border="1px solid rgba(135,0,58,0.2)"
        >
          <Typography variant="body2" sx={{ color: BRAND, fontWeight: 600 }}>
            Selected: {selectedDate}
            {selectedTime ? ` · ${selectedTime}` : ''}
          </Typography>
          {!selectedTime && view === 2 && (
            <Typography variant="caption" color="text.secondary">
              Pick an hour below to finish your selection
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default EventCalendar;
