import { pipeline, env } from '@xenova/transformers';

// Disable local model loading for faster inference
env.allowRemoteModels = true;
env.allowLocalModels = false;

class AIService {
  constructor() {
    this.classifier = null;
    this.generator = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      console.log('Initializing AI models...');
      
      // Load text classification model for rule parsing and campaign tagging
      this.classifier = await pipeline(
        'text-classification',
        'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
      );
      
      // Load text generation model for message suggestions
      this.generator = await pipeline(
        'text-generation',
        'Xenova/gpt2',
        { max_new_tokens: 50 }
      );
      
      this.initialized = true;
      console.log('AI models initialized successfully!');
    } catch (error) {
      console.error('Failed to initialize AI models:', error);
    }
  }

  // Convert natural language to segment rules
  async parseNaturalLanguageToRules(prompt) {
    await this.initialize();
    
    const rules = [];
    const lowerPrompt = prompt.toLowerCase();
    
    // Rule parsing logic using pattern matching and AI classification
    try {
      // Extract spending patterns
      const spendingMatch = lowerPrompt.match(/spent\s+(?:over|more than|above)\s*₹?(\d+)k?/i);
      if (spendingMatch) {
        const amount = parseInt(spendingMatch[1]) * (spendingMatch[1].includes('k') ? 1000 : 1);
        rules.push({
          field: 'totalSpends',
          operator: '>',
          value: amount
        });
      }
      
      // Extract time-based patterns
      const timeMatch = lowerPrompt.match(/haven't\s+(?:shopped|bought|purchased).*?(\d+)\s+(months?|days?|weeks?)/i);
      if (timeMatch) {
        const value = parseInt(timeMatch[1]);
        const unit = timeMatch[2].toLowerCase();
        let days = value;
        if (unit.includes('month')) days = value * 30;
        if (unit.includes('week')) days = value * 7;
        
        rules.push({
          field: 'lastOrderDate',
          operator: 'days_ago',
          value: days
        });
      }
      
      // Extract visit frequency patterns
      if (lowerPrompt.includes('frequent') || lowerPrompt.includes('regular')) {
        rules.push({
          field: 'visits',
          operator: '>',
          value: 5
        });
      }
      
      if (lowerPrompt.includes('new') || lowerPrompt.includes('first time')) {
        rules.push({
          field: 'visits',
          operator: '<=',
          value: 1
        });
      }
      
      // Use AI classification to understand intent
      const intent = await this.classifyIntent(prompt);
      
      return {
        rules,
        intent: intent,
        confidence: rules.length > 0 ? 0.8 : 0.3,
        originalPrompt: prompt
      };
      
    } catch (error) {
      console.error('Error parsing natural language:', error);
      return {
        rules: [],
        intent: 'unknown',
        confidence: 0,
        originalPrompt: prompt,
        error: error.message
      };
    }
  }

  // Generate campaign message suggestions
  async generateMessageSuggestions(objective, audienceInfo) {
    await this.initialize();
    
    try {
      const suggestions = [];
      
      // Template-based generation with AI enhancement
      const templates = this.getMessageTemplates(objective);
      
      for (const template of templates) {
        const prompt = `${template} for ${audienceInfo?.size || 'customers'}`;
        
        try {
          const result = await this.generator(prompt, {
            max_new_tokens: 30,
            temperature: 0.7,
            pad_token_id: 50256
          });
          
          let generatedText = result[0].generated_text;
          // Clean up the generated text
          generatedText = generatedText.replace(prompt, '').trim();
          
          suggestions.push({
            message: template + (generatedText ? ' ' + generatedText : ''),
            tone: this.analyzeTone(template),
            confidence: 0.75
          });
        } catch (genError) {
          // Fallback to template-only if generation fails
          suggestions.push({
            message: template,
            tone: this.analyzeTone(template),
            confidence: 0.6
          });
        }
      }
      
      return suggestions.slice(0, 3); // Return top 3 suggestions
      
    } catch (error) {
      console.error('Error generating message suggestions:', error);
      return this.getFallbackMessages(objective);
    }
  }

  // Generate campaign performance insights
  async generatePerformanceInsights(campaignData) {
    const { stats, audience, message, name } = campaignData;
    
    try {
      const deliveryRate = Math.round((stats.sent / stats.audienceSize) * 100);
      const failureRate = Math.round((stats.failed / stats.audienceSize) * 100);
      
      let insights = [];
      
      // Performance analysis
      if (deliveryRate >= 95) {
        insights.push("🎯 Excellent delivery rate! Your campaign reached almost all targeted customers.");
      } else if (deliveryRate >= 80) {
        insights.push("✅ Good delivery performance with most messages reaching their destination.");
      } else {
        insights.push("⚠️ Delivery rate needs improvement. Consider reviewing your audience email quality.");
      }
      
      // Audience analysis
      if (stats.audienceSize > 1000) {
        insights.push("📈 Large audience reach - great for brand awareness campaigns.");
      } else if (stats.audienceSize > 100) {
        insights.push("🎯 Medium-sized targeted audience - ideal for focused campaigns.");
      } else {
        insights.push("💎 Small, highly targeted audience - perfect for personalized campaigns.");
      }
      
      // Message analysis using AI classification
      const messageAnalysis = await this.analyzeMessage(message);
      insights.push(`💬 Message tone: ${messageAnalysis.tone} (${Math.round(messageAnalysis.confidence * 100)}% confidence)`);
      
      return {
        summary: `Your campaign "${name}" reached ${stats.audienceSize} customers with ${deliveryRate}% delivery success.`,
        insights: insights,
        recommendations: this.generateRecommendations(stats, deliveryRate),
        performanceScore: this.calculatePerformanceScore(stats, deliveryRate)
      };
      
    } catch (error) {
      console.error('Error generating insights:', error);
      return {
        summary: `Campaign reached ${stats.audienceSize} customers.`,
        insights: ["Analysis temporarily unavailable."],
        recommendations: [],
        performanceScore: 0
      };
    }
  }

  // Auto-tag campaigns based on content and audience
  async autoTagCampaign(campaignData) {
    await this.initialize();
    
    try {
      const { message, audience, stats } = campaignData;
      const tags = [];
      
      // Analyze message content
      const messageIntent = await this.classifyIntent(message);
      
      // Content-based tags
      if (message.toLowerCase().includes('welcome') || message.toLowerCase().includes('new')) {
        tags.push('Welcome Campaign');
      }
      
      if (message.toLowerCase().includes('offer') || message.toLowerCase().includes('discount') || message.toLowerCase().includes('sale')) {
        tags.push('Promotional');
      }
      
      if (message.toLowerCase().includes('back') || message.toLowerCase().includes('return') || message.toLowerCase().includes('miss')) {
        tags.push('Win-back');
      }
      
      // Audience-based tags
      if (stats.audienceSize > 1000) {
        tags.push('Mass Campaign');
      } else if (stats.audienceSize < 100) {
        tags.push('VIP Segment');
      }
      
      // Performance-based tags
      const deliveryRate = (stats.sent / stats.audienceSize) * 100;
      if (deliveryRate >= 95) {
        tags.push('High Performance');
      }
      
      // AI-powered intent classification
      if (messageIntent === 'POSITIVE') {
        tags.push('Engagement');
      } else {
        tags.push('Informational');
      }
      
      return tags.length > 0 ? tags : ['General Campaign'];
      
    } catch (error) {
      console.error('Error auto-tagging campaign:', error);
      return ['General Campaign'];
    }
  }

  // Helper methods
  async classifyIntent(text) {
    if (!this.classifier) return 'neutral';
    
    try {
      const result = await this.classifier(text);
      return result[0].label === 'POSITIVE' ? 'POSITIVE' : 'NEUTRAL';
    } catch (error) {
      return 'neutral';
    }
  }

  getMessageTemplates(objective) {
    const templates = {
      'win-back': [
        "We miss you! Come back and discover what's new.",
        "Your favorite items are waiting for you. Return now!",
        "Special offer just for you - we want you back!"
      ],
      'promotional': [
        "Exclusive offer: Limited time discount inside!",
        "Don't miss out on our biggest sale of the year!",
        "Special promotion tailored just for you!"
      ],
      'engagement': [
        "We have something exciting to share with you!",
        "Your personalized recommendations are ready!",
        "Thank you for being a valued customer!"
      ],
      'default': [
        "We have something special for you!",
        "Don't miss this exclusive update!",
        "Your personalized offer awaits!"
      ]
    };
    
    return templates[objective.toLowerCase()] || templates.default;
  }

  analyzeTone(text) {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('exclusive') || lowerText.includes('special')) return 'premium';
    if (lowerText.includes('miss') || lowerText.includes('back')) return 'nostalgic';
    if (lowerText.includes('offer') || lowerText.includes('discount')) return 'promotional';
    return 'friendly';
  }

  async analyzeMessage(message) {
    try {
      const result = await this.classifyIntent(message);
      return {
        tone: result === 'POSITIVE' ? 'positive' : 'neutral',
        confidence: 0.8
      };
    } catch (error) {
      return { tone: 'neutral', confidence: 0.5 };
    }
  }

  generateRecommendations(stats, deliveryRate) {
    const recommendations = [];
    
    if (deliveryRate < 80) {
      recommendations.push("📧 Improve email list quality by removing inactive addresses");
      recommendations.push("⏰ Try different send times to improve deliverability");
    }
    
    if (stats.audienceSize < 100) {
      recommendations.push("📊 Consider expanding your audience with lookalike segments");
    }
    
    if (stats.audienceSize > 1000) {
      recommendations.push("🎯 Consider segmenting your audience for more personalized messaging");
    }
    
    return recommendations;
  }

  calculatePerformanceScore(stats, deliveryRate) {
    let score = deliveryRate; // Base score from delivery rate
    
    // Bonus for larger successful audiences
    if (stats.sent > 500) score += 5;
    if (stats.sent > 1000) score += 5;
    
    // Penalty for high failure rate
    if (stats.failed > stats.sent * 0.2) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }

  getFallbackMessages(objective) {
    return [
      {
        message: "We have something special waiting for you!",
        tone: "friendly",
        confidence: 0.5
      },
      {
        message: "Don't miss out on this exclusive opportunity!",
        tone: "promotional",
        confidence: 0.5
      },
      {
        message: "Your personalized update is ready!",
        tone: "premium",
        confidence: 0.5
      }
    ];
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;