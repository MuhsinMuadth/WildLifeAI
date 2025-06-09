// ===================================
// WILDLIFE AI CONSTANTS
// ===================================

// Make everything available globally to avoid ES6 module issues
window.WildlifeAI = window.WildlifeAI || {};

// MODEL URLS
window.WildlifeAI.MODEL_URLS = {
    DOMESTIC: "https://teachablemachine.withgoogle.com/models/97TR_i6en/model.json",
    SIZE: "https://teachablemachine.withgoogle.com/models/z7z14-k_q/model.json",
    MAMMAL: "https://teachablemachine.withgoogle.com/models/XBogYVzuP/model.json"
};

// CONFIDENCE THRESHOLDS
window.WildlifeAI.THRESHOLDS = {
    LIKELY: 0.60,  // 60%
    IS: 0.80       // 80%
};

// CLASSIFICATION LABELS
window.WildlifeAI.POSITIVE_LABELS = ['Domestic', 'Large', 'Mammal'];
window.WildlifeAI.NEGATIVE_LABELS = ['Wild', 'Small', 'Non-Mammal'];

// UI CONSTANTS
window.WildlifeAI.CANVAS_BACKGROUND_COLOR = [248, 250, 255];

window.WildlifeAI.FILE_TYPES = {
    ACCEPTED: 'image/*',
    SUPPORTED_FORMATS: ['JPG', 'PNG', 'WebP']
};

// BATCH PROCESSING CONSTANTS
window.WildlifeAI.BATCH_CONFIG = {
    PROCESSING_DELAY: 50, // milliseconds between processing images
    MAX_BATCH_SIZE: 1000, // theoretical limit for batch processing
    THUMBNAIL_SIZE: 60 // pixels
};

// ANIMATION CONSTANTS
window.WildlifeAI.ANIMATIONS = {
    TRANSITION_DURATION: '0.3s',
    CONFIDENCE_BAR_DURATION: '0.8s',
    HOVER_TRANSFORM: 'translateY(-2px)'
};

console.log('✅ Constants loaded');