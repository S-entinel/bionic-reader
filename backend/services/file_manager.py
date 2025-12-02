import uuid
from typing import Dict, Optional
from datetime import datetime, timedelta

class FileManager:
    """
    Manages temporary storage of uploaded EPUB files with session IDs.
    """
    
    def __init__(self, expiry_hours: int = 2):
        self.files: Dict[str, dict] = {}
        self.expiry_hours = expiry_hours
    
    def store_file(self, file_bytes: bytes, filename: str) -> str:
        """Store an EPUB file and return a session ID."""
        file_id = str(uuid.uuid4())
        
        self.files[file_id] = {
            'content': file_bytes,
            'filename': filename,
            'uploaded_at': datetime.now(),
            'last_accessed': datetime.now()
        }
        
        self._cleanup_expired()
        return file_id
    
    def get_file(self, file_id: str) -> Optional[bytes]:
        """Retrieve an EPUB file by session ID."""
        if file_id not in self.files:
            return None
        
        self.files[file_id]['last_accessed'] = datetime.now()
        return self.files[file_id]['content']
    
    def get_filename(self, file_id: str) -> Optional[str]:
        """Get the original filename."""
        if file_id not in self.files:
            return None
        return self.files[file_id]['filename']
    
    def delete_file(self, file_id: str) -> bool:
        """Delete a file from storage."""
        if file_id in self.files:
            del self.files[file_id]
            return True
        return False
    
    def _cleanup_expired(self):
        """Remove expired files."""
        now = datetime.now()
        expired_ids = []
        
        for file_id, file_data in self.files.items():
            time_since_access = now - file_data['last_accessed']
            if time_since_access > timedelta(hours=self.expiry_hours):
                expired_ids.append(file_id)
        
        for file_id in expired_ids:
            del self.files[file_id]
        
        if expired_ids:
            print(f"Cleaned up {len(expired_ids)} expired files")

# Global instance
file_manager = FileManager(expiry_hours=2)