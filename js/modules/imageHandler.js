// ===================================
// WILDLIFE AI IMAGE HANDLER
// ===================================

window.WildlifeAI = window.WildlifeAI || {};
window.WildlifeAI.ImageHandler = {};

// ===================================
// IMAGE STATE
// ===================================
let inputImage = null;

// ===================================
// EVENT LISTENERS SETUP
// ===================================
window.WildlifeAI.ImageHandler.setupImageHandlers = function() {
    console.log('🖼️ Setting up image handlers...');
    
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('imageUpload');
    
    if (!uploadArea) {
        console.error('❌ Upload area not found!');
        return;
    }
    
    if (!fileInput) {
        console.error('❌ File input not found!');
        return;
    }
    
    // Click handler for upload area - only clear single image input, not folder input
    uploadArea.addEventListener('click', function() {
        const currentMode = window.WildlifeAI.UIManager.getCurrentMode();
        console.log('📱 Upload area clicked, current mode:', currentMode);
        
        if (currentMode === 'single') {
            // Clear the single image input to ensure change event fires even for same file
            document.getElementById('imageUpload').value = '';
            document.getElementById('imageUpload').click();
        } else {
            // For batch mode, let the browser handle folder selection naturally
            // Don't clear the folder input here - it breaks folder selection
            document.getElementById('folderUpload').click();
        }
    });
    
    // Drag and drop functionality
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // File input change with input clearing for single images only
    fileInput.addEventListener('change', handleFileInputChange);
    
    // Clear single image input when clicking file input directly
    fileInput.addEventListener('click', function() {
        console.log('📱 Single image input clicked - clearing previous selection');
        this.value = '';
    });
    
    console.log('✅ Image handlers set up successfully');
};

// ===================================
// DRAG AND DROP HANDLERS
// ===================================
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    const uploadArea = e.currentTarget;
    uploadArea.classList.remove('drag-over');
    
    const currentMode = window.WildlifeAI.UIManager.getCurrentMode();
    
    if (currentMode === 'single') {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            console.log('📤 Single image dropped');
            window.WildlifeAI.ImageHandler.handleImageUpload(files[0]);
        }
    }
    // Note: Batch drop handling is managed in batchProcessor.js
}

function handleFileInputChange(event) {
    const file = event.target.files[0];
    if (file) {
        console.log('📤 File selected via input:', file.name);
        window.WildlifeAI.ImageHandler.handleImageUpload(file);
    }
}

// ===================================
// IMAGE UPLOAD HANDLING 
// ===================================
window.WildlifeAI.ImageHandler.handleImageUpload = function(file) {
    console.log('📤 Handling image upload:', file.name);
    
    if (!window.WildlifeAI.Utils.isValidImageFile(file)) {
        alert('Please upload a valid image file.');
        return;
    }
    
    // Clear any existing image first!
    window.WildlifeAI.ImageHandler.clearCurrentImage();
    
    // Only clear preserved results for SINGLE mode, not batch mode
    window.WildlifeAI.UIManager.clearCurrentModePreservedResults();
    
    // Clear the canvas immediately
    if (window.canvas) {
        background(...window.WildlifeAI.CANVAS_BACKGROUND_COLOR);
    }
    
    window.WildlifeAI.UIManager.showLoadingState();
    
    const img = createImg(URL.createObjectURL(file), '', '', () => {
        console.log('✅ New image loaded and ready for display');
        img.hide();
        
        // Clean up any previous image URL to prevent memory leaks
        if (inputImage && inputImage.elt && inputImage.elt.src) {
            URL.revokeObjectURL(inputImage.elt.src);
        }
        
        inputImage = img;
        
        // Hide the placeholder when image is loaded
        document.getElementById('placeholder').classList.add('hidden');
        // Add class to enable clear button on hover
        document.getElementById('image_container').classList.add('has-image');
        
        // Force a canvas redraw with the new image
        window.WildlifeAI.ImageHandler.forceCanvasRedraw();
        
        classifyCurrentImage();
    });
};

// ===================================
// FORCE CANVAS REDRAW
// ===================================
window.WildlifeAI.ImageHandler.forceCanvasRedraw = function() {
    if (window.canvas && inputImage) {
        // Clear the canvas first
        background(...window.WildlifeAI.CANVAS_BACKGROUND_COLOR);
        
        // Force an immediate redraw
        setTimeout(() => {
            window.WildlifeAI.ImageHandler.drawCurrentImage(window.canvas, window);
        }, 10);
    }
};

// ===================================
// IMAGE CLASSIFICATION WITH SMART SCROLL
// ===================================
async function classifyCurrentImage() {
    try {
        const results = await window.WildlifeAI.Classification.classifyImage(inputImage.elt);
        window.WildlifeAI.UIManager.displayResults(results);
        
        // Auto-scroll to results after classification completes
        setTimeout(() => {
            console.log('📜 Auto-scrolling to classification results...');
            const resultsSection = document.querySelector('.results-section');
            if (resultsSection) {
                resultsSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
                console.log('✅ Scrolled to results successfully');
            }
        }, 300); // Small delay to ensure results are rendered
        
    } catch (error) {
        console.error('❌ Classification error:', error);
        document.getElementById('results').innerHTML = `
            <div class="loading" style="color: #dc3545;">
                <div style="font-size: 2rem; margin-bottom: 15px;">⚠️</div>
                <div>Classification failed. Please try again.</div>
            </div>
        `;
        
        // Still scroll to show the error message
        setTimeout(() => {
            const resultsSection = document.querySelector('.results-section');
            if (resultsSection) {
                resultsSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 250);
    }
}

// ===================================
// IMAGE DISPLAY FUNCTIONS
// ===================================
window.WildlifeAI.ImageHandler.drawCurrentImage = function(canvas, p5Instance) {
    if (inputImage && inputImage.elt && inputImage.elt.complete) {
        // Clear canvas first to remove any previous image
        p5Instance.background(...window.WildlifeAI.CANVAS_BACKGROUND_COLOR);
        
        // Get current canvas dimensions
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        // Get image dimensions
        const imgWidth = inputImage.width;
        const imgHeight = inputImage.height;
        
        // Calculate aspect ratios
        const imgAspect = imgWidth / imgHeight;
        const canvasAspect = canvasWidth / canvasHeight;
        
        let drawWidth, drawHeight, x, y;
        
        // Determine how to fit the image while maintaining aspect ratio
        if (imgAspect > canvasAspect) {
            // Image is wider relative to canvas - fit to width
            drawWidth = canvasWidth;
            drawHeight = canvasWidth / imgAspect;
            x = 0;
            y = (canvasHeight - drawHeight) / 2;
        } else {
            // Image is taller relative to canvas - fit to height
            drawHeight = canvasHeight;
            drawWidth = canvasHeight * imgAspect;
            x = (canvasWidth - drawWidth) / 2;
            y = 0;
        }
        
        // Draw image centered
        p5Instance.image(inputImage, x, y, drawWidth, drawHeight);
        return true;
    }
    return false;
};

// ===================================
// IMAGE MANAGEMENT 
// ===================================
window.WildlifeAI.ImageHandler.clearCurrentImage = function() {
    console.log('🧹 Clearing current image...');
    
    // Clean up previous image URL to prevent memory leaks
    if (inputImage && inputImage.elt && inputImage.elt.src) {
        URL.revokeObjectURL(inputImage.elt.src);
    }
    
    inputImage = null;
    
    // Reset ONLY the single image file input, not the folder input
    const fileInput = document.getElementById('imageUpload');
    if (fileInput) {
        fileInput.value = '';
    }
    
    // Show placeholder again
    document.getElementById('placeholder').classList.remove('hidden');
    // Remove class that enables clear button on hover
    document.getElementById('image_container').classList.remove('has-image');
    
    // Clear canvas
    if (window.canvas) {
        background(...window.WildlifeAI.CANVAS_BACKGROUND_COLOR);
    }
};

window.WildlifeAI.ImageHandler.getCurrentImage = function() {
    return inputImage;
};

window.WildlifeAI.ImageHandler.hasImage = function() {
    return inputImage !== null && inputImage.elt && inputImage.elt.complete;
};

// ===================================
// IMAGE ZOOM FUNCTIONALITY
// ===================================
window.WildlifeAI.ImageHandler.showImageZoom = function(imageUrl) {
    const overlay = document.getElementById('imageZoomOverlay');
    const zoomedImage = document.getElementById('zoomedImage');
    zoomedImage.src = imageUrl;
    overlay.style.display = 'flex';
};

window.WildlifeAI.ImageHandler.closeImageZoom = function() {
    const overlay = document.getElementById('imageZoomOverlay');
    overlay.style.display = 'none';
};

// Global functions for HTML onclick handlers
window.showImageZoom = window.WildlifeAI.ImageHandler.showImageZoom;
window.closeImageZoom = window.WildlifeAI.ImageHandler.closeImageZoom;

// Add click handler for image zoom overlay
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('imageZoomOverlay');
    if (overlay) {
        overlay.addEventListener('click', window.WildlifeAI.ImageHandler.closeImageZoom);
    }
});

console.log('✅ Image handler loaded');