import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowBack,
  ArrowForward,
  CheckCircle,
} from '@mui/icons-material';

const FirstTimeGuide = ({ open, onClose, steps, onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [targetElement, setTargetElement] = useState(null);

  useEffect(() => {
    if (open && steps && steps.length > 0) {
      setActiveStep(0);
      highlightTarget(steps[0]);
    }
  }, [open, steps]);

  useEffect(() => {
    if (open && steps && steps[activeStep]) {
      highlightTarget(steps[activeStep]);
    }
  }, [activeStep, open, steps]);

  const highlightTarget = (step) => {
    if (step.target) {
      const element = document.querySelector(step.target);
      if (element) {
        setTargetElement(element);
        // For fixed elements (like sidebar), don't scroll, just highlight
        const isFixed = window.getComputedStyle(element).position === 'fixed';
        if (!isFixed) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        // Add highlight class
        element.style.transition = 'all 0.3s ease';
        element.style.boxShadow = '0 0 0 4px rgba(135, 0, 58, 0.5), 0 0 20px rgba(135, 0, 58, 0.3)';
        element.style.zIndex = '13001';
        // Add a pulsing animation for buttons
        if (element.tagName === 'BUTTON' || element.querySelector('button')) {
          element.style.animation = 'pulse 2s infinite';
        }
      }
    }
  };

  const removeHighlight = () => {
    if (targetElement) {
      targetElement.style.boxShadow = '';
      targetElement.style.zIndex = '';
      targetElement.style.animation = '';
    }
  };

  const handleNext = () => {
    removeHighlight();
    if (activeStep === steps.length - 1) {
      handleComplete();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    removeHighlight();
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleComplete = () => {
    removeHighlight();
    if (onComplete) {
      onComplete();
    }
    onClose();
  };

  const handleSkip = () => {
    removeHighlight();
    if (onComplete) {
      onComplete();
    }
    onClose();
  };

  if (!open || !steps || steps.length === 0) return null;

  const currentStep = steps[activeStep];

  return (
    <>
      {/* Add pulse animation style */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }
        `}
      </style>
      {/* Overlay */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 14000,
          pointerEvents: 'none',
        }}
      />

      {/* Guide Dialog */}
      <Dialog
        open={open}
        onClose={handleSkip}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            position: 'fixed',
            zIndex: 15000,
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            ...(currentStep?.position === 'top' && { bottom: 'auto', top: '20px' }),
            ...(currentStep?.position === 'bottom' && { top: 'auto', bottom: '20px' }),
            ...(currentStep?.position === 'left' && { right: 'auto', left: '20px' }),
            ...(currentStep?.position === 'right' && { left: 'auto', right: '20px' }),
          },
        }}
        sx={{
          zIndex: 15000,
          '& .MuiBackdrop-root': {
            backgroundColor: 'transparent',
            zIndex: 14000,
          },
        }}
      >
        <Paper
          sx={{
            p: 3,
            background: 'linear-gradient(135deg, #87003A 0%, #a0004a 100%)',
            color: 'white',
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                Welcome to Funfinder! 👋
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Step {activeStep + 1} of {steps.length}
              </Typography>
            </Box>
            <IconButton
              onClick={handleSkip}
              sx={{
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Progress Stepper */}
          <Box sx={{ mb: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((step, index) => (
                <Step key={index}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: index <= activeStep ? 'white' : 'rgba(255, 255, 255, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: index <= activeStep ? '#87003A' : 'white',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        {index < activeStep ? <CheckCircle sx={{ fontSize: 20 }} /> : index + 1}
                      </Box>
                    )}
                  />
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Content */}
          <DialogContent sx={{ p: 0, mb: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>
              {currentStep?.title}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.95, lineHeight: 1.7 }}>
              {currentStep?.content}
            </Typography>
            {currentStep?.image && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <img
                  src={currentStep.image}
                  alt={currentStep.title}
                  style={{ maxWidth: '100%', borderRadius: 8 }}
                />
              </Box>
            )}
          </DialogContent>

          {/* Actions */}
          <DialogActions sx={{ p: 0, justifyContent: 'space-between' }}>
            <Button
              onClick={handleSkip}
              sx={{
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
              }}
            >
              Skip Tour
            </Button>
            <Box>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<ArrowBack />}
                sx={{
                  color: 'white',
                  mr: 1,
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                  '&.Mui-disabled': { color: 'rgba(255, 255, 255, 0.5)' },
                }}
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                variant="contained"
                endIcon={activeStep === steps.length - 1 ? <CheckCircle /> : <ArrowForward />}
                sx={{
                  backgroundColor: 'white',
                  color: '#87003A',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  },
                }}
              >
                {activeStep === steps.length - 1 ? 'Get Started' : 'Next'}
              </Button>
            </Box>
          </DialogActions>
        </Paper>
      </Dialog>
    </>
  );
};

export default FirstTimeGuide;

