// Quran Reader Application - Islamic Design
// Complete functionality with bookmarks, highlights, and audio synchronization

// Corrected Quran App with Proper Error Handling
class AlhambraQuranApp {
    constructor() {
        // QuranicAudio.com API configuration
        this.baseAudioUrl = 'https://download.quranicaudio.com/quran/';
        this.reciterPath = 'mishaari_raashid_al_3afaasee/'; // Al-Afasy
        
        // App state
        this.currentChapter = null;
        this.currentVerseIndex = 0;
        this.isPlaying = false;
        this.verses = [];
        this.bookmarks = JSON.parse(localStorage.getItem('quran_bookmarks') || '{}');
        this.highlights = JSON.parse(localStorage.getItem('quran_highlights') || '{}');
        
        // Get DOM elements with null checks
        this.initializeElements();
        
        // Only initialize if essential elements exist
        if (this.hasEssentialElements()) {
            this.init();
        } else {
            console.error('Essential DOM elements not found. Check your HTML structure.');
        }
    }
    
    // Initialize DOM elements with proper null checking
    initializeElements() {
        // Audio elements
        this.audioPlayer = document.getElementById('audioPlayer');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.prevVerseBtn = document.getElementById('prevVerseBtn');
        this.nextVerseBtn = document.getElementById('nextVerseBtn');
        this.speedSelect = document.getElementById('speedSelect');
        this.progressFill = document.getElementById('progressFill');
        this.progressSlider = document.getElementById('progressSlider');
        this.currentTimeSpan = document.getElementById('currentTime');
        this.durationSpan = document.getElementById('duration');
        
        // Main content elements
        this.chaptersGrid = document.getElementById('chaptersGrid');
        this.versesContainer = document.getElementById('versesContainer');
        this.chapterTitleArabic = document.getElementById('chapterTitleArabic');
        this.chapterTitleEnglish = document.getElementById('chapterTitleEnglish');
        this.chapterTranslation = document.getElementById('chapterTranslation');
        
        // Status elements
        this.audioLoading = document.getElementById('audioLoading');
        this.audioError = document.getElementById('audioError');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.toast = document.getElementById('toast');
        this.toastMessage = document.getElementById('toastMessage');
        
        // Navigation elements
        this.homeBtn = document.getElementById('homeBtn');
        this.bookmarksBtn = document.getElementById('bookmarksBtn');
        this.highlightsBtn = document.getElementById('highlightsBtn');
        this.backBtn = document.getElementById('backBtn');
        
        // Section elements
        this.chapterList = document.getElementById('chapterList');
        this.chapterReader = document.getElementById('chapterReader');
        this.bookmarksSection = document.getElementById('bookmarksSection');
        this.highlightsSection = document.getElementById('highlightsSection');
        this.bookmarksList = document.getElementById('bookmarksList');
        this.highlightsList = document.getElementById('highlightsList');
    }
    
    // Check if essential elements exist
    hasEssentialElements() {
        const essential = [
            this.audioPlayer,
            this.playPauseBtn,
            this.chaptersGrid,
            this.versesContainer
        ];
        
        return essential.every(element => element !== null);
    }
    
    init() {
        this.setupEventListeners();
        this.loadChapters();
        this.showToast('Quran Reader initialized with Al-Afasy recitation');
        console.log('Alhambra Quran App initialized successfully');
    }
    
    setupEventListeners() {
        // Navigation buttons (with null checks)
        if (this.homeBtn) {
            this.homeBtn.addEventListener('click', () => this.showChapterList());
        }
        if (this.bookmarksBtn) {
            this.bookmarksBtn.addEventListener('click', () => this.showBookmarks());
        }
        if (this.highlightsBtn) {
            this.highlightsBtn.addEventListener('click', () => this.showHighlights());
        }
        if (this.backBtn) {
            this.backBtn.addEventListener('click', () => this.showChapterList());
        }
        
        // Audio controls (with null checks)
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
                if (this.audioPlayer) {
                    this.audioPlayer.playbackRate = parseFloat(e.target.value);
                }
            });
        }
        
        // Progress slider (with null check)
        if (this.progressSlider) {
            this.progressSlider.addEventListener('input', (e) => {
                if (this.audioPlayer && this.audioPlayer.duration) {
                    this.audioPlayer.currentTime = (e.target.value / 100) * this.audioPlayer.duration;
                }
            });
        }
        
        // Audio event listeners (with null check)
        if (this.audioPlayer) {
            this.audioPlayer.addEventListener('loadstart', () => this.showAudioLoading());
            this.audioPlayer.addEventListener('canplay', () => this.hideAudioLoading());
            this.audioPlayer.addEventListener('loadedmetadata', () => this.updateDuration());
            this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
            this.audioPlayer.addEventListener('ended', () => this.audioEnded());
            this.audioPlayer.addEventListener('error', (e) => this.handleAudioError(e));
            this.audioPlayer.addEventListener('play', () => this.updatePlayButton(true));
            this.audioPlayer.addEventListener('pause', () => this.updatePlayButton(false));
        }
    }
    
    // Load and display chapters
    loadChapters() {
        if (!this.chaptersGrid) {
            console.error('Chapters grid not found');
            return;
        }
        
        const chapters = this.getChapterData();
        this.chaptersGrid.innerHTML = '';
        
        chapters.forEach(chapter => {
            const chapterCard = document.createElement('div');
            chapterCard.className = 'chapter-card';
            chapterCard.innerHTML = `
                <div class="chapter-number">${chapter.id}</div>
                <h3 class="chapter-name-arabic">${chapter.arabic}</h3>
                <h4 class="chapter-name-english">${chapter.name}</h4>
                <p class="chapter-info">${chapter.verses} verses • ${chapter.type}</p>
                <div class="chapter-translation">"${chapter.translation}"</div>
            `;
            
            chapterCard.addEventListener('click', () => this.loadChapter(chapter.id));
            this.chaptersGrid.appendChild(chapterCard);
        });
    }
    
    // Load specific chapter with audio
    async loadChapter(chapterId) {
        try {
            this.showLoadingOverlay();
            this.hideAudioError();
            
            // Get chapter data
            const chapterData = this.getChapterData().find(c => c.id === chapterId);
            if (!chapterData) {
                throw new Error(`Chapter ${chapterId} not found`);
            }
            
            this.currentChapter = chapterData;
            
            // Load chapter audio with timeout
            await this.loadChapterAudio(chapterId);
            
            // Display chapter
            this.displayChapter(chapterData);
            
            // Load verses
            this.loadVerses(chapterId);
            
            // Show chapter reader
            this.showChapterReader();
            
            this.hideLoadingOverlay();
            this.showToast(`Loaded: ${chapterData.name}`);
            
        } catch (error) {
            console.error('Error loading chapter:', error);
            this.hideLoadingOverlay();
            this.showAudioError();
            this.showToast('Failed to load chapter. Please try again.');
        }
    }
    
    // Load chapter audio with better error handling
    async loadChapterAudio(chapterId) {
        if (!this.audioPlayer) {
            throw new Error('Audio player not available');
        }
        
        const paddedId = chapterId.toString().padStart(3, '0');
        const audioUrl = `${this.baseAudioUrl}${this.reciterPath}${paddedId}.mp3`;
        
        console.log('Loading audio from:', audioUrl);
        
        return new Promise((resolve, reject) => {
            // Set a timeout for loading
            const timeout = setTimeout(() => {
                reject(new Error('Audio loading timed out'));
            }, 15000); // 15 second timeout
            
            const handleCanPlay = () => {
                clearTimeout(timeout);
                this.audioPlayer.removeEventListener('canplay', handleCanPlay);
                this.audioPlayer.removeEventListener('error', handleError);
                resolve();
            };
            
            const handleError = (e) => {
                clearTimeout(timeout);
                this.audioPlayer.removeEventListener('canplay', handleCanPlay);
                this.audioPlayer.removeEventListener('error', handleError);
                reject(new Error('Failed to load audio: ' + e.message));
            };
            
            this.audioPlayer.addEventListener('canplay', handleCanPlay);
            this.audioPlayer.addEventListener('error', handleError);
            
            this.audioPlayer.src = audioUrl;
            this.audioPlayer.load();
        });
    }
    
    // Display chapter information
    displayChapter(chapterData) {
        if (this.chapterTitleArabic) {
            this.chapterTitleArabic.textContent = chapterData.arabic;
        }
        if (this.chapterTitleEnglish) {
            this.chapterTitleEnglish.textContent = `${chapterData.id}. ${chapterData.name}`;
        }
        if (this.chapterTranslation) {
            this.chapterTranslation.textContent = `"${chapterData.translation}" • ${chapterData.verses} verses • ${chapterData.type}`;
        }
    }
    
    // Load and display verses
    loadVerses(chapterId) {
        if (!this.versesContainer) {
            console.error('Verses container not found');
            return;
        }
        
        const verses = this.getVerseData(chapterId);
        this.verses = verses;
        this.versesContainer.innerHTML = '';
        
        verses.forEach((verse, index) => {
            const verseElement = document.createElement('div');
            verseElement.className = 'verse-item';
            verseElement.id = `verse-${index}`;
            verseElement.innerHTML = `
                <div class="verse-header">
                    <span class="verse-number">${verse.number}</span>
                    <div class="verse-actions">
                        <button class="action-btn bookmark-btn" onclick="quranApp.toggleBookmark(${chapterId}, ${verse.number})" title="Bookmark">
                            ${this.isBookmarked(chapterId, verse.number) ? '🔖' : '📖'}
                        </button>
                        <button class="action-btn highlight-btn" onclick="quranApp.toggleHighlight(${chapterId}, ${verse.number})" title="Highlight">
                            ${this.isHighlighted(chapterId, verse.number) ? '✨' : '⭐'}
                        </button>
                    </div>
                </div>
                <div class="verse-arabic" dir="rtl">${verse.arabic}</div>
                <div class="verse-english">${verse.english}</div>
            `;
            
            this.versesContainer.appendChild(verseElement);
        });
    }
    
    // Audio control methods
    togglePlayPause() {
        if (!this.audioPlayer) {
            this.showToast('Audio player not available');
            return;
        }
        
        if (this.isPlaying) {
            this.audioPlayer.pause();
        } else {
            this.audioPlayer.play().catch(e => {
                console.error('Playback failed:', e);
                this.showToast('Playback failed. Please check your internet connection.');
            });
        }
    }
    
    previousVerse() {
        if (!this.audioPlayer) return;
        
        if (this.audioPlayer.currentTime > 10) {
            this.audioPlayer.currentTime -= 10;
        } else {
            this.audioPlayer.currentTime = 0;
        }
    }
    
    nextVerse() {
        if (!this.audioPlayer) return;
        
        this.audioPlayer.currentTime = Math.min(
            this.audioPlayer.currentTime + 15, 
            this.audioPlayer.duration || 0
        );
    }
    
    // Update progress and time displays
    updateProgress() {
        if (!this.audioPlayer || !this.audioPlayer.duration) return;
        
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
        
        // Basic verse highlighting
        this.highlightCurrentVerse();
    }
    
    updateDuration() {
        if (this.audioPlayer && this.audioPlayer.duration && this.durationSpan) {
            this.durationSpan.textContent = this.formatTime(this.audioPlayer.duration);
        }
    }
    
    // Basic verse highlighting based on progress
    highlightCurrentVerse() {
        if (this.verses.length === 0) return;
        
        // Remove previous highlighting
        document.querySelectorAll('.verse-item').forEach(verse => {
            verse.classList.remove('playing');
        });
        
        // Calculate approximate verse based on progress
        const progress = this.audioPlayer.currentTime / this.audioPlayer.duration;
        const estimatedVerseIndex = Math.floor(progress * this.verses.length);
        
        const currentVerseElement = document.getElementById(`verse-${estimatedVerseIndex}`);
        if (currentVerseElement) {
            currentVerseElement.classList.add('playing');
            currentVerseElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    }
    
    // Utility methods
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        
        // Remove all verse highlighting
        document.querySelectorAll('.verse-item').forEach(verse => {
            verse.classList.remove('playing');
        });
        this
