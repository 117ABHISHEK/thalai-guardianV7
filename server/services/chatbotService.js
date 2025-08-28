// Simple NLP-based chatbot for mental health support
class ChatbotService {
  constructor() {
    this.responses = {
      greeting: [
        "Hello! I'm here to provide emotional support. How are you feeling today?",
        "Hi there! I'm your mental health support assistant. What's on your mind?",
        "Welcome! I'm here to listen and help. How can I support you today?",
      ],
      anxiety: [
        "I understand you're feeling anxious. Try taking slow, deep breaths. Breathe in for 4 counts, hold for 4, and exhale for 6. Would you like me to guide you through a breathing exercise?",
        "Anxiety can be overwhelming. Remember that this feeling is temporary. Try grounding yourself by naming 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste.",
        "It's okay to feel anxious. You're not alone in this. Consider talking to a counselor about coping strategies. Would you like me to help you book an appointment?",
      ],
      depression: [
        "I hear that you're going through a difficult time. Your feelings are valid, and it's important to reach out for support. Have you considered speaking with a professional counselor?",
        "Depression can make everything feel overwhelming. Please remember that you matter and there are people who want to help. Small steps like getting sunlight, gentle exercise, or talking to someone can help.",
        "Thank you for sharing how you're feeling. It takes courage to acknowledge depression. Professional support can make a real difference. Would you like help finding a counselor?",
      ],
      stress: [
        "Stress is a common experience, especially when dealing with health challenges. Try breaking down your worries into smaller, manageable parts. What's the most pressing concern right now?",
        "Managing stress is important for your overall health. Consider techniques like meditation, gentle exercise, or talking to someone you trust. What usually helps you feel calmer?",
        "I understand you're feeling stressed. Remember to be kind to yourself. Sometimes just acknowledging stress can help reduce its impact. Would you like some stress management tips?",
      ],
      fear: [
        "It's natural to feel afraid when facing health challenges. Fear often comes from uncertainty. What specific aspects are worrying you the most?",
        "Fear can be paralyzing, but you don't have to face it alone. Talking about your fears with a counselor or support group can help. Would you like me to help you find support resources?",
        "Your fears are understandable. Many people with similar health conditions experience these feelings. Connecting with others who understand can be very helpful.",
      ],
      support: [
        "I'm here to support you. While I'm just a chatbot, there are real people who care about your wellbeing. Would you like me to help you connect with a counselor?",
        "You're taking a positive step by reaching out. Remember that seeking help is a sign of strength, not weakness. How else can I support you today?",
        "Thank you for trusting me with your feelings. Professional counselors are available to provide more personalized support. Would you like to schedule an appointment?",
      ],
      emergency: [
        "I'm concerned about what you've shared. If you're having thoughts of hurting yourself or others, please reach out for immediate help:",
        "• Call 988 (Suicide & Crisis Lifeline) - available 24/7",
        "• Text 'HELLO' to 741741 (Crisis Text Line)",
        "• Go to your nearest emergency room",
        "• Call 911",
        "Your life has value and there are people who want to help you through this difficult time.",
      ],
      appointment: [
        "I'd be happy to help you schedule an appointment with one of our volunteer counselors. They can provide personalized support for your mental health needs.",
        "Booking an appointment with a counselor is a great step toward better mental health. Our counselors specialize in supporting people with chronic health conditions.",
        "Our volunteer counselors are here to help. They understand the unique challenges of living with health conditions like thalassemia. Would you like to see available appointments?",
      ],
      default: [
        "I understand you're reaching out for support. While I try my best to help, speaking with a professional counselor might be more beneficial for your specific situation.",
        "Thank you for sharing with me. I'm here to listen, but I encourage you to also consider speaking with one of our trained counselors who can provide more personalized support.",
        "I hear you, and I want to help. Sometimes the best support comes from talking with a human counselor who can understand your unique situation better.",
      ],
    }

    this.keywords = {
      greeting: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "start", "begin"],
      anxiety: ["anxious", "anxiety", "worried", "nervous", "panic", "scared", "fear", "afraid", "overwhelmed"],
      depression: ["depressed", "depression", "sad", "hopeless", "empty", "worthless", "down", "low", "suicidal"],
      stress: ["stressed", "stress", "pressure", "overwhelmed", "burden", "tired", "exhausted", "can't cope"],
      fear: ["afraid", "fear", "scared", "terrified", "frightened", "worried about", "what if"],
      support: ["help", "support", "need someone", "talk", "listen", "understand", "care"],
      emergency: ["kill myself", "end it all", "suicide", "hurt myself", "don't want to live", "better off dead"],
      appointment: ["appointment", "counselor", "therapist", "book", "schedule", "meet", "talk to someone"],
    }
  }

  analyzeMessage(message) {
    const lowerMessage = message.toLowerCase()

    // Check for emergency keywords first
    for (const keyword of this.keywords.emergency) {
      if (lowerMessage.includes(keyword)) {
        return "emergency"
      }
    }

    // Check other intents
    for (const [intent, keywords] of Object.entries(this.keywords)) {
      if (intent === "emergency") continue // Already checked

      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) {
          return intent
        }
      }
    }

    return "default"
  }

  getResponse(intent) {
    const responses = this.responses[intent] || this.responses.default
    const randomIndex = Math.floor(Math.random() * responses.length)
    return responses[randomIndex]
  }

  processMessage(message) {
    const intent = this.analyzeMessage(message)
    const response = this.getResponse(intent)

    return {
      intent,
      response,
      suggestions: this.getSuggestions(intent),
    }
  }

  getSuggestions(intent) {
    const suggestions = {
      greeting: ["I'm feeling anxious", "I'm feeling sad", "I need support", "Book an appointment"],
      anxiety: ["Breathing exercises", "Grounding techniques", "Book counselor appointment", "Tell me more"],
      depression: ["Find a counselor", "Support resources", "Coping strategies", "I need immediate help"],
      stress: ["Stress management tips", "Relaxation techniques", "Talk to counselor", "What helps with stress?"],
      fear: ["Coping with fear", "Find support group", "Book appointment", "Share more details"],
      support: ["Book appointment", "Find resources", "Coping strategies", "Emergency help"],
      emergency: ["Call 988", "Text 741741", "Go to ER", "Call 911"],
      appointment: ["View counselors", "Book appointment", "Available times", "What to expect"],
      default: ["Book appointment", "I need support", "Mental health resources", "Talk to someone"],
    }

    return suggestions[intent] || suggestions.default
  }
}

module.exports = new ChatbotService()
