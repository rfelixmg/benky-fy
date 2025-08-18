document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const imagePlaceholder = document.getElementById('imagePlaceholder');
    const uploadedImage = document.getElementById('uploadedImage');
    const resultsContent = document.getElementById('resultsContent');
    const predictionDisplay = document.getElementById('predictionDisplay');
    
    // Drag and drop functionality
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageUpload(files[0]);
        }
    });
    
    // Click to upload
    uploadArea.addEventListener('click', function() {
        imageInput.click();
    });
    
    // File input change
    imageInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleImageUpload(e.target.files[0]);
        }
    });
    
    function handleImageUpload(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showError('Please select a valid image file.');
            return;
        }
        
        // Validate file size (16MB)
        if (file.size > 16 * 1024 * 1024) {
            showError('File size must be less than 16MB.');
            return;
        }
        
        // Show loading state
        uploadArea.classList.add('loading');
        
        // Create FormData for upload
        const formData = new FormData();
        formData.append('image', file);
        
        // Upload image and get prediction
        fetch('/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            uploadArea.classList.remove('loading');
            
            if (data.success) {
                displayResults(data);
            } else {
                showError(data.error || 'An error occurred during prediction.');
            }
        })
        .catch(error => {
            uploadArea.classList.remove('loading');
            console.error('Error:', error);
            showError('An error occurred while uploading the image.');
        });
    }
    
    function displayResults(data) {
        // Display uploaded image
        uploadedImage.src = data.image;
        uploadedImage.style.display = 'block';
        imagePlaceholder.style.display = 'none';
        
        // Hide initial content and show prediction
        resultsContent.style.display = 'none';
        predictionDisplay.style.display = 'block';
        
        // Update prediction values
        document.getElementById('predictedAge').textContent = data.prediction.age;
        document.getElementById('confidenceScore').textContent = Math.round(data.prediction.confidence * 100);
        document.getElementById('ageRange').textContent = data.prediction.age_range;
        document.getElementById('predictionMessage').innerHTML = `<p>${data.prediction.message}</p>`;
        
        // Animate confidence bar
        const confidenceFill = document.getElementById('confidenceFill');
        const confidencePercentage = data.prediction.confidence * 100;
        
        setTimeout(() => {
            confidenceFill.style.width = confidencePercentage + '%';
        }, 300);
        
        // Add success animation
        predictionDisplay.style.animation = 'fadeInUp 0.8s ease-out';
    }
    
    function showError(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-message">${message}</span>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Add error styles
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fed7d7;
            border: 1px solid #feb2b2;
            border-radius: 10px;
            padding: 1rem;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }
    
    // Add some interactive effects
    uploadArea.addEventListener('mouseenter', function() {
        if (!this.classList.contains('loading')) {
            this.style.transform = 'scale(1.02)';
        }
    });
    
    uploadArea.addEventListener('mouseleave', function() {
        if (!this.classList.contains('loading')) {
            this.style.transform = 'scale(1)';
        }
    });
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .error-content {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .error-icon {
            font-size: 1.2rem;
        }
        
        .error-message {
            color: #c53030;
            font-weight: 500;
        }
        
        .error-close {
            background: none;
            border: none;
            color: #c53030;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            margin-left: 0.5rem;
        }
        
        .error-close:hover {
            color: #9b2c2c;
        }
    `;
    document.head.appendChild(style);
});
