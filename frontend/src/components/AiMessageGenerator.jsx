import React, { useState } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Card, CardContent,
  Chip, Grid, CircularProgress, Alert, IconButton, Tooltip
} from '@mui/material';
import { 
  Psychology, AutoAwesome, ThumbUp, ContentCopy, 
  Refresh, TrendingUp 
} from '@mui/icons-material';
import { aiService } from '../services/aiService';

export default function AiMessageGenerator({ onMessageSelect, audienceInfo }) {
  const [objective, setObjective] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const handleGenerateMessages = async () => {
    if (!objective.trim()) return;
    
    setIsGenerating(true);
    try {
      const messageSuggestions = await aiService.generateMessageSuggestions(
        objective, 
        audienceInfo
      );
      setSuggestions(messageSuggestions);
    } catch (error) {
      console.error('Message generation error:', error);
      setSuggestions([
        {
          message: "We have something special waiting for you!",
          tone: "friendly",
          confidence: 0.5
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectMessage = (message, index) => {
    setSelectedMessage(index);
    if (onMessageSelect) {
      onMessageSelect(message.message);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getObjectiveOptions = () => [
    'win-back',
    'promotional', 
    'engagement',
    'welcome',
    'retention'
  ];

  const getToneColor = (tone) => {
    const colors = {
      'premium': 'purple',
      'promotional': 'orange', 
      'friendly': 'blue',
      'nostalgic': 'green',
      'positive': 'success',
      'neutral': 'grey'
    };
    return colors[tone] || 'primary';
  };

  return (
    <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center' }}>
          <Psychology sx={{ mr: 1 }} />
          AI-Powered Message Generation
        </Typography>

        {/* Campaign Objective Input */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Campaign Objective"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="e.g., 'bring back inactive users' or 'promote new products'"
            variant="outlined"
            sx={{ 
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                borderRadius: 2
              },
              '& .MuiInputLabel-root': {
                backgroundColor: 'white',
                px: 1,
                borderRadius: 1
              }
            }}
          />
          
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2" sx={{ color: 'white', mr: 1 }}>
              Quick options:
            </Typography>
            {getObjectiveOptions().map((option) => (
              <Chip
                key={option}
                label={option}
                variant="outlined"
                size="small"
                onClick={() => setObjective(option)}
                sx={{ 
                  color: 'white', 
                  borderColor: 'white',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Generate Button */}
        <Button
          variant="contained"
          onClick={handleGenerateMessages}
          disabled={isGenerating || !objective.trim()}
          startIcon={isGenerating ? <CircularProgress size={20} /> : <AutoAwesome />}
          sx={{ 
            mb: 3, 
            backgroundColor: 'white', 
            color: 'primary.main',
            '&:hover': { backgroundColor: 'grey.100' }
          }}
        >
          {isGenerating ? 'Generating Messages...' : 'Generate AI Messages'}
        </Button>

        {/* Generated Messages */}
        {suggestions.length > 0 && (
          <Box>
            <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
              AI Generated Messages:
            </Typography>
            <Grid container spacing={2}>
              {suggestions.map((suggestion, index) => (
                <Grid item xs={12} key={index}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      cursor: 'pointer',
                      border: selectedMessage === index ? '2px solid' : '1px solid transparent',
                      borderColor: selectedMessage === index ? 'success.main' : 'transparent',
                      '&:hover': { boxShadow: 3 }
                    }}
                    onClick={() => handleSelectMessage(suggestion, index)}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" gutterBottom>
                          "{suggestion.message}"
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                          <Chip 
                            label={`${suggestion.tone} tone`} 
                            size="small" 
                            color={getToneColor(suggestion.tone)}
                          />
                          <Chip 
                            label={`${Math.round(suggestion.confidence * 100)}% confidence`} 
                            size="small" 
                            variant="outlined"
                          />
                          {selectedMessage === index && (
                            <Chip 
                              label="Selected" 
                              size="small" 
                              color="success"
                              icon={<ThumbUp />}
                            />
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Tooltip title="Copy message">
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(suggestion.message);
                            }}
                          >
                            <ContentCopy />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            
            {/* Regenerate Button */}
            <Button
              variant="outlined"
              onClick={handleGenerateMessages}
              disabled={isGenerating}
              startIcon={<Refresh />}
              sx={{ 
                mt: 2, 
                color: 'white', 
                borderColor: 'white',
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderColor: 'white'
                }
              }}
            >
              Generate New Variants
            </Button>
          </Box>
        )}

        {/* Audience Info Display */}
        {audienceInfo && (
          <Alert 
            severity="info" 
            sx={{ mt: 2, backgroundColor: 'rgba(255,255,255,0.9)' }}
            icon={<TrendingUp />}
          >
            <Typography variant="body2">
              Targeting {audienceInfo.size || 'unknown'} customers based on your segment rules.
              Messages are optimized for this audience size and characteristics.
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}