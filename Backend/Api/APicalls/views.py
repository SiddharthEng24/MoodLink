from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import os
from datetime import datetime

from APicalls.Identifyer import identify

# Global iterator counter
screenshot_counter = 0

def get_next_screenshot_id():
    """Get the next screenshot ID using global iterator"""
    global screenshot_counter
    screenshot_counter += 1
    return screenshot_counter

@csrf_exempt
@require_http_methods(["POST"])
def upload_screenshot(request):
    try:
        # Check if screenshot file is in the request
        if 'screenshot' not in request.FILES:
            return JsonResponse({
                'success': False,
                'error': 'No screenshot file provided'
            }, status=400)
        
        screenshot_file = request.FILES['screenshot']
        
        # Get next screenshot ID from global iterator
        iter = get_next_screenshot_id()
        # Generate unique filename with iterator
        unique_filename = f"screenshot_{iter}.png"
        print(f"Screenshot ID: {iter}, Filename: {unique_filename}")
        
        # Save to Testimages folder only
        file_path = rf"C:\Users\engin\IdeaProjects\MoodLink\Testimages\{unique_filename}"

        # Create directory if it doesn't exist
        os.makedirs(r"C:\Users\engin\IdeaProjects\MoodLink\Testimages", exist_ok=True)

        # Save the file
        with open(file_path, 'wb') as f:
            for chunk in screenshot_file.chunks():
                f.write(chunk)
        
        # Log the received data
        print(f"Screenshot received:")
        print(f"  - File: {unique_filename}")
        print(f"  - Saved to: {file_path}")
        
        # Get emotion prediction
        predicted_emotion = identify(file_path)
        print(f"Predicted emotion: {predicted_emotion}")
        
        # Return success response
        return JsonResponse({
            'success': True,
            'message': 'Screenshot uploaded successfully!',
            'emotion': predicted_emotion,
            'data': {
                'filename': unique_filename,
                'file_path': file_path
            }
        }, status=200)
        
    except Exception as e:
        print(f"Error uploading screenshot: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': f'Upload failed: {str(e)}'
        }, status=500)
