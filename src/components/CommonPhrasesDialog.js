import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Tooltip,
  Fade,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  VolumeUp as SpeakIcon,
  Translate as TranslateIcon,
} from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';

const PHRASES = [
  {
    key: 'hello',
    ka: 'გამარჯობა',
    romanized: 'Gamarjoba',
    labels: { en: 'Hello', ru: 'Привет', he: 'שלום', hi: 'नमस्ते', ka: 'გამარჯობა' },
  },
  {
    key: 'thanks',
    ka: 'გმადლობთ',
    romanized: 'Gmadlobt',
    labels: { en: 'Thank you', ru: 'Спасибо', he: 'תודה', hi: 'धन्यवाद', ka: 'გმადლობთ' },
  },
  {
    key: 'yes',
    ka: 'კი',
    romanized: 'Ki',
    labels: { en: 'Yes', ru: 'Да', he: 'כן', hi: 'हाँ', ka: 'დიახ' },
  },
  {
    key: 'no',
    ka: 'არა',
    romanized: 'Ara',
    labels: { en: 'No', ru: 'Нет', he: 'לא', hi: 'नहीं', ka: 'არა' },
  },
  {
    key: 'please',
    ka: 'გთხოვთ',
    romanized: 'Gtxovt',
    labels: { en: 'Please', ru: 'Пожалуйста', he: 'בבקשה', hi: 'कृपया', ka: 'გთხოვთ' },
  },
  {
    key: 'sorry',
    ka: 'უკაცრავად',
    romanized: 'Ukatsravad',
    labels: { en: 'Sorry', ru: 'Извините', he: 'סליחה', hi: 'माफ़ करें', ka: 'უკაცრავად' },
  },
  {
    key: 'help',
    ka: 'დახმარება',
    romanized: 'Daxmareba',
    labels: { en: 'Help', ru: 'Помогите', he: 'עזרה', hi: 'मदद', ka: 'დახმარება' },
  },
  {
    key: 'goodbye',
    ka: 'ნახვამდის',
    romanized: 'Nakhvamdis',
    labels: { en: 'Goodbye', ru: 'До свидания', he: 'להתראות', hi: 'अलविदा', ka: 'ნახვამდის' },
  },
];

const HEADINGS = {
  en: { title: 'Common Georgian Phrases', subtitle: 'Tap a phrase to hear or copy it' },
  ru: { title: 'Полезные грузинские фразы', subtitle: 'Нажмите, чтобы услышать или скопировать' },
  he: { title: 'ביטויים שימושיים בגאורגית', subtitle: 'הקישו כדי להשמיע או להעתיק' },
  hi: { title: 'सामान्य जॉर्जियन वाक्यांश', subtitle: 'सुनने या कॉपी करने के लिए टैप करें' },
  ka: { title: 'ხშირად გამოყენებული ფრაზები', subtitle: 'დააჭირე მოსასმენად ან დასაკოპირებლად' },
};

const CommonPhrasesDialog = ({ open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { language } = useLanguage();
  const [copiedKey, setCopiedKey] = useState(null);
  const [speakingKey, setSpeakingKey] = useState(null);

  const lang = HEADINGS[language] ? language : 'en';
  const heading = HEADINGS[lang];

  const handleCopy = async (phrase) => {
    const text = `${phrase.ka} (${phrase.romanized})`;
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedKey(phrase.key);
    setTimeout(() => setCopiedKey((k) => (k === phrase.key ? null : k)), 1600);
  };

  const handleSpeak = (phrase) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(phrase.ka);
      utter.lang = 'ka-GE';
      utter.rate = 0.9;
      utter.onend = () => setSpeakingKey(null);
      utter.onerror = () => setSpeakingKey(null);
      setSpeakingKey(phrase.key);
      window.speechSynthesis.speak(utter);
    } catch (err) {
      setSpeakingKey(null);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={260}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 4 },
          overflow: 'hidden',
          background: '#fff',
          boxShadow: '0 30px 80px rgba(135,0,58,0.25)',
          mt: { xs: '52px', sm: 0 },
          maxHeight: { xs: 'calc(100% - 52px)', sm: '90vh' },
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          background: 'linear-gradient(135deg, #87003A 0%, #c1004f 60%, #FFC107 140%)',
          color: '#fff',
          px: { xs: 2.5, sm: 4 },
          pt: { xs: 3, sm: 3.5 },
          pb: { xs: 3.5, sm: 4 },
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -60,
            right: -60,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -40,
            left: -40,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,193,7,0.25), transparent 70%)',
          },
        }}
      >
        <IconButton
          onClick={onClose}
          aria-label="close"
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            color: '#fff',
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(6px)',
            '&:hover': { background: 'rgba(255,255,255,0.22)' },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            <TranslateIcon sx={{ fontSize: 24, color: '#fff' }} />
          </Box>
          <DialogTitle
            sx={{
              p: 0,
              fontSize: { xs: '1.15rem', sm: '1.4rem' },
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.2,
            }}
          >
            {heading.title}
          </DialogTitle>
        </Box>
        <Typography
          variant="body2"
          sx={{ position: 'relative', opacity: 0.92, fontSize: '0.875rem' }}
        >
          {heading.subtitle}
        </Typography>
      </Box>

      <DialogContent
        sx={{
          p: { xs: 1.5, sm: 2.5 },
          background: 'linear-gradient(180deg, #fff, #fdf6f9)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {PHRASES.map((phrase, idx) => {
            const native = phrase.labels[lang] || phrase.labels.en;
            const isCopied = copiedKey === phrase.key;
            const isSpeaking = speakingKey === phrase.key;

            return (
              <Box
                key={phrase.key}
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 3,
                  background: '#fff',
                  border: '1px solid rgba(135,0,58,0.08)',
                  transition: 'all 0.25s ease',
                  animation: `phraseFadeIn 380ms ease both`,
                  animationDelay: `${idx * 50}ms`,
                  '@keyframes phraseFadeIn': {
                    from: { opacity: 0, transform: 'translateY(8px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                  },
                  '&:hover': {
                    borderColor: 'rgba(135,0,58,0.25)',
                    boxShadow: '0 6px 18px rgba(135,0,58,0.10)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                <Box
                  sx={{
                    minWidth: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #87003A, #c1004f)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 10px rgba(135,0,58,0.3)',
                  }}
                >
                  {idx + 1}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.72rem',
                      textTransform: 'uppercase',
                      letterSpacing: 0.6,
                      fontWeight: 600,
                    }}
                  >
                    {native}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: '1rem', sm: '1.15rem' },
                      fontWeight: 700,
                      color: '#87003A',
                      lineHeight: 1.2,
                      mt: 0.25,
                      wordBreak: 'break-word',
                    }}
                  >
                    {phrase.ka}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.8rem',
                      color: 'text.secondary',
                      fontStyle: 'italic',
                      mt: 0.25,
                    }}
                  >
                    {phrase.romanized}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                 
                  <Tooltip title={isCopied ? 'Copied!' : 'Copy'} placement="left" arrow>
                    <IconButton
                      onClick={() => handleCopy(phrase)}
                      size="small"
                      sx={{
                        color: isCopied ? '#2e7d32' : '#87003A',
                        background: isCopied ? 'rgba(46,125,50,0.12)' : 'rgba(135,0,58,0.06)',
                        '&:hover': {
                          background: isCopied
                            ? 'rgba(46,125,50,0.18)'
                            : 'rgba(135,0,58,0.14)',
                        },
                      }}
                    >
                      {isCopied ? (
                        <CheckIcon fontSize="small" />
                      ) : (
                        <CopyIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            );
          })}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CommonPhrasesDialog;
