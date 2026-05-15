import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Rating,
  TextField,
  Alert,
  Stack,
  CircularProgress,
  Divider,
  LinearProgress,
  Avatar,
  Chip,
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import reviewsApi from '../services/reviewsApi';

const formatDate = (raw) => {
  if (!raw) return '';
  try {
    return new Date(raw).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return raw;
  }
};

const ReviewForm = ({ onSubmit, submitting }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ rating, comment: comment.trim() });
    setRating(5);
    setComment('');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
        <Typography variant="body2" fontWeight={600}>Your rating:</Typography>
        <Rating
          value={rating}
          onChange={(_, v) => v && setRating(v)}
          precision={1}
        />
        <Typography variant="caption" color="text.secondary">{rating}/5</Typography>
      </Box>

      <TextField
        label="Your review"
        size="small"
        multiline
        minRows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button
          type="submit"
          size="small"
          variant="contained"
          disabled={submitting}
          sx={{ bgcolor: '#87003A', '&:hover': { bgcolor: '#3d000f' } }}
        >
          {submitting ? <CircularProgress size={16} sx={{ color: 'white' }} /> : 'Submit review'}
        </Button>
      </Stack>
    </Box>
  );
};

const RatingSummary = ({ summary }) => {
  if (!summary || summary.rating_count === 0) return null;
  const total = summary.rating_count;
  return (
    <Card sx={{ borderRadius: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', mb: 2 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', sm: 'center' }}>
          <Box sx={{ textAlign: 'center', minWidth: 110 }}>
            <Typography variant="h3" fontWeight={700} color="#87003A" sx={{ lineHeight: 1 }}>
              {summary.average_rating.toFixed(1)}
            </Typography>
            <Rating value={summary.average_rating} precision={0.1} readOnly size="small" sx={{ mt: 0.5 }} />
            <Typography variant="caption" color="text.secondary" display="block">
              {total} review{total === 1 ? '' : 's'}
            </Typography>
          </Box>

          <Box sx={{ flex: 1, minWidth: 200, width: '100%' }}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = summary.distribution[star] || 0;
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <Box key={star} display="flex" alignItems="center" gap={1} mb={0.4}>
                  <Typography variant="caption" sx={{ width: 14 }}>{star}</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{
                      flex: 1,
                      height: 8,
                      borderRadius: 1,
                      bgcolor: 'rgba(0,0,0,0.06)',
                      '& .MuiLinearProgress-bar': { bgcolor: '#ffc107' },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ width: 28, textAlign: 'right' }}>
                    {count}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const ReviewCard = ({ review }) => {
  const name = review.customer_name || 'Customer';
  const initials = name.split(' ').filter(Boolean).map((s) => s[0]).slice(0, 2).join('').toUpperCase();

  return (
    <Card sx={{ borderRadius: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', mb: 1.5 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" spacing={1.5}>
          <Avatar sx={{ bgcolor: '#87003A', width: 40, height: 40 }}>{initials || '?'}</Avatar>
          <Box flex={1} minWidth={0}>
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <Typography variant="subtitle2" fontWeight={700}>{name}</Typography>
              <Chip
                size="small"
                label={`${review.rating}/5`}
                sx={{ bgcolor: 'rgba(255,193,7,0.15)', color: '#b8860b', fontWeight: 600, height: 22 }}
              />
            </Box>
            <Box display="flex" alignItems="center" gap={1} mt={0.25}>
              <Rating value={review.rating} readOnly size="small" />
              <Typography variant="caption" color="text.secondary">{formatDate(review.created_at)}</Typography>
            </Box>
            {review.comment && (
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', mt: 0.75 }}>
                {review.comment}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const EventReviews = ({ eventId }) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isLoggedIn = Boolean(isAuthenticated && user);

  const loadAll = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    setError('');
    try {
      const list = await reviewsApi.listForEvent(eventId);
      setReviews(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const summary = useMemo(() => {
    const count = reviews.length;
    if (count === 0) {
      return { average_rating: 0, rating_count: 0, distribution: {} };
    }
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    const distribution = reviews.reduce((acc, r) => {
      acc[r.rating] = (acc[r.rating] || 0) + 1;
      return acc;
    }, {});
    return {
      average_rating: sum / count,
      rating_count: count,
      distribution,
    };
  }, [reviews]);

  const handleSubmitReview = async (values) => {
    if (!isLoggedIn) return;
    setSubmitting(true);
    setError('');
    try {
      const saved = await reviewsApi.create(eventId, values);
      setReviews((prev) => [saved, ...prev]);
    } catch (e) {
      setError(e.message || 'Failed to save review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card sx={{ borderRadius: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', mb: 2 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5} flexWrap="wrap" gap={1}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 3, height: 18, bgcolor: '#87003A', borderRadius: '2px' }} />
            Reviews ({summary.rating_count})
          </Typography>
        </Box>

        <RatingSummary summary={summary} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>
        )}

        {isLoggedIn ? (
          <Box sx={{ mb: 2, p: 1.5, border: '1px dashed rgba(135,0,58,0.4)', borderRadius: 2 }}>
            <Typography variant="body2" fontWeight={700} mb={1}>Write a review</Typography>
            <ReviewForm onSubmit={handleSubmitReview} submitting={submitting} />
          </Box>
        ) : (
          <Alert severity="info" icon={<LoginIcon fontSize="small" />} sx={{ mb: 2 }}>
            Log in to share your experience.
          </Alert>
        )}

        <Divider sx={{ mb: 1.5 }} />

        {loading ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress size={28} />
          </Box>
        ) : reviews.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
            No reviews yet. Be the first to share your experience!
          </Typography>
        ) : (
          reviews.map((review) => <ReviewCard key={review.id} review={review} />)
        )}
      </CardContent>
    </Card>
  );
};

export default EventReviews;
