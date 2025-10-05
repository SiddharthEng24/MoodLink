from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import os
from datetime import datetime

from APicalls.Identifyer import identify
from APicalls.FaceSanitizer import sanitize_image_for_emotion_detection
from APicalls.MeetingTracker import meeting_tracker

# Global iterator counter for screenshot naming
screenshot_counter = 0

def get_next_screenshot_id():
    """Get the next screenshot ID using global iterator"""
    global screenshot_counter
    screenshot_counter += 1
    return screenshot_counter

def add_cors_headers(response):
    """Add CORS headers to response for Chrome extension compatibility"""
    response['Access-Control-Allow-Origin'] = '*'
    response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response['Access-Control-Allow-Headers'] = 'Content-Type, Accept'
    return response

def handle_cors_preflight(request):
    """Handle CORS preflight requests"""
    if request.method == 'OPTIONS':
        response = JsonResponse({})
        return add_cors_headers(response)
    return None

@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def upload_screenshot(request):
    """
    Handle screenshot upload, emotion detection, and session tracking.
    
    Process:
    1. Save uploaded screenshot
    2. Sanitize image (crop to face)
    3. Detect emotion using AI model
    4. Track in meeting session
    5. Return emotion result
    """
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return handle_cors_preflight(request)
        
    try:
        # Validate request
        if 'screenshot' not in request.FILES:
            response = JsonResponse({
                'success': False,
                'error': 'No screenshot file provided'
            }, status=400)
            return add_cors_headers(response)
        
        screenshot_file = request.FILES['screenshot']
        
        # Generate unique filename
        screenshot_id = get_next_screenshot_id()
        unique_filename = f"screenshot_{screenshot_id}.png"
        file_path = f"/Users/alvishprasla/Code/JS/Moodlink/MoodLink/Testimages/{unique_filename}"
        
        # Create directory if needed
        os.makedirs("/Users/alvishprasla/Code/JS/Moodlink/MoodLink/Testimages", exist_ok=True)
        
        # Save screenshot
        with open(file_path, 'wb') as f:
            for chunk in screenshot_file.chunks():
                f.write(chunk)
        
        # Process image: sanitize (crop to face) and detect emotion
        sanitized_image_path = sanitize_image_for_emotion_detection(file_path)
        predicted_emotion = identify(sanitized_image_path)
        
        # Track emotion in meeting session
        try:
            # Extract confidence percentage if available
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
            
        except Exception as e:
            pass  # Continue processing even if session tracking fails
        
        # Return success response
        response = JsonResponse({
            'success': True,
            'message': 'Screenshot processed successfully',
            'emotion': predicted_emotion,
            'session_info': meeting_tracker.get_current_session_info(),
            'data': {
                'filename': unique_filename,
                'screenshot_id': screenshot_id
            }
        }, status=200)
        return add_cors_headers(response)
        
    except Exception as e:
        response = JsonResponse({
            'success': False,
            'error': f'Processing failed: {str(e)}'
        }, status=500)
        return add_cors_headers(response)


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def end_meeting_session(request):
    """
    End current meeting session and generate AI summary.
    
    Process:
    1. End active meeting session
    2. Generate AI summary using Gemini
    3. Clean up image files
    4. Return session statistics and summary
    """
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return handle_cors_preflight(request)
        
    try:
        # End session and get summary
        result = meeting_tracker.end_current_session()
        
        # Check for errors
        if 'error' in result:
            response = JsonResponse({
                'success': False,
                'error': result['error']
            }, status=400)
            return add_cors_headers(response)
        
        # Log session completion
        session_data = result['session_data']
        print(f"Meeting completed: {session_data['emotion_count']} emotions, {session_data['duration_minutes']:.1f}min")
        
        # Return success response
        response_data = {
            'success': True,
            'message': 'Meeting session ended and summary generated successfully',
            'session_data': session_data,
            'summary': result['summary'],
            'deleted_files': result['deleted_files'],
            'cleanup_complete': result['cleanup_complete']
        }
        
        # Add HTML report URL if available
        if result.get('html_filename'):
            response_data['html_report_url'] = f'http://localhost:8000/api/report/{result["html_filename"]}'
            response_data['html_filename'] = result['html_filename']
        
        response = JsonResponse(response_data, status=200)
        return add_cors_headers(response)
        
    except Exception as e:
        response = JsonResponse({
            'success': False,
            'error': f'Failed to end session: {str(e)}'
        }, status=500)
        return add_cors_headers(response)


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def serve_html_report(request, filename):
    """
    Serve HTML report files.
    
    Args:
        filename (str): Name of the HTML report file
    """
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return handle_cors_preflight(request)
        
    try:
        # Validate filename for security
        if not filename.endswith('.html') or '..' in filename:
            return JsonResponse({
                'success': False,
                'error': 'Invalid filename'
            }, status=400)
        
        # Construct file path
        file_path = f"/Users/alvishprasla/Code/JS/Moodlink/MoodLink/Testimages/{filename}"
        
        # Check if file exists
        if not os.path.exists(file_path):
            return JsonResponse({
                'success': False,
                'error': 'Report not found'
            }, status=404)
        
        # Read and serve HTML file
        with open(file_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # Create HTTP response with HTML content
        response = HttpResponse(html_content, content_type='text/html')
        return add_cors_headers(response)
        
    except Exception as e:
        response = JsonResponse({
            'success': False,
            'error': f'Failed to serve report: {str(e)}'
        }, status=500)
        return add_cors_headers(response)