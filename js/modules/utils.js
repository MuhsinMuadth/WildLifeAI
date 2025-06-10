// ===================================
// WILDLIFE AI UTILS
// ===================================

window.WildlifeAI = window.WildlifeAI || {};
window.WildlifeAI.Utils = {};

// ===================================
// CONFIDENCE LEVEL UTILITIES
// ===================================
window.WildlifeAI.Utils.getConfidenceLevel = function(confidence) {
    const THRESHOLDS = window.WildlifeAI.THRESHOLDS;
    if (confidence >= THRESHOLDS.IS) return 'is';
    if (confidence >= THRESHOLDS.LIKELY) return 'likely';
    return 'could be';
};

window.WildlifeAI.Utils.getStatusClass = function(level) {
    switch(level) {
        case 'is': return 'status-is';
        case 'likely': return 'status-likely';
        default: return 'status-could-be';
    }
};

window.WildlifeAI.Utils.getConfidenceClass = function(confidence) {
    const THRESHOLDS = window.WildlifeAI.THRESHOLDS;
    if (confidence >= THRESHOLDS.IS) return 'confidence-high';
    if (confidence >= THRESHOLDS.LIKELY) return 'confidence-medium';
    return 'confidence-low';
};

// ===================================
// LABEL UTILITIES
// ===================================
window.WildlifeAI.Utils.getLabelColorClass = function(label) {
    const POSITIVE_LABELS = window.WildlifeAI.POSITIVE_LABELS;
    const NEGATIVE_LABELS = window.WildlifeAI.NEGATIVE_LABELS;
    
    if (POSITIVE_LABELS.includes(label)) {
        return 'label-positive';
    } else if (NEGATIVE_LABELS.includes(label)) {
        return 'label-negative';
    }
    return '';
};

// ===================================
// FORMATTING UTILITIES
// ===================================
window.WildlifeAI.Utils.formatClassificationText = function(result) {
    if (!result) return 'Error';
    
    const level = window.WildlifeAI.Utils.getConfidenceLevel(result.confidence);
    const percentage = Math.round(result.confidence * 100);
    const labelColorClass = window.WildlifeAI.Utils.getLabelColorClass(result.label);
    
    switch(level) {
        case 'is':
            return `Subject is <span class="${labelColorClass}">${result.label}</span> (${percentage}%)`;
        case 'likely':
            return `Subject is likely <span class="${labelColorClass}">${result.label}</span> (${percentage}%)`;
        default:
            return `Subject could be <span class="${labelColorClass}">${result.label}</span> (${percentage}%)`;
    }
};

// ===================================
// PLAIN TEXT FORMATTING FOR CSV EXPORT
// ===================================
window.WildlifeAI.Utils.formatClassificationTextPlain = function(result) {
    if (!result) return 'Error';
    
    const level = window.WildlifeAI.Utils.getConfidenceLevel(result.confidence);
    const percentage = Math.round(result.confidence * 100);
    
    switch(level) {
        case 'is':
            return `Subject is ${result.label} (${percentage}%)`;
        case 'likely':
            return `Subject is likely ${result.label} (${percentage}%)`;
        default:
            return `Subject could be ${result.label} (${percentage}%)`;
    }
};

window.WildlifeAI.Utils.formatConfidenceCell = function(classification) {
    if (!classification) return '<span style="color: #666;">Error</span>';
    
    const percentage = Math.round(classification.confidence * 100);
    const level = window.WildlifeAI.Utils.getConfidenceLevel(classification.confidence);
    const confidenceClass = level === 'is' ? 'confidence-high' : 
                          level === 'likely' ? 'confidence-medium' : 'confidence-low';
    const labelColorClass = window.WildlifeAI.Utils.getLabelColorClass(classification.label);
    
    return `
        <div style="text-align: center;">
            <div style="font-weight: 600; margin-bottom: 4px;" class="${labelColorClass}">${classification.label}</div>
            <div class="confidence-mini ${confidenceClass}">${percentage}%</div>
        </div>
    `;
};

// ===================================
// FILE UTILITIES
// ===================================
window.WildlifeAI.Utils.isValidImageFile = function(file) {
    return file && file.type.startsWith('image/');
};

window.WildlifeAI.Utils.loadImageFromFile = function(file) {
    return new Promise((resolve, reject) => {
        console.log(`🖼️ Loading image from file: ${file.name} (${file.size} bytes)`);
        
        if (!window.WildlifeAI.Utils.isValidImageFile(file)) {
            reject(new Error(`Invalid image file: ${file.name}`));
            return;
        }
        
        const img = new Image();
        
        img.onload = function() {
            console.log(`✅ Image loaded successfully: ${file.name}`, {
                dimensions: `${img.width}x${img.height}`,
                aspectRatio: (img.width / img.height).toFixed(2)
            });
            resolve(img);
        };
        
        img.onerror = function(error) {
            console.error(`❌ Failed to load image: ${file.name}`, error);
            reject(new Error(`Failed to load image: ${file.name}`));
        };
        
        img.src = URL.createObjectURL(file);
    });
};

// ===================================
// EXPORT UTILITIES
// ===================================
window.WildlifeAI.Utils.exportResultsToCSV = function(batchResults) {
    let csvContent = "Filename,Habitat_Label,Habitat_Confidence,Size_Label,Size_Confidence,Species_Label,Species_Confidence,Summary\n";
    
    batchResults.forEach(result => {
        if (!result.error && result.classifications) {
            const domestic = result.classifications.domestic;
            const size = result.classifications.size;
            const mammal = result.classifications.mammal;
            
            // Use plain text formatting for CSV
            const summary = `"${window.WildlifeAI.Utils.formatClassificationTextPlain(domestic)} | ${window.WildlifeAI.Utils.formatClassificationTextPlain(size)} | ${window.WildlifeAI.Utils.formatClassificationTextPlain(mammal)}"`;
            
            csvContent += `"${result.filename}",` +
                `"${domestic.label}",${Math.round(domestic.confidence * 100)},` +
                `"${size.label}",${Math.round(size.confidence * 100)},` +
                `"${mammal.label}",${Math.round(mammal.confidence * 100)},` +
                `${summary}\n`;
        } else {
            csvContent += `"${result.filename}",Error,Error,Error,Error,Error,Error,"${result.error || 'Unknown error'}"\n`;
        }
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `wildlife_ai_results_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// ===================================
// CALCULATION UTILITIES
// ===================================
window.WildlifeAI.Utils.calculateBatchSummary = function(batchResults) {
    const THRESHOLDS = window.WildlifeAI.THRESHOLDS;
    let domesticSummary = { high: 0, medium: 0, low: 0 };
    let sizeSummary = { high: 0, medium: 0, low: 0 };
    let mammalSummary = { high: 0, medium: 0, low: 0 };
    let totalProcessed = 0;
    
    batchResults.forEach(result => {
        if (!result.error && result.classifications) {
            totalProcessed++;
            
            // Categorise domestic classification
            const domesticConf = result.classifications.domestic?.confidence || 0;
            if (domesticConf >= THRESHOLDS.IS) {
                domesticSummary.high++;
            } else if (domesticConf >= THRESHOLDS.LIKELY) {
                domesticSummary.medium++;
            } else {
                domesticSummary.low++;
            }
            
            // Categorise size classification
            const sizeConf = result.classifications.size?.confidence || 0;
            if (sizeConf >= THRESHOLDS.IS) {
                sizeSummary.high++;
            } else if (sizeConf >= THRESHOLDS.LIKELY) {
                sizeSummary.medium++;
            } else {
                sizeSummary.low++;
            }
            
            // Categorise mammal classification
            const mammalConf = result.classifications.mammal?.confidence || 0;
            if (mammalConf >= THRESHOLDS.IS) {
                mammalSummary.high++;
            } else if (mammalConf >= THRESHOLDS.LIKELY) {
                mammalSummary.medium++;
            } else {
                mammalSummary.low++;
            }
        }
    });
    
    return { 
        domestic: domesticSummary, 
        size: sizeSummary, 
        mammal: mammalSummary,
        totalProcessed: totalProcessed,
        totalFiles: batchResults.length
    };
};

console.log('✅ Utils loaded');