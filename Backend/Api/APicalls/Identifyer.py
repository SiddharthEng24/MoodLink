from transformers import AutoImageProcessor, AutoModelForImageClassification
from PIL import Image
import torch


def identify(image_path):
    """
    Identify emotion from image and return just the predicted emotion as a string.
    """
    try:
        # Load model and processor
        model_name = "abhilash88/face-emotion-detection"
        processor = AutoImageProcessor.from_pretrained(model_name)
        model = AutoModelForImageClassification.from_pretrained(model_name)

        # Load and preprocess the image
        image = Image.open(image_path)
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Preprocess
        inputs = processor(images=image, return_tensors="pt")

        # Forward pass
        with torch.no_grad():
            outputs = model(**inputs)

        # Get prediction
        logits = outputs.logits
        predicted_class_id = logits.argmax(-1).item()
        
        # Use model labels if available, otherwise use fallback
        if hasattr(model.config, 'id2label') and model.config.id2label:
            predicted_emotion = model.config.id2label[predicted_class_id]
        else:
            # Fallback emotion mapping
            emotion_labels = {
                0: "angry", 1: "disgust", 2: "fear", 3: "happy",
                4: "sad", 5: "surprise", 6: "neutral"
            }
            predicted_emotion = emotion_labels.get(predicted_class_id, "unknown")

        return predicted_emotion
        
    except Exception as e:
        print(f"Error in emotion detection: {str(e)}")
        return "unknown"