// ===================================
// WILDLIFE AI UI MANAGER
// ===================================

window.WildlifeAI = window.WildlifeAI || {};
window.WildlifeAI.UIManager = {};

// ===================================
// UI STATE & RESULT PRESERVATION 
// ===================================
let currentMode = 'single';
let preservedSingleResults = null;
let preservedBatchResults = null;

// ===================================
// MODE MANAGEMENT WITH RESULT PRESERVATION
// ===================================
window.WildlifeAI.UIManager.switchMode = function(mode) {
    console.log('🔄 Switching to mode:', mode, '| Preserving current results...');
    
    // PRESERVE CURRENT RESULTS BEFORE SWITCHING (MODE SPECIFIC)
    if (currentMode === 'single' && window.WildlifeAI.ImageHandler.hasImage()) {
        // Save single image results
        const currentResults = document.getElementById('results').innerHTML;
        if (currentResults && !currentResults.includes('Upload an image to see') && !currentResults.includes('Image loaded!')) {
            preservedSingleResults = currentResults;
            console.log('💾 Preserved single image results');
        }
    } else if (currentMode === 'batch') {
        // Save batch results
        const batchResults = window.WildlifeAI.BatchProcessor.getBatchResults();
        if (batchResults && batchResults.length > 0) {
            preservedBatchResults = batchResults;
            console.log('💾 Preserved batch results for', batchResults.length, 'images');
        }
    }
    
    // UPDATE CURRENT MODE
    const previousMode = currentMode;
    currentMode = mode;
    
    // Update button states
    document.querySelectorAll('.mode-button').forEach(btn => btn.classList.remove('active'));
    if (mode === 'single') {
        document.getElementById('singleModeBtn').classList.add('active');
    } else {
        document.getElementById('batchModeBtn').classList.add('active');
    }
    
    // UPDATE UI LAYOUT
    const mainContent = document.getElementById('mainContent');
    const uploadArea = document.querySelector('.upload-area');
    const uploadIcon = document.querySelector('.upload-icon');
    const uploadText = document.querySelector('.upload-text');
    const uploadSubtext = document.querySelector('.upload-subtext');
    const uploadSection = document.querySelector('.upload-section');
    
    if (mode === 'batch') {
        mainContent.classList.add('batch-mode');
        uploadSection.classList.add('batch-mode');
        uploadArea.classList.add('batch-mode');
        uploadIcon.classList.add('batch-mode');
        uploadText.classList.add('batch-mode');
        uploadIcon.textContent = '📁';
        uploadText.textContent = 'Upload Folder of Images';
        uploadSubtext.innerHTML = 'Click here or drag & drop a folder<br>For batch processing of multiple images';
    } else {
        mainContent.classList.remove('batch-mode');
        uploadSection.classList.remove('batch-mode');
        uploadArea.classList.remove('batch-mode');
        uploadIcon.classList.remove('batch-mode');
        uploadText.classList.remove('batch-mode');
        uploadIcon.textContent = '📷';
        uploadText.textContent = 'Upload Animal Image';
        uploadSubtext.innerHTML = 'Click here or drag & drop your image<br>Supports JPG, PNG, WebP formats';
    }
    
    // RESTORE PRESERVED RESULTS FOR THE NEW MODE
    restorePreservedResults(mode, previousMode);
};

// ===================================
// MODE-SPECIFIC RESULT PRESERVATION & RESTORATION
// ===================================
function restorePreservedResults(newMode, previousMode) {
    console.log('🔄 Restoring results for mode:', newMode);
    
    if (newMode === 'single') {
        // Switching TO single mode
        if (preservedSingleResults && window.WildlifeAI.ImageHandler.hasImage()) {
            // Restore single image results
            document.getElementById('results').innerHTML = preservedSingleResults;
            console.log('✅ Restored single image results');
        } else if (window.WildlifeAI.ImageHandler.hasImage()) {
            // Has image but no preserved results - show re-run message
            window.WildlifeAI.UIManager.showImageWithoutResults();
        } else {
            // No image - show default message
            window.WildlifeAI.UIManager.clearCurrentModeResults();
        }
    } else {
        // Switching TO batch mode
        if (preservedBatchResults && preservedBatchResults.length > 0) {
            // Restore batch results
            window.WildlifeAI.UIManager.displayBatchResults(preservedBatchResults);
            console.log('✅ Restored batch results for', preservedBatchResults.length, 'images');
        } else {
            // No preserved batch results - show default message
            window.WildlifeAI.UIManager.clearCurrentModeResults();
        }
    }
}

window.WildlifeAI.UIManager.showImageWithoutResults = function() {
    document.getElementById('results').innerHTML = `
        <div class="loading" style="color: #666;">
            <div style="font-size: 2rem; margin-bottom: 15px;">🔍</div>
            <div>Image loaded! Click <strong>"Upload Animal Image"</strong> to re-run classification</div>
            <div style="font-size: 0.9rem; margin-top: 10px; color: #888;">
                Or upload a new image to get fresh results
            </div>
        </div>
    `;
};

window.WildlifeAI.UIManager.getCurrentMode = function() {
    return currentMode;
};

// ===================================
// MODE-SPECIFIC CLEAR FUNCTIONS
// ===================================
window.WildlifeAI.UIManager.clearCurrentModeResults = function() {
    document.getElementById('results').innerHTML = `
        <div class="loading" style="color: #666;">
            <div style="font-size: 2rem; margin-bottom: 15px;">🎯</div>
            <div>Upload ${currentMode === 'single' ? 'an image' : 'a folder'} to see classification results</div>
        </div>
    `;
};

window.WildlifeAI.UIManager.clearCurrentModePreservedResults = function() {
    console.log('🧹 Clearing preserved results for current mode:', currentMode);
    
    if (currentMode === 'single') {
        preservedSingleResults = null;
        console.log('✅ Single mode preserved results cleared');
    } else {
        preservedBatchResults = null;
        console.log('✅ Batch mode preserved results cleared');
    }
};

window.WildlifeAI.UIManager.clearAllPreservedResults = function() {
    console.log('🧹 Clearing ALL preserved results...');
    preservedSingleResults = null;
    preservedBatchResults = null;
};

// ===================================
// SETUP UI EVENT LISTENERS
// ===================================
window.WildlifeAI.UIManager.setupUIHandlers = function() {
    console.log('🎨 Setting up UI handlers...');
    
    // Mode switcher buttons
    const singleBtn = document.getElementById('singleModeBtn');
    const batchBtn = document.getElementById('batchModeBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    if (singleBtn) {
        singleBtn.addEventListener('click', () => window.WildlifeAI.UIManager.switchMode('single'));
    }
    
    if (batchBtn) {
        batchBtn.addEventListener('click', () => window.WildlifeAI.UIManager.switchMode('batch'));
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', window.WildlifeAI.clearCurrentModeOnly);
    }
    
    console.log('✅ UI handlers set up successfully');
};

// ===================================
// RESULTS DISPLAY - SINGLE IMAGE
// ===================================
window.WildlifeAI.UIManager.displayResults = function(results) {
    const classificationsHTML = `
        <div class="classification-grid">
            ${createClassificationCard('Habitat Classification', results.domestic, '🏠')}
            ${createClassificationCard('Size Classification', results.size, '📏')}
            ${createClassificationCard('Species Classification', results.mammal, '🧬')}
        </div>
        
        <div style="margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%); border-radius: 16px; border: 2px solid #e1e7f5;">
            <h3 style="color: #333; margin-bottom: 15px; text-align: center;">📋 Complete Classification Summary</h3>
            <div style="font-family: 'Courier New', monospace; background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
                ${window.WildlifeAI.Utils.formatClassificationText(results.domestic)}<br>
                ${window.WildlifeAI.Utils.formatClassificationText(results.size)}<br>
                ${window.WildlifeAI.Utils.formatClassificationText(results.mammal)}
            </div>
            <div style="text-align: center; margin-top: 15px; font-size: 0.9rem; color: #666;">
                🎯 Thresholds: "Could be" (0-60%) | "Is likely" (60-80%) | "Is" (80%+)<br>
                <span class="label-positive">Green: Positive Cases</span> | <span class="label-negative">Orange: Negative Cases</span>
            </div>
        </div>
    `;
    
    document.getElementById('results').innerHTML = classificationsHTML;
    
    // Save these results for preservation (only for current mode)
    if (currentMode === 'single') {
        preservedSingleResults = classificationsHTML;
        console.log('💾 Single image results saved for preservation');
    }
};

function createClassificationCard(title, result, icon) {
    const level = window.WildlifeAI.Utils.getConfidenceLevel(result.confidence);
    const percentage = Math.round(result.confidence * 100);
    const labelColorClass = window.WildlifeAI.Utils.getLabelColorClass(result.label);
    const oppositeLabelColorClass = window.WildlifeAI.Utils.getLabelColorClass(result.opposite);
    
    return `
        <div class="classification-card">
            <div class="card-title">${icon} ${title}</div>
            <div class="confidence-bar">
                <div class="confidence-fill" style="width: ${percentage}%"></div>
            </div>
            <div class="confidence-text">
                Subject ${level === 'is' ? 'is' : level === 'likely' ? 'is likely' : 'could be'} <span class="${labelColorClass}">${result.label}</span> (${percentage}%)
                <span class="status-indicator ${window.WildlifeAI.Utils.getStatusClass(level)}">
                    ${level.toUpperCase()}
                </span>
            </div>
            <div style="font-size: 0.85rem; color: #666; margin-top: 8px; text-align: center;">
                Alternative: <span class="${oppositeLabelColorClass}">${result.opposite}</span> (${Math.round(result.oppositeConfidence * 100)}%)
            </div>
        </div>
    `;
}

// ===================================
// RESULTS DISPLAY - BATCH PROCESSING
// ===================================
window.WildlifeAI.UIManager.displayBatchResults = function(batchResults) {
    console.log('📊 Displaying batch results:', {
        totalResults: batchResults.length,
        successful: batchResults.filter(r => !r.error).length,
        errors: batchResults.filter(r => r.error).length
    });
    
    // Save batch results for preservation (only for current mode)
    if (currentMode === 'batch') {
        preservedBatchResults = batchResults;
        console.log('💾 Batch results saved for preservation');
    }
    
    // Validate batch results before displaying
    if (!Array.isArray(batchResults) || batchResults.length === 0) {
        console.error('❌ No batch results to display');
        document.getElementById('results').innerHTML = `
            <div class="loading" style="color: #dc3545;">
                <div style="font-size: 2rem; margin-bottom: 15px;">⚠️</div>
                <div>No results to display. Please try processing images again.</div>
            </div>
        `;
        return;
    }
    
    const summary = window.WildlifeAI.Utils.calculateBatchSummary(batchResults);
    console.log('📈 Batch summary calculated:', summary);
    
    // Validate summary
    if (!summary || typeof summary.totalFiles !== 'number') {
        console.error('❌ Invalid batch summary');
        return;
    }
    
    const resultsHTML = `
        <div class="batch-summary">
            <div class="total-files-card">
                <div class="total-files-number">${summary.totalFiles}</div>
                <div class="total-files-label">Total Images Processed</div>
                ${summary.totalProcessed < summary.totalFiles ? `<div style="font-size: 0.9rem; margin-top: 5px; opacity: 0.8;">(${summary.totalFiles - summary.totalProcessed} failed to process)</div>` : ''}
            </div>
            
            <div class="threshold-info">
                <strong>Confidence Thresholds:</strong> High (80%+) | Medium (60-80%) | Low (<60%)
            </div>
            
            <div class="classification-breakdown">
                <div class="breakdown-card">
                    <div class="breakdown-title">🏠 Habitat Classification</div>
                    <div class="confidence-breakdown-item confidence-high">
                        <span class="confidence-label">High Confidence</span>
                        <div class="confidence-stats">
                            <span class="confidence-count">${summary.domestic.high}</span>
                            <span class="confidence-percentage">(${summary.totalProcessed > 0 ? Math.round((summary.domestic.high / summary.totalProcessed) * 100) : 0}%)</span>
                        </div>
                    </div>
                    <div class="confidence-breakdown-item confidence-medium">
                        <span class="confidence-label">Medium Confidence</span>
                        <div class="confidence-stats">
                            <span class="confidence-count">${summary.domestic.medium}</span>
                            <span class="confidence-percentage">(${summary.totalProcessed > 0 ? Math.round((summary.domestic.medium / summary.totalProcessed) * 100) : 0}%)</span>
                        </div>
                    </div>
                    <div class="confidence-breakdown-item confidence-low">
                        <span class="confidence-label">Low Confidence</span>
                        <div class="confidence-stats">
                            <span class="confidence-count">${summary.domestic.low}</span>
                            <span class="confidence-percentage">(${summary.totalProcessed > 0 ? Math.round((summary.domestic.low / summary.totalProcessed) * 100) : 0}%)</span>
                        </div>
                    </div>
                </div>
                
                <div class="breakdown-card">
                    <div class="breakdown-title">📏 Size Classification</div>
                    <div class="confidence-breakdown-item confidence-high">
                        <span class="confidence-label">High Confidence</span>
                        <div class="confidence-stats">
                            <span class="confidence-count">${summary.size.high}</span>
                            <span class="confidence-percentage">(${summary.totalProcessed > 0 ? Math.round((summary.size.high / summary.totalProcessed) * 100) : 0}%)</span>
                        </div>
                    </div>
                    <div class="confidence-breakdown-item confidence-medium">
                        <span class="confidence-label">Medium Confidence</span>
                        <div class="confidence-stats">
                            <span class="confidence-count">${summary.size.medium}</span>
                            <span class="confidence-percentage">(${summary.totalProcessed > 0 ? Math.round((summary.size.medium / summary.totalProcessed) * 100) : 0}%)</span>
                        </div>
                    </div>
                    <div class="confidence-breakdown-item confidence-low">
                        <span class="confidence-label">Low Confidence</span>
                        <div class="confidence-stats">
                            <span class="confidence-count">${summary.size.low}</span>
                            <span class="confidence-percentage">(${summary.totalProcessed > 0 ? Math.round((summary.size.low / summary.totalProcessed) * 100) : 0}%)</span>
                        </div>
                    </div>
                </div>
                
                <div class="breakdown-card">
                    <div class="breakdown-title">🧬 Species Classification</div>
                    <div class="confidence-breakdown-item confidence-high">
                        <span class="confidence-label">High Confidence</span>
                        <div class="confidence-stats">
                            <span class="confidence-count">${summary.mammal.high}</span>
                            <span class="confidence-percentage">(${summary.totalProcessed > 0 ? Math.round((summary.mammal.high / summary.totalProcessed) * 100) : 0}%)</span>
                        </div>
                    </div>
                    <div class="confidence-breakdown-item confidence-medium">
                        <span class="confidence-label">Medium Confidence</span>
                        <div class="confidence-stats">
                            <span class="confidence-count">${summary.mammal.medium}</span>
                            <span class="confidence-percentage">(${summary.totalProcessed > 0 ? Math.round((summary.mammal.medium / summary.totalProcessed) * 100) : 0}%)</span>
                        </div>
                    </div>
                    <div class="confidence-breakdown-item confidence-low">
                        <span class="confidence-label">Low Confidence</span>
                        <div class="confidence-stats">
                            <span class="confidence-count">${summary.mammal.low}</span>
                            <span class="confidence-percentage">(${summary.totalProcessed > 0 ? Math.round((summary.mammal.low / summary.totalProcessed) * 100) : 0}%)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="batch-controls">
            <div style="color: #666; font-weight: 500;">
                📊 Processing completed for ${batchResults.length} images
            </div>
            <button class="export-button" onclick="window.WildlifeAI.exportResults()">
                📥 Export Results (CSV)
            </button>
        </div>
        
        <div class="batch-results">
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Preview</th>
                        <th>Filename</th>
                        <th>🏠 Habitat</th>
                        <th>📏 Size</th>
                        <th>🧬 Species</th>
                        <th>Summary</th>
                        <th style="text-align: center; width: 80px;">
                            <button class="clear-batch-button" onclick="window.WildlifeAI.clearCurrentModeOnly()" title="Clear batch results">
                                ✕ Clear
                            </button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    ${batchResults.map((result, index) => {
                        try {
                            return createTableRow(result);
                        } catch (error) {
                            console.error(`❌ Error creating table row for ${result.filename}:`, error);
                            return `<tr><td colspan="7" style="color: #dc3545;">Error displaying result for ${result.filename}</td></tr>`;
                        }
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('results').innerHTML = resultsHTML;
    console.log('✅ Batch results displayed successfully');
};

function createTableRow(result) {
    if (result.error) {
        return `
            <tr>
                <td><img src="${result.imageUrl}" class="image-thumbnail" alt="Error" onclick="showImageZoom('${result.imageUrl}')"></td>
                <td><div class="filename" title="${result.filename}">${result.filename}</div></td>
                <td colspan="4" style="color: #dc3545; font-weight: 500;">Error: ${result.error}</td>
                <td></td>
            </tr>
        `;
    }
    
    const domestic = result.classifications.domestic;
    const size = result.classifications.size;
    const mammal = result.classifications.mammal;
    
    return `
        <tr>
            <td><img src="${result.imageUrl}" class="image-thumbnail" alt="${result.filename}" onclick="showImageZoom('${result.imageUrl}')"></td>
            <td><div class="filename" title="${result.filename}">${result.filename}</div></td>
            <td>${window.WildlifeAI.Utils.formatConfidenceCell(domestic)}</td>
            <td>${window.WildlifeAI.Utils.formatConfidenceCell(size)}</td>
            <td>${window.WildlifeAI.Utils.formatConfidenceCell(mammal)}</td>
            <td style="font-family: 'Courier New', monospace; font-size: 0.8rem;">
                ${window.WildlifeAI.Utils.formatClassificationText(domestic)}<br>
                ${window.WildlifeAI.Utils.formatClassificationText(size)}<br>
                ${window.WildlifeAI.Utils.formatClassificationText(mammal)}
            </td>
            <td></td>
        </tr>
    `;
}

// ===================================
// LOADING STATES
// ===================================
window.WildlifeAI.UIManager.showLoadingState = function() {
    document.getElementById('results').innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <div>🧠 Analyzing image with AI models...</div>
            <div style="font-size: 0.9rem; margin-top: 10px; color: #888;">
                Running through Domestic/Wild, Size, and Mammal classifiers
            </div>
        </div>
    `;
};

window.WildlifeAI.UIManager.showBatchLoadingState = function() {
    document.getElementById('results').innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <div>🧠 Processing batch of images...</div>
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill" style="width: 0%"></div>
            </div>
            <div class="progress-text" id="progressText">Preparing...</div>
        </div>
    `;
};

window.WildlifeAI.UIManager.updateBatchProgress = function(current, total, message) {
    const percentage = (current / total) * 100;
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
    if (progressText) {
        progressText.textContent = `${current}/${total} - ${message}`;
    }
};

console.log('✅ UI Manager loaded');