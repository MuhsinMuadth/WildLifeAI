// ===================================
// WILDLIFE AI BATCH PROCESSOR
// ===================================

window.WildlifeAI = window.WildlifeAI || {};
window.WildlifeAI.BatchProcessor = {};

// ===================================
// BATCH STATE
// ===================================
let batchResults = [];
let processedCount = 0;
let totalImages = 0;
let lastProcessedFiles = null; // Track last processed files for re-processing

// ===================================
// BATCH EVENT HANDLERS
// ===================================
window.WildlifeAI.BatchProcessor.setupBatchHandlers = function() {
    console.log('📁 Setting up batch handlers...');
    
    const uploadArea = document.getElementById('uploadArea');
    const folderInput = document.getElementById('folderUpload');
    
    if (!uploadArea) {
        console.error('❌ Upload area not found for batch!');
        return;
    }
    
    if (!folderInput) {
        console.error('❌ Folder input not found!');
        return;
    }
    
    // Override drag and drop for batch mode
    uploadArea.addEventListener('drop', handleBatchDrop);
    
    // Folder input change with re-processing detection
    folderInput.addEventListener('change', handleFolderInputChange);
    
    console.log('✅ Batch handlers set up successfully');
};

function handleBatchDrop(e) {
    e.preventDefault();
    const uploadArea = e.currentTarget;
    uploadArea.classList.remove('drag-over');
    
    // Only handle batch drops when in batch mode
    if (window.WildlifeAI.UIManager.getCurrentMode() === 'batch') {
        console.log('📁 Files dropped in batch mode');
        
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        if (files.length > 0) {
            console.log(`📁 Processing ${files.length} dropped files`);
            
            // Check if we're dropping the same files
            const shouldReprocess = checkIfShouldReprocess(files);
            if (shouldReprocess) {
                console.log('🔄 Same files detected - re-processing...');
                window.WildlifeAI.BatchProcessor.clearBatchResults();
            }
            
            window.WildlifeAI.BatchProcessor.handleBatchUpload(files);
        } else {
            alert('No valid image files found. Please drop a folder containing images.');
        }
    }
}

function handleFolderInputChange(event) {
    console.log('📁 Folder input changed');
    
    const files = Array.from(event.target.files).filter(file => file.type.startsWith('image/'));
    
    if (files.length === 0) {
        alert('No valid image files found in the selected folder.');
        return;
    }
    
    console.log(`📁 Found ${files.length} image files in selected folder`);
    
    // Check if we're selecting the same files (for re-processing)
    const shouldReprocess = checkIfShouldReprocess(files);
    
    if (shouldReprocess) {
        console.log('🔄 Same folder detected - user wants to re-process!');
        
        // Show confirmation dialog for re-processing
        const confirmReprocess = confirm(
            `You've selected the same folder with ${files.length} images that was just processed.\n\n` +
            `Do you want to re-process all images again?`
        );
        
        if (confirmReprocess) {
            console.log('✅ User confirmed re-processing');
            window.WildlifeAI.BatchProcessor.clearBatchResults();
            window.WildlifeAI.BatchProcessor.handleBatchUpload(files);
        } else {
            console.log('❌ User cancelled re-processing');
            // Clear the input to allow selection again later
            setTimeout(() => {
                event.target.value = '';
            }, 100);
            return;
        }
    } else {
        // New folder - process normally
        console.log('📁 New folder selected - processing...');
        window.WildlifeAI.BatchProcessor.clearBatchResults();
        window.WildlifeAI.BatchProcessor.handleBatchUpload(files);
    }
}

// ===================================
// RE-PROCESSING DETECTION
// ===================================
function checkIfShouldReprocess(newFiles) {
    if (!lastProcessedFiles || lastProcessedFiles.length !== newFiles.length) {
        return false;
    }
    
    // Check if files are the same (by name and size)
    for (let i = 0; i < newFiles.length; i++) {
        const newFile = newFiles[i];
        const oldFile = lastProcessedFiles.find(f => 
            f.name === newFile.name && 
            f.size === newFile.size && 
            f.lastModified === newFile.lastModified
        );
        
        if (!oldFile) {
            return false; // Different files
        }
    }
    
    return true; // Same files detected
}

// ===================================
// BATCH PROCESSING (MODE ISOLATED)
// ===================================
window.WildlifeAI.BatchProcessor.handleBatchUpload = function(files) {
    console.log('📤 Starting batch upload with', files.length, 'files');
    
    // Store current files for future comparison
    lastProcessedFiles = Array.from(files);
    
    // Force clear any existing state
    resetBatchState();
    
    // Only clear preserved results for BATCH mode, not single mode
    window.WildlifeAI.UIManager.clearCurrentModePreservedResults();
    
    totalImages = files.length;
    
    window.WildlifeAI.UIManager.showBatchLoadingState();
    
    //  Auto-scroll to loading state (existing behavior)
    setTimeout(() => {
        document.querySelector('.results-section').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }, 300);
    
    // Process images one by one to avoid overwhelming the browser
    processBatchImages(files, 0);
};

async function processBatchImages(files, index) {
    if (index >= files.length) {
        console.log('✅ Batch processing completed!', {
            totalFiles: files.length,
            processedResults: batchResults.length,
            successfulClassifications: batchResults.filter(r => !r.error).length,
            errors: batchResults.filter(r => r.error).length
        });
        
        // Clear the folder input AFTER processing is complete to allow re-selection
        setTimeout(() => {
            const folderInput = document.getElementById('folderUpload');
            if (folderInput) {
                folderInput.value = '';
            }
        }, 1000);
        
        // Display results first
        window.WildlifeAI.UIManager.displayBatchResults(batchResults);
        
        // Auto-scroll to summary after batch processing completes
        setTimeout(() => {
            console.log('📜 Auto-scrolling to batch summary...');
            const batchSummary = document.querySelector('.batch-summary');
            if (batchSummary) {
                batchSummary.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
                console.log('✅ Scrolled to batch summary successfully');
            } else {
                // Fallback to results section if summary not found
                const resultsSection = document.querySelector('.results-section');
                if (resultsSection) {
                    resultsSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        }, 300); // Slightly longer delay to ensure all content is rendered
        
        return;
    }
    
    const file = files[index];
    console.log(`🔍 Processing image ${index + 1}/${files.length}: ${file.name}`);
    window.WildlifeAI.UIManager.updateBatchProgress(index + 1, files.length, `Processing ${file.name}...`);
    
    try {
        // Load the image
        console.log(`📤 Loading image: ${file.name}`);
        const img = await window.WildlifeAI.Utils.loadImageFromFile(file);
        console.log(`✅ Image loaded successfully: ${file.name}`, {
            width: img.width,
            height: img.height
        });
        
        // Classify the image
        console.log(`🧠 Starting classification for: ${file.name}`);
        const classifications = await window.WildlifeAI.Classification.classifyImageBatch(img);
        console.log(`✅ Classification completed for: ${file.name}`, classifications);
        
        // Validate classification results
        if (!classifications || !classifications.domestic || !classifications.size || !classifications.mammal) {
            throw new Error('Incomplete classification results');
        }
        
        // Validate each classification has required properties
        ['domestic', 'size', 'mammal'].forEach(type => {
            const result = classifications[type];
            if (!result || typeof result.confidence !== 'number' || !result.label) {
                throw new Error(`Invalid ${type} classification result`);
            }
        });
        
        const resultEntry = {
            filename: file.name,
            file: file,
            classifications: classifications,
            imageUrl: URL.createObjectURL(file),
            processedAt: new Date().toISOString()
        };
        
        batchResults.push(resultEntry);
        processedCount++;
        
        console.log(`✅ Successfully processed: ${file.name}`, {
            domestic: `${classifications.domestic.label} (${Math.round(classifications.domestic.confidence * 100)}%)`,
            size: `${classifications.size.label} (${Math.round(classifications.size.confidence * 100)}%)`,
            mammal: `${classifications.mammal.label} (${Math.round(classifications.mammal.confidence * 100)}%)`
        });
        
        // Small delay to prevent browser freezing
        setTimeout(() => {
            processBatchImages(files, index + 1);
        }, window.WildlifeAI.BATCH_CONFIG.PROCESSING_DELAY);
        
    } catch (error) {
        console.error(`❌ Error processing ${file.name}:`, error);
        
        const errorEntry = {
            filename: file.name,
            file: file,
            error: error.message,
            imageUrl: URL.createObjectURL(file),
            processedAt: new Date().toISOString()
        };
        
        batchResults.push(errorEntry);
        processedCount++;
        
        // Continue with next image even if this one failed
        setTimeout(() => {
            processBatchImages(files, index + 1);
        }, window.WildlifeAI.BATCH_CONFIG.PROCESSING_DELAY);
    }
}

// ===================================
// BATCH STATE MANAGEMENT
// ===================================
function resetBatchState() {
    console.log('🧹 Resetting batch state...');
    
    // Clean up previous image URLs to prevent memory leaks
    batchResults.forEach(result => {
        if (result.imageUrl) {
            URL.revokeObjectURL(result.imageUrl);
        }
    });
    
    batchResults = [];
    processedCount = 0;
    totalImages = 0;
    
    console.log('✅ Batch state reset complete');
}

window.WildlifeAI.BatchProcessor.clearBatchResults = function() {
    console.log('🧹 Clearing batch results...');
    
    resetBatchState();
    lastProcessedFiles = null; // Clear the tracking
    
    console.log('✅ Batch results cleared');
};

window.WildlifeAI.BatchProcessor.getBatchResults = function() {
    return batchResults;
};

window.WildlifeAI.BatchProcessor.getBatchProgress = function() {
    return {
        processed: processedCount,
        total: totalImages,
        percentage: totalImages > 0 ? (processedCount / totalImages) * 100 : 0
    };
};

// ===================================
// FORCE BATCH RESTART 
// ===================================
window.WildlifeAI.BatchProcessor.forceBatchRestart = function() {
    console.log('🔄 Forcing batch restart...');
    
    // Clear all state
    resetBatchState();
    lastProcessedFiles = null;
    
    // Clear UI for current mode only
    window.WildlifeAI.UIManager.clearCurrentModeResults();
    
    // Clear preserved results for current mode only
    window.WildlifeAI.UIManager.clearCurrentModePreservedResults();
    
    // Reset folder input
    const folderInput = document.getElementById('folderUpload');
    if (folderInput) {
        folderInput.value = '';
    }
    
    console.log('✅ Batch restart completed - ready for fresh upload');
};

console.log('✅ Batch processor loaded');