import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, List, ListItem, ListItemText, 
  Collapse, IconButton, Chip, Grid, Divider, Card, CardContent,
  Alert, CircularProgress
} from '@mui/material';
import { 
  ExpandMore, ExpandLess, Campaign, People, Send, Error,
  Psychology, TrendingUp, AutoAwesome 
} from '@mui/icons-material';
import { aiService } from '../services/aiService';
import axios from 'axios';

export default function CampaignHistoryPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [expandedCampaign, setExpandedCampaign] = useState(null);
  const [campaignLogs, setCampaignLogs] = useState({});
  const [aiInsights, setAiInsights] = useState({});
  const [loadingInsights, setLoadingInsights] = useState({});

  useEffect(() => {
    axios.get('http://localhost:4000/api/campaigns').then(res => setCampaigns(res.data));
  }, []);

  const handleExpand = async (campaignId) => {
    if (expandedCampaign === campaignId) {
      setExpandedCampaign(null);
    } else {
      setExpandedCampaign(campaignId);
      
      // Fetch detailed logs for this campaign
      try {
        const res = await axios.get(`http://localhost:4000/debug/data`);
        const logs = res.data.logs.filter(log => log.campaignId === campaignId);
        const customers = res.data.customers;
        
        const enrichedLogs = logs.map(log => {
          const customer = customers.find(c => c.id === log.customerId);
          return { ...log, customer };
        });
        
        setCampaignLogs(prev => ({ ...prev, [campaignId]: enrichedLogs }));
        
        // Generate AI insights for this campaign
        generateAiInsights(campaignId);
        
      } catch (error) {
        console.error('Error fetching campaign details:', error);
      }
    }
  };

  const generateAiInsights = async (campaignId) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign || aiInsights[campaignId]) return; // Skip if already generated
    
    setLoadingInsights(prev => ({ ...prev, [campaignId]: true }));
    
    try {
      let stats = campaign.stats;
      if (typeof stats === 'string') {
        stats = JSON.parse(stats);
      }
      
      const insights = await aiService.generatePerformanceInsights({
        stats,
        audience: { size: stats.audienceSize },
        message: campaign.message,
        name: campaign.name || `Campaign #${campaign.id}`
      });
      
      setAiInsights(prev => ({ ...prev, [campaignId]: insights }));
      
    } catch (error) {
      console.error('Error generating AI insights:', error);
      setAiInsights(prev => ({ 
        ...prev, 
        [campaignId]: {
          summary: "AI insights temporarily unavailable",
          insights: ["Analysis could not be completed"],
          recommendations: [],
          performanceScore: 0
        }
      }));
    } finally {
      setLoadingInsights(prev => ({ ...prev, [campaignId]: false }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3} sx={{ display: 'flex', alignItems: 'center' }}>
        <Campaign sx={{ mr: 2 }} />
        Campaign History
      </Typography>
      
      <Paper sx={{ p: 3 }}>
        {campaigns.length === 0 ? (
          <Typography variant="h6" color="text.secondary" textAlign="center" py={4}>
            No campaigns created yet. Create your first segment to launch a campaign!
          </Typography>
        ) : (
          <List>
            {campaigns.map(camp => {
              // Parse stats if it's a string
              let stats = camp.stats;
              if (typeof stats === 'string') {
                try {
                  stats = JSON.parse(stats);
                } catch (e) {
                  stats = { audienceSize: 0, sent: 0, failed: 0 };
                }
              }
              
              const isExpanded = expandedCampaign === camp.id;
              const logs = campaignLogs[camp.id] || [];
              
              return (
                <React.Fragment key={camp.id}>
                  <ListItem 
                    sx={{ 
                      cursor: 'pointer', 
                      '&:hover': { backgroundColor: 'action.hover' },
                      borderRadius: 1,
                      mb: 1
                    }}
                    onClick={() => handleExpand(camp.id)}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="h6" component="span">
                            {camp.name || `Campaign #${camp.id}`}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            {/* AI-Generated Tags */}
                            {camp.tags && (
                              <Box sx={{ display: 'flex', gap: 0.5, mr: 1 }}>
                                {camp.tags.split(', ').map((tag, idx) => (
                                  <Chip 
                                    key={idx} 
                                    label={tag} 
                                    size="small" 
                                    color="secondary"
                                    sx={{ fontSize: '0.7rem' }}
                                  />
                                ))}
                              </Box>
                            )}
                            <Chip 
                              icon={<People />} 
                              label={`${stats?.audienceSize || 0} audience`} 
                              size="small" 
                              color="primary" 
                            />
                            <Chip 
                              icon={<Send />} 
                              label={`${stats?.sent || 0} sent`} 
                              size="small" 
                              color="success" 
                            />
                            {(stats?.failed || 0) > 0 && (
                              <Chip 
                                icon={<Error />} 
                                label={`${stats?.failed || 0} failed`} 
                                size="small" 
                                color="error" 
                              />
                            )}
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Box mt={1}>
                          <Typography variant="body2" color="text.secondary">
                            Created: {formatDate(camp.createdAt)}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            "{camp.message}"
                          </Typography>
                        </Box>
                      }
                    />
                    <IconButton>
                      {isExpanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </ListItem>
                  
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ ml: 2, mr: 2, mb: 2 }}>
                      <Divider sx={{ mb: 2 }} />
                      
                      {/* Campaign Stats Cards */}
                      <Grid container spacing={2} mb={3}>
                        <Grid item xs={12} md={4}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography color="text.secondary" gutterBottom>
                                Total Audience
                              </Typography>
                              <Typography variant="h4" color="primary">
                                {stats?.audienceSize || 0}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography color="text.secondary" gutterBottom>
                                Successfully Sent
                              </Typography>
                              <Typography variant="h4" color="success.main">
                                {stats?.sent || 0}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography color="text.secondary" gutterBottom>
                                Delivery Failed
                              </Typography>
                              <Typography variant="h4" color="error.main">
                                {stats?.failed || 0}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                      
                      {/* AI-Powered Performance Insights */}
                      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center' }}>
                            <Psychology sx={{ mr: 1 }} />
                            AI Performance Insights
                          </Typography>
                          
                          {loadingInsights[camp.id] ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                              <CircularProgress size={20} sx={{ color: 'white', mr: 2 }} />
                              <Typography>Analyzing campaign performance...</Typography>
                            </Box>
                          ) : aiInsights[camp.id] ? (
                            <Box>
                              {/* Performance Score */}
                              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                                <TrendingUp sx={{ color: 'white', mr: 1 }} />
                                <Typography variant="h4" sx={{ color: 'white', mr: 2 }}>
                                  {aiInsights[camp.id].performanceScore}/100
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'white' }}>
                                  Performance Score
                                </Typography>
                              </Box>
                              
                              {/* AI Summary */}
                              <Typography variant="body1" sx={{ color: 'white', mb: 2 }}>
                                {aiInsights[camp.id].summary}
                              </Typography>
                              
                              {/* Key Insights */}
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                                  Key Insights:
                                </Typography>
                                {aiInsights[camp.id].insights.map((insight, idx) => (
                                  <Typography key={idx} variant="body2" sx={{ color: 'white', mb: 0.5 }}>
                                    {insight}
                                  </Typography>
                                ))}
                              </Box>
                              
                              {/* Recommendations */}
                              {aiInsights[camp.id].recommendations.length > 0 && (
                                <Box>
                                  <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                                    <AutoAwesome sx={{ fontSize: 16, mr: 0.5 }} />
                                    AI Recommendations:
                                  </Typography>
                                  {aiInsights[camp.id].recommendations.map((rec, idx) => (
                                    <Chip 
                                      key={idx}
                                      label={rec}
                                      size="small"
                                      sx={{ 
                                        m: 0.5,
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        color: 'white'
                                      }}
                                    />
                                  ))}
                                </Box>
                              )}
                            </Box>
                          ) : (
                            <Typography sx={{ color: 'white' }}>
                              AI insights will appear here when you expand a campaign.
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                      
                      {/* Delivery Details */}
                      <Typography variant="h6" mb={2}>Delivery Details</Typography>
                      {logs.length > 0 ? (
                        <List dense>
                          {logs.map((log, index) => (
                            <ListItem key={index} divider>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="body1">
                                      {log.customer?.name || `Customer #${log.customerId}`}
                                    </Typography>
                                    <Chip 
                                      label={log.status} 
                                      size="small" 
                                      color={log.status === 'SENT' ? 'success' : 'error'}
                                    />
                                  </Box>
                                }
                                secondary={
                                  <Typography variant="body2" color="text.secondary">
                                    {log.customer?.email} • {formatDate(log.createdAt)}
                                  </Typography>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography color="text.secondary">
                          Loading delivery details...
                        </Typography>
                      )}
                    </Box>
                  </Collapse>
                  
                  {/* Divider between campaigns */}
                  {camp.id !== campaigns[campaigns.length - 1]?.id && (
                    <Divider sx={{ my: 2 }} />
                  )}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Paper>
    </Box>
  );
}
