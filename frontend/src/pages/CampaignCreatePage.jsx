import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Alert,
  MenuItem, Select, FormControl, InputLabel, Chip
} from '@mui/material';
import { Campaign, Send } from '@mui/icons-material';
import AiMessageGenerator from '../components/AiMessageGenerator';
import { aiService } from '../services/aiService';
import axios from 'axios';

export default function CampaignCreatePage() {
  const [segments, setSegments] = useState([]);
  const [selectedSegment, setSelectedSegment] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [message, setMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [aiTags, setAiTags] = useState([]);

  useEffect(() => {
    // Load available segments
    axios.get('http://localhost:4000/debug/data')
      .then(res => setSegments(res.data.segments || []))
      .catch(err => console.error('Failed to load segments:', err));
  }, []);

  const handleMessageSelect = (selectedMessage) => {
    setMessage(selectedMessage);
    generateAiTags(selectedMessage);
  };

  const generateAiTags = async (messageText) => {
    try {
      const tags = await aiService.autoTagCampaign({
        message: messageText,
        audience: { size: getSelectedSegmentAudience() },
        stats: { audienceSize: getSelectedSegmentAudience(), sent: 0, failed: 0 }
      });
      setAiTags(tags);
    } catch (error) {
      console.error('Auto-tagging failed:', error);
    }
  };

  const getSelectedSegmentAudience = () => {
    const segment = segments.find(s => s.id == selectedSegment);
    return segment?.audienceSize || 0;
  };

  const handleCreateCampaign = async () => {
    if (!selectedSegment || !message.trim()) {
      alert('Please select a segment and enter a message');
      return;
    }

    setIsCreating(true);
    try {
      const campaignData = {
        segmentId: selectedSegment,
        name: campaignName || `Campaign for Segment ${selectedSegment}`,
        message: message.trim(),
        tags: aiTags
      };

      await axios.post('http://localhost:4000/api/campaigns', campaignData);
      
      alert('Campaign created successfully!');
      // Reset form
      setCampaignName('');
      setMessage('');
      setSelectedSegment('');
      setAiTags([]);
      
      // Redirect to campaign history
      window.location.href = '/campaigns';
      
    } catch (error) {
      console.error('Campaign creation failed:', error);
      alert('Failed to create campaign. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const selectedSegmentData = segments.find(s => s.id == selectedSegment);

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3} sx={{ display: 'flex', alignItems: 'center' }}>
        <Campaign sx={{ mr: 2 }} />
        Create New Campaign
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" mb={2}>Campaign Details</Typography>
        
        {/* Segment Selection */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Select Target Segment</InputLabel>
          <Select
            value={selectedSegment}
            onChange={(e) => setSelectedSegment(e.target.value)}
            label="Select Target Segment"
          >
            {segments.map((segment) => (
              <MenuItem key={segment.id} value={segment.id}>
                {segment.name || `Segment ${segment.id}`} 
                ({segment.audienceSize || 0} customers)
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Campaign Name */}
        <TextField
          fullWidth
          label="Campaign Name (Optional)"
          value={campaignName}
          onChange={(e) => setCampaignName(e.target.value)}
          sx={{ mb: 3 }}
          placeholder="e.g., Holiday Sale Campaign"
        />

        {/* Display selected segment info */}
        {selectedSegmentData && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Target Audience:</strong> {selectedSegmentData.audienceSize || 0} customers
              {selectedSegmentData.rules && (
                <>
                  <br />
                  <strong>Segment Rules:</strong> {JSON.stringify(selectedSegmentData.rules)}
                </>
              )}
            </Typography>
          </Alert>
        )}
      </Paper>

      {/* AI Message Generator */}
      {selectedSegment && (
        <AiMessageGenerator 
          onMessageSelect={handleMessageSelect}
          audienceInfo={{
            size: getSelectedSegmentAudience(),
            segmentId: selectedSegment
          }}
        />
      )}

      {/* Manual Message Input */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" mb={2}>Campaign Message</Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your campaign message or use AI suggestions above..."
          variant="outlined"
        />

        {/* AI-Generated Tags */}
        {aiTags.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              AI-Generated Campaign Tags:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {aiTags.map((tag, index) => (
                <Chip key={index} label={tag} size="small" color="secondary" />
              ))}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Create Campaign Button */}
      <Button
        variant="contained"
        size="large"
        onClick={handleCreateCampaign}
        disabled={isCreating || !selectedSegment || !message.trim()}
        startIcon={<Send />}
        sx={{ minWidth: 200 }}
      >
        {isCreating ? 'Creating Campaign...' : 'Create & Launch Campaign'}
      </Button>

      {segments.length === 0 && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          No segments available. Please create a segment first before creating a campaign.
        </Alert>
      )}
    </Box>
  );
}