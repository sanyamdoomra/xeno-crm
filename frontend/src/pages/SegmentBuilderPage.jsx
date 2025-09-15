import React, { useState } from 'react';
import { 
  Box, Button, Typography, Paper, TextField, Alert, 
  Card, CardContent, Chip, Divider, CircularProgress,
  InputAdornment, IconButton, Tooltip
} from '@mui/material';
import { AutoFixHigh, Psychology, Lightbulb } from '@mui/icons-material';
import RuleBuilder from '../ui/RuleBuilder';
import { aiService } from '../services/aiService';
import axios from 'axios';

export default function SegmentBuilderPage() {
  const [rules, setRules] = useState([]);
  const [logic, setLogic] = useState('AND');
  const [audienceSize, setAudienceSize] = useState(null);
  const [segmentName, setSegmentName] = useState('');
  
  // AI-powered natural language state
  const [naturalLanguagePrompt, setNaturalLanguagePrompt] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);

  const handlePreview = async () => {
    const payload = { rules, logic };
    if (segmentName) payload.name = segmentName;
    const res = await axios.post('http://localhost:4000/api/segments', payload);
    setAudienceSize(res.data.audienceSize);
  };

  const handleSave = async () => {
    const payload = { rules, logic };
    if (segmentName) payload.name = segmentName;
    await axios.post('http://localhost:4000/api/segments', payload);
    window.location.href = '/campaigns';
  };

  // AI-powered natural language processing
  const handleAiProcessing = async () => {
    if (!naturalLanguagePrompt.trim()) return;
    
    setAiProcessing(true);
    setAiResults(null);
    
    try {
      const result = await aiService.parseNaturalLanguageToRules(naturalLanguagePrompt);
      setAiResults(result);
      setShowAiSuggestions(true);
    } catch (error) {
      console.error('AI processing error:', error);
      setAiResults({ 
        error: 'AI processing failed. Please try again.', 
        rules: [], 
        confidence: 0 
      });
      setShowAiSuggestions(true);
    } finally {
      setAiProcessing(false);
    }
  };

  const acceptAiSuggestions = () => {
    if (aiResults && aiResults.rules.length > 0) {
      setRules(aiResults.rules);
      setShowAiSuggestions(false);
      setNaturalLanguagePrompt('');
    }
  };

  const getExamplePrompts = () => [
    "People who haven't shopped in 6 months and spent over ₹5K",
    "Customers with more than 3 visits who are frequent buyers",
    "New customers who made their first purchase recently",
    "High-value customers who spent over ₹10K last year"
  ];

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3} sx={{ display: 'flex', alignItems: 'center' }}>
        <Psychology sx={{ mr: 2 }} />
        AI-Powered Audience Segmentation
      </Typography>
      
      {/* AI Natural Language Input Section */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center' }}>
            <AutoFixHigh sx={{ mr: 1 }} />
            Describe Your Audience in Natural Language
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={naturalLanguagePrompt}
            onChange={(e) => setNaturalLanguagePrompt(e.target.value)}
            placeholder="e.g., 'People who haven't shopped in 6 months and spent over ₹5K'"
            variant="outlined"
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                borderRadius: 2
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Process with AI">
                    <IconButton 
                      onClick={handleAiProcessing} 
                      disabled={aiProcessing || !naturalLanguagePrompt.trim()}
                      sx={{ color: 'primary.main' }}
                    >
                      {aiProcessing ? <CircularProgress size={24} /> : <Psychology />}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              )
            }}
          />
          
          {/* Example Prompts */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2" sx={{ color: 'white', mr: 1 }}>
              Try these examples:
            </Typography>
            {getExamplePrompts().map((example, index) => (
              <Chip
                key={index}
                label={example}
                variant="outlined"
                size="small"
                onClick={() => setNaturalLanguagePrompt(example)}
                sx={{ 
                  color: 'white', 
                  borderColor: 'white',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* AI Results Display */}
      {showAiSuggestions && aiResults && (
        <Alert 
          severity={aiResults.rules.length > 0 ? "success" : "warning"} 
          sx={{ mb: 3 }}
          action={
            aiResults.rules.length > 0 && (
              <Button color="inherit" onClick={acceptAiSuggestions}>
                Apply Rules
              </Button>
            )
          }
        >
          {aiResults.error ? (
            <Typography>{aiResults.error}</Typography>
          ) : (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                AI Analysis Results (Confidence: {Math.round(aiResults.confidence * 100)}%)
              </Typography>
              <Typography variant="body2" gutterBottom>
                Intent: <Chip label={aiResults.intent} size="small" />
              </Typography>
              {aiResults.rules.length > 0 ? (
                <Box>
                  <Typography variant="body2">Generated {aiResults.rules.length} rule(s):</Typography>
                  {aiResults.rules.map((rule, index) => (
                    <Chip 
                      key={index} 
                      label={`${rule.field} ${rule.operator} ${rule.value}`} 
                      size="small" 
                      sx={{ ml: 1, mt: 0.5 }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2">
                  Couldn't parse specific rules. Try being more specific about conditions.
                </Typography>
              )}
            </Box>
          )}
        </Alert>
      )}

      <Divider sx={{ my: 3 }}>
        <Chip label="OR BUILD MANUALLY" />
      </Divider>

      <Paper sx={{ p: 2, mb: 2 }}>
        <RuleBuilder rules={rules} setRules={setRules} logic={logic} setLogic={setLogic} />
      </Paper>
      <Box mb={2}>
        <Button variant="outlined" onClick={handlePreview}>Preview Audience Size</Button>
        {audienceSize !== null && (
          <Typography ml={2}>Audience Size: {audienceSize}</Typography>
        )}
      </Box>
      <Box mb={2}>
        <input
          type="text"
          placeholder="Segment Name"
          value={segmentName}
          onChange={e => setSegmentName(e.target.value)}
        />
      </Box>
      <Button variant="contained" onClick={handleSave}>Save Segment & Start Campaign</Button>
    </Box>
  );
}
