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
        haarcascade_frontalface_alt.xml as fallback.
        
        References:
        - OpenCV's built-in Haar cascades: cv2.data.haarcascades
        - Viola-Jones face detection algorithm (2001)
        """
        # Load OpenCV's pre-trained Haar cascade for face detection
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        self.face_cascade = cv2.CascadeClassifier(cascade_path)
        
        # Backup: try alternative cascade if the first one fails
        if self.face_cascade.empty():
            cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_alt.xml'
            self.face_cascade = cv2.CascadeClassifier(cascade_path)
    
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
                print(f"Could not load image: {image_path}")
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
                print("No faces detected in the image")
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
            
            print(f"Face detected and cropped: {output_path}")
            print(f"Original size: {image.shape[1]}x{image.shape[0]}")
            print(f"Cropped size: {face_crop.shape[1]}x{face_crop.shape[0]}")
            
            return output_path
            
        except Exception as e:
            print(f"Error in face detection/cropping: {str(e)}")
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
                print(f"Could not load image: {image_path}")
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
                print("No faces detected in the image")
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
            
            print(f"Detected and cropped {len(faces)} faces")
            return cropped_faces
            
        except Exception as e:
            print(f"Error in multiple face detection: {str(e)}")
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