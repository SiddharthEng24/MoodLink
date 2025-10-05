"""
FaceSanitizer.py - Face Detection and Cropping Module for Emotion Detection

This module implements face detection and cropping functionality using OpenCV's
pre-trained Haar Cascade classifiers to sanitize images for emotion detection.

Dependencies:
- OpenCV (cv2): Computer vision library for face detection
- NumPy: Numerical computing library for array operations
- PIL (Pillow): Python Imaging Library for image processing
- OS: Standard library for file system operations

Technical References:
1. Viola, P., & Jones, M. (2001). Rapid object detection using a boosted cascade 
   of simple features. Computer Vision and Pattern Recognition (CVPR).
   - Basis for Haar Cascade face detection algorithm used in OpenCV

2. OpenCV Documentation: Face Detection using Haar Cascades
   https://docs.opencv.org/4.x/db/d28/tutorial_cascade_classifier.html
   - Implementation guide for cascade classifiers

3. Lienhart, R., & Maydt, J. (2002). An extended set of Haar-like features for 
   rapid object detection. Image Processing (ICIP).
   - Extended Haar features used in haarcascade_frontalface_default.xml

"""

import cv2
import numpy as np
from PIL import Image
import os


class FaceSanitizer:
    """
    A class for detecting and cropping faces from images using OpenCV's Haar Cascades.
    
    This class provides functionality to:
    - Detect faces in images using pre-trained Haar Cascade classifiers
    - Crop images to focus on the largest detected face
    - Handle multiple faces in a single image
    - Save sanitized images to organized directory structures
    
    Attributes:
        face_cascade (cv2.CascadeClassifier): OpenCV cascade classifier for face detection
    """
    
    def __init__(self):
        """
        Initialize the Face Sanitizer with OpenCV's pre-trained face detection model.
        
        Uses haarcascade_frontalface_default.xml as primary classifier, with
        multiple fallback options for reliability.
        
        References:
        - OpenCV's built-in Haar cascades: cv2.data.haarcascades
        - Viola-Jones face detection algorithm (2001)
        """
        import os
        
        # Try multiple cascade paths in order of preference
        cascade_paths = [
            # Local project path
            os.path.join(os.path.dirname(__file__), 'haarcascade_frontalface_default.xml'),
            # OpenCV's built-in cascades
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml',
            cv2.data.haarcascades + 'haarcascade_frontalface_alt.xml',
            cv2.data.haarcascades + 'haarcascade_frontalface_alt2.xml'
        ]
        
        self.face_cascade = None
        for cascade_path in cascade_paths:
            if os.path.exists(cascade_path):
                temp_cascade = cv2.CascadeClassifier(cascade_path)
                if not temp_cascade.empty():
                    self.face_cascade = temp_cascade
                    print(f"Face detection loaded from: {cascade_path}")
                    break
        
        if self.face_cascade is None or self.face_cascade.empty():
            raise RuntimeError("Could not load any face detection cascade file")
    
    def detect_and_crop_face(self, image_path, output_path=None, padding=0.2):
        """
        Detect the largest face in an image and crop it with configurable padding.
        
        Implementation based on:
        - Viola-Jones face detection algorithm
        - OpenCV's detectMultiScale method with optimized parameters
        
        Args:
            image_path (str): Path to the input image
            output_path (str): Path to save the cropped face (optional)
            padding (float): Extra padding around the face (0.0 to 1.0)
        
        Returns:
            str: Path to the cropped face image, or original path if no face found
            
        Technical Details:
        - scaleFactor=1.1: How much the image size is reduced at each scale
        - minNeighbors=5: How many neighbors each candidate rectangle should retain
        - minSize=(30, 30): Minimum possible face size, smaller faces ignored
        """
        try:
            # Read the image
            image = cv2.imread(image_path)
            if image is None:
                return image_path
            
            # Convert to grayscale for face detection
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Detect faces using Haar Cascade classifier
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,          # Image pyramid scale factor
                minNeighbors=5,           # Minimum neighbor detections required
                minSize=(30, 30),         # Minimum face size in pixels
                flags=cv2.CASCADE_SCALE_IMAGE  # Use image scaling for detection
            )
            
            if len(faces) == 0:
                return image_path
            
            # Get the largest face (assuming it's the main subject)
            # Face area = width * height
            largest_face = max(faces, key=lambda face: face[2] * face[3])
            x, y, w, h = largest_face
            
            # Add configurable padding around the face for context
            padding_x = int(w * padding)
            padding_y = int(h * padding)
            
            # Calculate crop coordinates with padding, ensuring we don't exceed image bounds
            x1 = max(0, x - padding_x)
            y1 = max(0, y - padding_y)
            x2 = min(image.shape[1], x + w + padding_x)
            y2 = min(image.shape[0], y + h + padding_y)
            
            # Crop the face from the image
            face_crop = image[y1:y2, x1:x2]
            
            # Generate output path if not provided
            if output_path is None:
                # Create sanitized subfolder
                original_dir = os.path.dirname(image_path)
                sanitized_dir = os.path.join(original_dir, "Sanitized")
                os.makedirs(sanitized_dir, exist_ok=True)
                
                # Create cropped version in the sanitized folder
                base_name = os.path.splitext(os.path.basename(image_path))[0]
                extension = os.path.splitext(image_path)[1]
                output_path = os.path.join(sanitized_dir, f"{base_name}_face_cropped{extension}")
            
            # Save the cropped face
            cv2.imwrite(output_path, face_crop)
            
            return output_path
            
        except Exception as e:
            return image_path
    
    def sanitize_image(self, image_path):
        """
        Main function to sanitize an image by cropping to the face.
        
        Args:
            image_path (str): Path to the input image
        
        Returns:
            str: Path to the sanitized (face-cropped) image
        """
        return self.detect_and_crop_face(image_path)
    
    def detect_multiple_faces(self, image_path, output_dir=None):
        """
        Detect and crop all faces in an image.
        
        Args:
            image_path (str): Path to the input image
            output_dir (str): Directory to save cropped faces
        
        Returns:
            list: List of paths to cropped face images
        """
        try:
            # Read the image
            image = cv2.imread(image_path)
            if image is None:
                return []
            
            # Convert to grayscale for face detection
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Detect faces
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30)
            )
            
            if len(faces) == 0:
                return []
            
            # Create output directory if not provided
            if output_dir is None:
                base_dir = os.path.dirname(image_path)
                base_name = os.path.splitext(os.path.basename(image_path))[0]
                output_dir = os.path.join(base_dir, f"{base_name}_faces")
            
            os.makedirs(output_dir, exist_ok=True)
            
            cropped_faces = []
            
            # Crop each detected face
            for i, (x, y, w, h) in enumerate(faces):
                # Add slight padding
                padding = 10
                x1 = max(0, x - padding)
                y1 = max(0, y - padding)
                x2 = min(image.shape[1], x + w + padding)
                y2 = min(image.shape[0], y + h + padding)
                
                # Crop the face
                face_crop = image[y1:y2, x1:x2]
                
                # Save the cropped face
                base_name = os.path.splitext(os.path.basename(image_path))[0]
                output_path = os.path.join(output_dir, f"{base_name}_face_{i+1}.png")
                cv2.imwrite(output_path, face_crop)
                cropped_faces.append(output_path)
            
            return cropped_faces
            
        except Exception as e:
            return []


# Utility function for easy import
def sanitize_image_for_emotion_detection(image_path):
    """
    Convenience function to sanitize an image for emotion detection.
    
    Args:
        image_path (str): Path to the input image
    
    Returns:
        str: Path to the sanitized image (cropped to face)
    """
    sanitizer = FaceSanitizer()
    return sanitizer.sanitize_image(image_path)


def sanitize_all_faces_for_emotion_detection(image_path):
    """
    Detect and sanitize ALL faces in an image for emotion detection.
    
    Args:
        image_path (str): Path to the input image
    
    Returns:
        list: List of paths to all cropped face images
    """
    sanitizer = FaceSanitizer()
    
    try:
        # Read the image
        image = cv2.imread(image_path)
        if image is None:
            return []
        
        # Convert to grayscale for face detection
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = sanitizer.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )
        
        if len(faces) == 0:
            return []
        
        # Create sanitized directory
        original_dir = os.path.dirname(image_path)
        sanitized_dir = os.path.join(original_dir, "Sanitized")
        os.makedirs(sanitized_dir, exist_ok=True)
        
        cropped_faces = []
        base_name = os.path.splitext(os.path.basename(image_path))[0]
        extension = os.path.splitext(image_path)[1]
        
        # Sort faces by size (largest first) to maintain consistency
        faces_sorted = sorted(faces, key=lambda face: face[2] * face[3], reverse=True)
        
        # Crop each detected face
        for i, (x, y, w, h) in enumerate(faces_sorted):
            # Add padding around the face
            padding_x = int(w * 0.2)
            padding_y = int(h * 0.2)
            
            # Calculate crop coordinates with padding
            x1 = max(0, x - padding_x)
            y1 = max(0, y - padding_y)
            x2 = min(image.shape[1], x + w + padding_x)
            y2 = min(image.shape[0], y + h + padding_y)
            
            # Crop the face
            face_crop = image[y1:y2, x1:x2]
            
            # Save the cropped face
            output_path = os.path.join(sanitized_dir, f"{base_name}_face_{i+1}{extension}")
            cv2.imwrite(output_path, face_crop)
            cropped_faces.append(output_path)
        
        return cropped_faces
        
    except Exception as e:
        return []


# Test function
def test_face_sanitizer(image_path):
    """
    Test the face sanitizer with an image.
    """
    sanitizer = FaceSanitizer()
    
    print(f"Testing face sanitizer with: {image_path}")
    
    # Test single face detection
    cropped_path = sanitizer.sanitize_image(image_path)
    print(f"Sanitized image saved to: {cropped_path}")
    
    # Test multiple face detection
    face_paths = sanitizer.detect_multiple_faces(image_path)
    print(f"Multiple faces saved to: {face_paths}")
    
    return cropped_path


if __name__ == "__main__":
    # Example usage
    test_image = "/path/to/your/test/image.jpg"
    if os.path.exists(test_image):
        test_face_sanitizer(test_image)
    else:
        print("Please provide a valid image path for testing")