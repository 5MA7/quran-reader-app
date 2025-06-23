// Quran Reader Application - Islamic Design
// Complete functionality with bookmarks, highlights, and audio synchronization
// Minimal Quran Audio Integration - No Navigation Changes
class QuranAudioManager {
    constructor() {
        // QuranicAudio.com API
        this.baseAudioUrl = 'https://download.quranicaudio.com/quran/';
        this.reciterPath = 'mishaari_raashid_al_3afaasee/';
        
        // Audio state
        this.currentChapter = null;
        this.isPlaying = false;
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    init() {
        console.log('Initializing audio manager...');
        
        // Get only audio-related elements
        this.audioPlayer = document.getElementById('audioPlayer');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.prevVerseBtn = document.getElementById('prevVerseBtn');
        this.nextVerseBtn = document.getElementById('nextVerseBtn');
        this.speedSelect = document.getElementById('speedSelect');
        this.progressFill = document.getElementById('progressFill');
        this.progressSlider = document.getElementById('progressSlider');
        this.currentTimeSpan = document.getElementById('currentTime');
        this.durationSpan = document.getElementById('duration');
        this.chaptersGrid = document.getElementById('chaptersGrid');
        
        // Only set up audio if elements exist
        if (this.audioPlayer && this.playPauseBtn) {
            this.setupAudioControls();
            this.setupChapterClicks();
            console.log('Audio manager initialized successfully');
        } else {
            console.log('Audio elements not found, skipping audio setup');
        }
    }
    
    setupAudioControls() {
        // Audio control buttons
        if (this.playPauseBtn) {
            this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        }
        
        if (this.prevVerseBtn) {
            this.prevVerseBtn.addEventListener('click', () => this.previousVerse());
        }
        
        if (this.nextVerseBtn) {
            this.nextVerseBtn.addEventListener('click', () => this.nextVerse());
        }
        
        if (this.speedSelect) {
            this.speedSelect.addEventListener('change', (e) => {
                this.audioPlayer.playbackRate = parseFloat(e.target.value);
            });
        }
        
        if (this.progressSlider) {
            this.progressSlider.addEventListener('input', (e) => {
                if (this.audioPlayer.duration) {
                    this.audioPlayer.currentTime = (e.target.value / 100) * this.audioPlayer.duration;
                }
            });
        }
        
        // Audio events
        this.audioPlayer.addEventListener('loadstart', () => this.showStatus('Loading audio...'));
        this.audioPlayer.addEventListener('canplay', () => this.showStatus('Ready to play'));
        this.audioPlayer.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
        this.audioPlayer.addEventListener('ended', () => this.audioEnded());
        this.audioPlayer.addEventListener('error', (e) => this.handleAudioError(e));
        this.audioPlayer.addEventListener('play', () => this.updatePlayButton(true));
        this.audioPlayer.addEventListener('pause', () => this.updatePlayButton(false));
    }
    
    setupChapterClicks() {
        // Add click listeners to existing chapter cards
        if (this.chaptersGrid) {
            // Use event delegation to catch clicks on chapter cards
            this.chaptersGrid.addEventListener('click', (e) => {
                const chapterCard = e.target.closest('.chapter-card');
                if (chapterCard) {
                    this.loadChapterAudio(chapterCard);
                }
            });
        }
    }
    
    loadChapterAudio(chapterCard) {
        // Try to extract chapter number from the card
        const chapterNumber = this.extractChapterNumber(chapterCard);
        
        if (chapterNumber) {
            console.log(`Loading audio for chapter ${chapterNumber}`);
            this.loadAudio(chapterNumber);
        }
    }
    
    extractChapterNumber(chapterCard) {
        // Try multiple ways to get chapter number
        
        // Method 1: Look for chapter-number class
        const numberElement = chapterCard.querySelector('.chapter-number');
        if (numberElement) {
            return parseInt(numberElement.textContent);
        }
        
        // Method 2: Look for chapter ID in data attributes
        const chapterId = chapterCard.dataset.chapterId;
        if (chapterId) {
            return parseInt(chapterId);
        }
        
        // Method 3: Extract from chapter title text
        const titleElement = chapterCard.querySelector('h3, h4, .chapter-name-english');
        if (titleElement) {
            const match = titleElement.textContent.match(/(\d+)\./);
            if (match) {
                return parseInt(match[1]);
            }
        }
        
        // Method 4: Extract from any text in the card
        const cardText = chapterCard.textContent;
        const match = cardText.match(/(\d+)\./);
        if (match) {
            return parseInt(match[1]);
        }
        
        console.log('Could not extract chapter number from:', chapterCard);
        return null;
    }
    
    async loadAudio(chapterNumber) {
        try {
            this.currentChapter = chapterNumber;
            this.showStatus('Loading audio...');
            
            const paddedId = chapterNumber.toString().padStart(3, '0');
            const audioUrl = `${this.baseAudioUrl}${this.reciterPath}${paddedId}.mp3`;
            
            console.log('Loading audio from:', audioUrl);
            
            // Clear previous source
            this.audioPlayer.src = '';
            this.audioPlayer.src = audioUrl;
            this.audioPlayer.load();
            
        } catch (error) {
            console.error('Error loading audio:', error);
            this.showStatus('Failed to load audio');
        }
    }
    
    togglePlayPause() {
        if (!this.audioPlayer.src) {
            this.showStatus('Please select a chapter first');
            return;
        }
        
        if (this.isPlaying) {
            this.audioPlayer.pause();
        } else {
            this.audioPlayer.play().catch(e => {
                console.error('Playback failed:', e);
                this.showStatus('Playback failed');
            });
        }
    }
    
    previousVerse() {
        if (this.audioPlayer.currentTime > 10) {
            this.audioPlayer.currentTime -= 10;
        } else {
            this.audioPlayer.currentTime = 0;
        }
    }
    
    nextVerse() {
        this.audioPlayer.currentTime = Math.min(
            this.audioPlayer.currentTime + 15, 
            this.audioPlayer.duration || 0
        );
    }
    
    updateProgress() {
        if (!this.audioPlayer.duration) return;
        
        const progress = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
        
        if (this.progressFill) {
            this.progressFill.style.width = `${progress}%`;
        }
        if (this.progressSlider) {
            this.progressSlider.value = progress;
        }
        if (this.currentTimeSpan) {
            this.currentTimeSpan.textContent = this.formatTime(this.audioPlayer.currentTime);
        }
    }
    
    updateDuration() {
        if (this.audioPlayer.duration && this.durationSpan) {
            this.durationSpan.textContent = this.formatTime(this.audioPlayer.duration);
        }
    }
    
    updatePlayButton(playing) {
        this.isPlaying = playing;
        if (this.playPauseBtn) {
            this.playPauseBtn.innerHTML = playing ? '⏸' : '▶';
            this.playPauseBtn.title = playing ? 'Pause' : 'Play';
        }
    }
    
    audioEnded() {
        this.updatePlayButton(false);
        if (this.progressFill) this.progressFill.style.width = '0%';
        if (this.progressSlider) this.progressSlider.value = 0;
        this.showStatus('Chapter completed');
    }
    
    handleAudioError(error) {
        console.error('Audio error:', error);
        this.showStatus('Audio failed to load');
    }
    
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    showStatus(message) {
        console.log('Audio Status:', message);
        
        // Try to show status in any available element
        const statusElements = [
            document.getElementById('audioLoading'),
            document.getElementById('toast'),
            document.querySelector('.loading'),
            document.querySelector('.status')
        ];
        
        for (const element of statusElements) {
            if (element) {
                element.textContent = message;
                element.style.display = 'block';
                setTimeout(() => {
                    element.style.display = 'none';
                }, 3000);
                break;
            }
        }
    }
}

// Initialize audio manager
console.log('Starting Quran app...');
window.quranAudioManager = new QuranAudioManager();
