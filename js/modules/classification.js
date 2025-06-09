// ===================================
// WILDLIFE AI CLASSIFICATION
// ===================================

window.WildlifeAI = window.WildlifeAI || {};
window.WildlifeAI.Classification = {};

// ===================================
// MODEL VARIABLES
// ===================================
let domesticClassifier, sizeClassifier, mammalClassifier;

// ===================================
// MODEL LOADING
// ===================================
window.WildlifeAI.Classification.preloadModels = function() {
    console.log('🧠 Loading AI models...');
    const MODEL_URLS = window.WildlifeAI.MODEL_URLS;
    
    // Load the three trained models
    domesticClassifier = ml5.imageClassifier(MODEL_URLS.DOMESTIC, () => {
        console.log('✅ Domestic classifier loaded');
    });
    sizeClassifier = ml5.imageClassifier(MODEL_URLS.SIZE, () => {
        console.log('✅ Size classifier loaded');
    });
    mammalClassifier = ml5.imageClassifier(MODEL_URLS.MAMMAL, () => {
        console.log('✅ Mammal classifier loaded');
    });
};

// ===================================
// CLASSIFICATION FUNCTIONS
// ===================================
window.WildlifeAI.Classification.classifyImage = async function(imageElement) {
    try {
        console.log('🔍 Starting classification...');
        
        // Run all three classifications simultaneously
        const [domesticResults, sizeResults, mammalResults] = await Promise.all([
            domesticClassifier.classify(imageElement),
            sizeClassifier.classify(imageElement),
            mammalClassifier.classify(imageElement)
        ]);
        
        console.log('✅ Classification completed');
        
        // Process and return results
        return {
            domestic: window.WildlifeAI.Classification.processClassificationResult(domesticResults),
            size: window.WildlifeAI.Classification.processClassificationResult(sizeResults),
            mammal: window.WildlifeAI.Classification.processClassificationResult(mammalResults)
        };
        
    } catch (error) {
        console.error('❌ Classification error:', error);
        throw error;
    }
};

window.WildlifeAI.Classification.classifyImageBatch = async function(img) {
    console.log('🔍 Starting batch classification for image...');
    
    try {
        // Ensure all models are loaded
        if (!domesticClassifier || !sizeClassifier || !mammalClassifier) {
            throw new Error('One or more AI models not loaded yet');
        }
        
        console.log('🧠 Running all three classifiers simultaneously...');
        const [domesticResults, sizeResults, mammalResults] = await Promise.all([
            domesticClassifier.classify(img),
            sizeClassifier.classify(img),
            mammalClassifier.classify(img)
        ]);
        
        console.log('📊 Raw classification results:', {
            domestic: domesticResults,
            size: sizeResults,
            mammal: mammalResults
        });
        
        // Process each result
        const processedResults = {
            domestic: window.WildlifeAI.Classification.processClassificationResult(domesticResults),
            size: window.WildlifeAI.Classification.processClassificationResult(sizeResults),
            mammal: window.WildlifeAI.Classification.processClassificationResult(mammalResults)
        };
        
        // Validate processed results
        if (!processedResults.domestic || !processedResults.size || !processedResults.mammal) {
            throw new Error('Failed to process one or more classification results');
        }
        
        console.log('✅ Processed classification results:', processedResults);
        return processedResults;
        
    } catch (error) {
        console.error('❌ Classification error:', error);
        throw error;
    }
};

// ===================================
// RESULT PROCESSING
// ===================================
window.WildlifeAI.Classification.processClassificationResult = function(results) {
    console.log('🔧 Processing classification result:', results);
    
    if (!results || !Array.isArray(results) || results.length < 2) {
        console.error('❌ Invalid classification results:', results);
        return null;
    }
    
    // Validate that results have required properties
    if (!results[0].label || typeof results[0].confidence !== 'number' ||
        !results[1].label || typeof results[1].confidence !== 'number') {
        console.error('❌ Classification results missing required properties:', results);
        return null;
    }
    
    const processed = {
        label: results[0].label,
        confidence: results[0].confidence,
        opposite: results[1].label,
        oppositeConfidence: results[1].confidence
    };
    
    console.log('✅ Processed result:', processed);
    return processed;
};

// ===================================
// MODEL STATUS CHECKS
// ===================================
window.WildlifeAI.Classification.areModelsLoaded = function() {
    return domesticClassifier && sizeClassifier && mammalClassifier;
};

window.WildlifeAI.Classification.getModelInfo = function() {
    return {
        domestic: domesticClassifier ? 'Loaded' : 'Loading...',
        size: sizeClassifier ? 'Loaded' : 'Loading...',
        mammal: mammalClassifier ? 'Loaded' : 'Loading...'
    };
};

console.log('✅ Classification module loaded');