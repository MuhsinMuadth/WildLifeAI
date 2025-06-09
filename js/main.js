// ===================================
// WILDLIFE AI - MAIN APPLICATION
// ===================================

console.log('🦁 WildLife AI - Application Starting...');

// ===================================
// GLOBAL VARIABLES
// ===================================
let canvas;

// ===================================
// P5.JS FUNCTIONS
// ===================================
window.preload = function() {
    console.log('⏳ Preloading models...');
    window.WildlifeAI.Classification.preloadModels();
};

window.setup = function() {
    console.log('🎨 p5.js setup starting...');
    
    // Get the container element to match its size
    const container = document.getElementById('image_container');
    if (!container) {
        console.error('❌ Image container not found!');
        return;
    }
    
    canvas = createCanvas(container.offsetWidth, container.offsetHeight);
    canvas.parent("image_container");
    canvas.style('border-radius', '16px');
    canvas.style('position', 'absolute');
    canvas.style('top', '0');
    canvas.style('left', '0');
    canvas.style('z-index', '1');
    background(...window.WildlifeAI.CANVAS_BACKGROUND_COLOR);
    
    // Make canvas available globally for image handler
    window.canvas = canvas;
    
    // Setup event listeners
    console.log('🔧 Setting up event handlers...');
    window.WildlifeAI.ImageHandler.setupImageHandlers();
    window.WildlifeAI.BatchProcessor.setupBatchHandlers();
    window.WildlifeAI.UIManager.setupUIHandlers();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        resizeCanvas(container.offsetWidth, container.offsetHeight);
        // Force redraw after resize if there's an image
        if (window.WildlifeAI.ImageHandler.hasImage()) {
            setTimeout(() => {
                window.WildlifeAI.ImageHandler.forceCanvasRedraw();
            }, 100);
        }
    });
    
    console.log('✅ p5.js setup completed successfully');
};

window.draw = function() {
    // Only draw if we have an image and are in single mode
    if (window.WildlifeAI.ImageHandler.hasImage() && window.WildlifeAI.UIManager.getCurrentMode() === 'single') {
        // Draw the current image
        const imageDrawn = window.WildlifeAI.ImageHandler.drawCurrentImage(canvas, window);
        if (!imageDrawn) {
            background(...window.WildlifeAI.CANVAS_BACKGROUND_COLOR);
        }
    } else {
        // Show the background canvas when no image is loaded or in batch mode
        background(...window.WildlifeAI.CANVAS_BACKGROUND_COLOR);
    }
};

// ===================================
// MODE-SPECIFIC CLEAR FUNCTIONS
// ===================================
window.WildlifeAI.clearCurrentModeOnly = function() {
    const currentMode = window.WildlifeAI.UIManager.getCurrentMode();
    console.log('🧹 Clearing current mode only:', currentMode);
    
    if (currentMode === 'single') {
        // Clear single image mode only
        window.WildlifeAI.ImageHandler.clearCurrentImage();
        window.WildlifeAI.UIManager.clearCurrentModePreservedResults();
        window.WildlifeAI.UIManager.clearCurrentModeResults();
        
        // Clear canvas
        if (canvas) {
            background(...window.WildlifeAI.CANVAS_BACKGROUND_COLOR);
        }
        
        console.log('✅ Single image mode cleared');
    } else {
        // Clear batch mode only
        window.WildlifeAI.BatchProcessor.clearBatchResults();
        window.WildlifeAI.UIManager.clearCurrentModePreservedResults();
        window.WildlifeAI.UIManager.clearCurrentModeResults();
        
        console.log('✅ Batch mode cleared');
    }
};

window.WildlifeAI.clearImage = function() {
    console.log('🧹 LEGACY: Clearing all images and results...');
    
    // This is the old function - redirect to mode-specific clearing
    window.WildlifeAI.clearCurrentModeOnly();
};

window.WildlifeAI.exportResults = function() {
    console.log('📥 Exporting results...');
    const batchResults = window.WildlifeAI.BatchProcessor.getBatchResults();
    if (batchResults && batchResults.length > 0) {
        window.WildlifeAI.Utils.exportResultsToCSV(batchResults);
    } else {
        alert('No batch results to export. Please process some images first!');
    }
};

// Make functions available globally for HTML onclick handlers
window.clearImage = window.WildlifeAI.clearCurrentModeOnly; 
window.exportResults = window.WildlifeAI.exportResults;

// ===================================
// NUCLEAR OPTION: CLEAR EVERYTHING (FOR DEBUGGING)
// ===================================
window.WildlifeAI.clearEverything = function() {
    console.log('💥 NUCLEAR CLEAR: Clearing absolutely everything...');
    
    // Clear single image
    window.WildlifeAI.ImageHandler.clearCurrentImage();
    
    // Clear batch results
    window.WildlifeAI.BatchProcessor.clearBatchResults();
    
    // Clear ALL preserved results
    window.WildlifeAI.UIManager.clearAllPreservedResults();
    
    // Clear current display
    window.WildlifeAI.UIManager.clearCurrentModeResults();
    
    // Clear canvas
    if (canvas) {
        background(...window.WildlifeAI.CANVAS_BACKGROUND_COLOR);
    }
    
    console.log('💥 Nuclear clear completed - everything wiped!');
};

// ===================================
// APPLICATION INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM Content Loaded');
    console.log('📁 Modular structure initialized');
    console.log('🧠 AI models loading...');
    console.log('🎯 Application ready for use!');
    console.log('✨ Mode Isolation: Results now properly isolated between modes!');
});

console.log('✅ Main application loaded');