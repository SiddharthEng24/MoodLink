"""
MeetingTracker.py - Meeting Session and Emotion Data Management

This module handles tracking of emotion data during meeting sessions with timestamps,
provides meeting summary functionality, and manages cleanup operations.
"""

import json
import os
import shutil
from datetime import datetime
from typing import Dict, List, Any
from APicalls.gemini import gemini


class MeetingSession:
    """
    Manages a single meeting session with emotion tracking and cleanup.
    """
    
    def __init__(self, session_id: str = None):
        """
        Initialize a new meeting session.
        
        Args:
            session_id (str): Unique identifier for the session
        """
        self.session_id = session_id or self._generate_session_id()
        self.start_time = datetime.now()
        self.end_time = None
        self.emotion_data = []  # List of {timestamp, emotion, confidence, filename}
        self.image_paths = []   # List of all image file paths for cleanup
        self.is_active = True
        
    def _generate_session_id(self) -> str:
        """Generate a unique session ID based on timestamp."""
        return f"meeting_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    def add_emotion_data(self, emotion: str, confidence: float = None, 
                        filename: str = None, sanitized_path: str = None):
        """
        Add emotion data point to the session.
        
        Args:
            emotion (str): Detected emotion with emoji
            confidence (float): Confidence score
            filename (str): Original screenshot filename
            sanitized_path (str): Path to sanitized face image
        """
        if not self.is_active:
            return
            
        emotion_entry = {
            'timestamp': datetime.now().isoformat(),
            'emotion': emotion,
            'confidence': confidence,
            'filename': filename,
            'sanitized_path': sanitized_path,
            'elapsed_minutes': self._get_elapsed_minutes()
        }
        
        self.emotion_data.append(emotion_entry)
        
        # Track image paths for cleanup (avoid duplicates)
        if filename:
            original_path = f"/Users/alvishprasla/Code/JS/Moodlink/MoodLink/Testimages/{filename}"
            if original_path not in self.image_paths:
                self.image_paths.append(original_path)
                
        if sanitized_path and sanitized_path not in self.image_paths:
            self.image_paths.append(sanitized_path)
    
    def _get_elapsed_minutes(self) -> float:
        """Get elapsed time since session start in minutes."""
        elapsed = datetime.now() - self.start_time
        return elapsed.total_seconds() / 60
    
    def end_session(self):
        """Mark the session as ended."""
        self.end_time = datetime.now()
        self.is_active = False
    
    def get_meeting_summary_prompt(self) -> str:
        """
        Generate a prompt for Gemini to create a visually appealing HTML report.
        
        Returns:
            str: Formatted prompt for Gemini API to generate HTML
        """
        if not self.emotion_data:
            return "No emotion data collected during this session."
        
        # Calculate session duration
        duration_minutes = self._get_elapsed_minutes()
        
        # Format emotion timeline
        emotion_timeline = []
        for entry in self.emotion_data:
            emotion_timeline.append(
                f"• {entry['elapsed_minutes']:.1f}min: {entry['emotion']}"
            )
        
        # Count emotion frequencies
        emotion_counts = {}
        for entry in self.emotion_data:
            # Extract base emotion from emoji format (e.g., "😊 happy (85.3%)" -> "happy")
            emotion_parts = entry['emotion'].split(' ')
            if len(emotion_parts) >= 2:
                base_emotion = emotion_parts[1].lower()
                emotion_counts[base_emotion] = emotion_counts.get(base_emotion, 0) + 1
        
        prompt = f"""
Create a beautiful, modern HTML report for this meeting emotion analysis. Make it visually stunning with:
- Modern CSS styling with gradients, shadows, and animations
- Professional color scheme (dark theme preferred)
- Interactive charts or visual representations of emotions
- Responsive design
- Clean typography and layout

SESSION DATA:
- Duration: {duration_minutes:.1f} minutes
- Total emotion readings: {len(self.emotion_data)}
- Started: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}
- Ended: {self.end_time.strftime('%Y-%m-%d %H:%M:%S') if self.end_time else 'Ongoing'}

EMOTION TIMELINE:
{chr(10).join(emotion_timeline)}

EMOTION FREQUENCY:
{chr(10).join([f'• {emotion.title()}: {count} times' for emotion, count in emotion_counts.items()])}

Please provide a comprehensive meeting summary including:
1. Overall mood and energy levels throughout the session
2. Key emotional patterns or trends observed
3. Potential insights about engagement, stress, or satisfaction
4. Recommendations for future meetings based on emotional feedback
5. Notable emotional transitions or moments

Generate a complete HTML document with:
1. Modern CSS styling (embedded in <style> tags)
2. Professional meeting analysis content
3. Visual emotion breakdown with percentages
4. Timeline visualization
5. Key insights and recommendations
6. Responsive design for any screen size

Make it look like a premium business analytics report. Return ONLY the complete HTML code, nothing else.
"""
        return prompt
    
    def generate_summary(self) -> Dict[str, str]:
        """
        Generate meeting summary using Gemini API and save as HTML.
        
        Returns:
            dict: Contains summary text and HTML file path
        """
        try:
            prompt = self.get_meeting_summary_prompt()
            html_content = gemini(prompt)
            
            if html_content:
                # Save HTML report
                html_filename = f"meeting_report_{self.session_id}.html"
                html_path = f"/Users/alvishprasla/Code/JS/Moodlink/MoodLink/Testimages/{html_filename}"
                
                with open(html_path, 'w', encoding='utf-8') as f:
                    f.write(html_content)
                
                # Also save text version for API response
                text_summary = f"Meeting Report Generated - {self.session_id}\nDuration: {self._get_elapsed_minutes():.1f} minutes\nEmotions tracked: {len(self.emotion_data)}\nHTML report saved to: {html_filename}"
                
                return {
                    'summary': text_summary,
                    'html_path': html_path,
                    'html_filename': html_filename
                }
            else:
                return {
                    'summary': "Failed to generate HTML report using Gemini API.",
                    'html_path': None,
                    'html_filename': None
                }
                
        except Exception as e:
            return {
                'summary': f"Error generating HTML report: {str(e)}",
                'html_path': None,
                'html_filename': None
            }
    
    def cleanup_files(self):
        """
        Delete all images and clear data for this session.
        Enhanced version that ensures all files are deleted.
        """
        deleted_count = 0
        
        # Delete all tracked image files
        for image_path in self.image_paths:
            try:
                if os.path.exists(image_path):
                    os.remove(image_path)
                    deleted_count += 1
            except Exception as e:
                pass  # Continue deleting other files
        
        # Additional cleanup: Delete ALL screenshot files in Testimages directory
        testimages_dir = "/Users/alvishprasla/Code/JS/Moodlink/MoodLink/Testimages"
        try:
            if os.path.exists(testimages_dir):
                for filename in os.listdir(testimages_dir):
                    # Only delete screenshots, preserve HTML reports
                    if filename.startswith("screenshot_") and filename.endswith(".png"):
                        file_path = os.path.join(testimages_dir, filename)
                        try:
                            os.remove(file_path)
                            deleted_count += 1
                        except Exception as e:
                            pass
        except Exception as e:
            pass
        
        # Delete all files in the Sanitized subfolder
        sanitized_dir = "/Users/alvishprasla/Code/JS/Moodlink/MoodLink/Testimages/Sanitized"
        try:
            if os.path.exists(sanitized_dir):
                for filename in os.listdir(sanitized_dir):
                    file_path = os.path.join(sanitized_dir, filename)
                    try:
                        if os.path.isfile(file_path):
                            os.remove(file_path)
                            deleted_count += 1
                    except Exception as e:
                        pass
                
                # Remove the directory if it's empty
                try:
                    os.rmdir(sanitized_dir)
                except OSError:
                    pass
        except Exception as e:
            pass
        
        # Clear data
        self.emotion_data.clear()
        self.image_paths.clear()
        
        print(f"Cleanup complete: {deleted_count} files deleted")
        return deleted_count
    
    def get_session_data(self) -> Dict[str, Any]:
        """
        Get complete session data for API responses.
        
        Returns:
            dict: Complete session information
        """
        return {
            'session_id': self.session_id,
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'duration_minutes': self._get_elapsed_minutes(),
            'is_active': self.is_active,
            'emotion_count': len(self.emotion_data),
            'emotion_data': self.emotion_data,
            'image_count': len(self.image_paths)
        }


class MeetingTracker:
    """
    Global meeting tracker that manages the current active session.
    """
    
    def __init__(self):
        self.current_session = None
    
    def start_new_session(self) -> str:
        """
        Start a new meeting session.
        
        Returns:
            str: Session ID of the new session
        """
        # End current session if active
        if self.current_session and self.current_session.is_active:
            self.current_session.end_session()
        
        # Create new session
        self.current_session = MeetingSession()
        return self.current_session.session_id
    
    def add_emotion(self, emotion: str, confidence: float = None, 
                   filename: str = None, sanitized_path: str = None):
        """
        Add emotion data to the current session.
        """
        if not self.current_session:
            self.start_new_session()
        
        self.current_session.add_emotion_data(emotion, confidence, filename, sanitized_path)
    
    def end_current_session(self) -> Dict[str, Any]:
        """
        End the current session and generate summary.
        
        Returns:
            dict: Session summary and cleanup results
        """
        if not self.current_session:
            return {'error': 'No active session'}
        
        # End session
        self.current_session.end_session()
        
        # Generate summary
        summary_result = self.current_session.generate_summary()
        
        # Get session data before cleanup
        session_data = self.current_session.get_session_data()
        
        # Cleanup files
        deleted_files = self.current_session.cleanup_files()
        
        result = {
            'session_data': session_data,
            'summary': summary_result['summary'],
            'html_path': summary_result['html_path'],
            'html_filename': summary_result['html_filename'],
            'deleted_files': deleted_files,
            'cleanup_complete': True
        }
        
        # Clear current session
        self.current_session = None
        
        return result
    
    def get_current_session_info(self) -> Dict[str, Any]:
        """
        Get information about the current session.
        
        Returns:
            dict: Current session information or None
        """
        if self.current_session:
            return self.current_session.get_session_data()
        return None


# Global tracker instance
meeting_tracker = MeetingTracker()