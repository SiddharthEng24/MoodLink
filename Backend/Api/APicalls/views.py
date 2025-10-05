from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import os
from datetime import datetime

from APicalls.Identifyer import identify
from APicalls.FaceSanitizer import sanitize_image_for_emotion_detection
from APicalls.MeetingTracker import meeting_tracker

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
        file_path = f"/Users/alvishprasla/Code/JS/Moodlink/MoodLink/Testimages/{unique_filename}"
        
        # Create directory if it doesn't exist
        os.makedirs("/Users/alvishprasla/Code/JS/Moodlink/MoodLink/Testimages", exist_ok=True)
        
        # Save the file
        with open(file_path, 'wb') as f:
            for chunk in screenshot_file.chunks():
                f.write(chunk)
        
        # Log the received data
        print(f"Screenshot received:")
        print(f"  - File: {unique_filename}")
        print(f"  - Saved to: {file_path}")
        
        # Sanitize image by cropping to face
        print("Sanitizing image (cropping to face)...")
        sanitized_image_path = sanitize_image_for_emotion_detection(file_path)
        print(f"Sanitized image: {sanitized_image_path}")
        
        # Get emotion prediction from sanitized image
        predicted_emotion = identify(sanitized_image_path)
        print(f"Predicted emotion: {predicted_emotion}")
        
        # Track emotion data in meeting session
        try:
            # Extract confidence from emotion string (e.g., "😊 happy (85.3%)")
            confidence = None
            if '(' in predicted_emotion and '%' in predicted_emotion:
                confidence_str = predicted_emotion.split('(')[1].split('%')[0]
                confidence = float(confidence_str) / 100.0
            
            meeting_tracker.add_emotion(
                emotion=predicted_emotion,
                confidence=confidence,
                filename=unique_filename,
                sanitized_path=sanitized_image_path
            )
            print(f"Emotion data tracked in meeting session")
        except Exception as e:
            print(f"Error tracking emotion data: {str(e)}")
        
        # Return success response
        return JsonResponse({
            'success': True,
            'message': 'Screenshot uploaded and processed successfully!',
            'emotion': predicted_emotion,
            'session_info': meeting_tracker.get_current_session_info(),
            'data': {
                'filename': unique_filename,
                'file_path': file_path,
                'sanitized_path': sanitized_image_path
            }
        }, status=200)
        
    except Exception as e:
        print(f"Error uploading screenshot: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': f'Upload failed: {str(e)}'
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def end_meeting_session(request):
    """
    End the current meeting session, generate summary, and cleanup files.
    """
    try:
        print("Ending meeting session and generating summary...")
        
        # End session and get summary
        result = meeting_tracker.end_current_session()
        
        if 'error' in result:
            return JsonResponse({
                'success': False,
                'error': result['error']
            }, status=400)
        
        print(f"Meeting session ended successfully:")
        print(f"  - Duration: {result['session_data']['duration_minutes']:.1f} minutes")
        print(f"  - Emotions tracked: {result['session_data']['emotion_count']}")
        print(f"  - Files deleted: {result['deleted_files']}")
        
        return JsonResponse({
            'success': True,
            'message': 'Meeting session ended and summary generated successfully!',
            'session_data': result['session_data'],
            'summary': result['summary'],
            'deleted_files': result['deleted_files'],
            'cleanup_complete': result['cleanup_complete']
        }, status=200)
        
    except Exception as e:
        print(f"Error ending meeting session: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': f'Failed to end session: {str(e)}'
        }, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_session_status(request):
    """
    Get current meeting session status and data.
    """
    try:
        session_info = meeting_tracker.get_current_session_info()
        
        if session_info:
            return JsonResponse({
                'success': True,
                'has_active_session': True,
                'session_info': session_info
            }, status=200)
        else:
            return JsonResponse({
                'success': True,
                'has_active_session': False,
                'session_info': None
            }, status=200)
            
    except Exception as e:
        print(f"Error getting session status: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': f'Failed to get session status: {str(e)}'
        }, status=500)

