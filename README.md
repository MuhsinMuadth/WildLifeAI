# Wildlife AI - Animal Classification System

A web application that uses machine learning to classify animals by habitat (domestic/wild), size (large/small), and species (mammal/non-mammal). Built with Teachable Machine AI models for educational purposes.

## Features

### Processing Modes
- **Single Image Analysis** - Upload individual photos for detailed classification
- **Batch Processing** - Process entire folders of images efficiently

### Classification Categories
- **Habitat Classification** - Domestic vs Wild animals
- **Size Classification** - Large vs Small animals  
- **Species Classification** - Mammal vs Non-Mammal

### User Interface
- Drag and drop file uploads
- Real-time processing progress
- Confidence level indicators
- Automatic result display
- CSV export functionality

## Installation

### Quick Start
```bash
# Download or clone the project
# Open index.html in your web browser
```

### File Structure
```
wildlife-ai/
├── index.html                 # Main application
├── css/
│   └── styles.css            # Styling
├── js/
│   ├── main.js               # Application entry point
│   ├── config/
│   │   └── constants.js      # Configuration
│   └── modules/
│       ├── classification.js  # AI model handling
│       ├── imageHandler.js   # Single image processing
│       ├── batchProcessor.js # Batch processing
│       ├── uiManager.js      # Interface management
│       └── utils.js          # Utility functions
```

## Configuration

### Setting Up AI Models
1. Open `js/config/constants.js`
2. Replace the model URLs with your Teachable Machine model URLs:

```javascript
export const MODEL_URLS = {
    DOMESTIC: "https://teachablemachine.withgoogle.com/models/YOUR_MODEL_ID/model.json",
    SIZE: "https://teachablemachine.withgoogle.com/models/YOUR_MODEL_ID/model.json", 
    MAMMAL: "https://teachablemachine.withgoogle.com/models/YOUR_MODEL_ID/model.json"
};
```

### Adjusting Confidence Thresholds
```javascript
export const THRESHOLDS = {
    LIKELY: 0.60,  // 60% confidence threshold
    IS: 0.80       // 80% confidence threshold
};
```

## How to Use

### Single Image Mode
1. Click the "Single Image" tab
2. Upload an animal photo (JPG, PNG, or WebP format)
3. Wait for processing to complete
4. View the classification results below

The system will display:
- Classification for each category (habitat, size, species)
- Confidence percentages
- Alternative classifications
- Overall summary

### Batch Processing Mode
1. Click the "Batch Processing" tab
2. Select a folder containing animal images
3. Monitor the processing progress
4. Review the summary statistics
5. Export results as CSV if needed

### Understanding Results

**Confidence Levels:**
- **High (80%+)**: Strong certainty in classification
- **Medium (60-80%)**: Moderate certainty
- **Low (<60%)**: Lower certainty

**Result Indicators:**
- "Subject **is** [classification]" - High confidence (80%+)
- "Subject **is likely** [classification]" - Medium confidence (60-80%)
- "Subject **could be** [classification]" - Low confidence (<60%)

## Additional Features

### Result Preservation
- Switch between single and batch modes without losing your work
- Results are automatically saved when changing modes

### Re-processing
- Upload the same image or folder again to re-run analysis
- System will ask for confirmation before re-processing

### Export Options
- Batch results can be exported as CSV files
- Includes all classification data and confidence scores

## Technical Requirements

### Browser Compatibility
- Modern web browsers (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Internet connection (for loading AI models)

### Supported Image Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

## Troubleshooting

### Common Issues

**Images won't upload:**
- Check file format is supported
- Ensure file size isn't too large
- Try refreshing the page

**AI models not working:**
- Verify model URLs in `constants.js` are correct
- Check internet connection
- Ensure Teachable Machine models are publicly accessible

**Batch processing stuck:**
- Try with fewer images
- Check browser console for error messages
- Refresh the page and try again

### Debug Options
Open browser developer tools (F12) and use console commands:

```javascript
// Reset everything
window.WildlifeAI.clearEverything();

// Check current batch results
window.WildlifeAI.BatchProcessor.getBatchResults();
```

## Technical Details

### Architecture
The application uses a modular JavaScript architecture with separate files for different functionality:

- **classification.js** - Handles AI model loading and image classification
- **imageHandler.js** - Manages single image uploads and processing
- **batchProcessor.js** - Handles folder uploads and batch processing
- **uiManager.js** - Manages user interface and result display
- **utils.js** - Contains helper functions and utilities

### Libraries Used
- **ML5.js** - Machine learning library for Teachable Machine integration
- **P5.js** - Canvas library for image display and manipulation

## Development Notes

### Code Organisation
- ES6 modules with import/export
- Global namespace (`window.WildlifeAI`) for cross-module communication
- Comprehensive error handling and logging
- Memory management for image URLs

### Customisation
- Confidence thresholds can be adjusted in `constants.js`
- Processing delays can be modified in `BATCH_CONFIG`
- UI text and styling can be updated in respective files
