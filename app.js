// Quran Reader Application - Islamic Design
// Complete functionality with bookmarks, highlights, and audio synchronization

// Alhambra Quran App - Clean Version
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
        this.bookmarks = this.loadFromStorage('quran_bookmarks');
        this.highlights = this.loadFromStorage('quran_highlights');
        
        // Initialize after DOM is ready
        this.initializeWhenReady();
    }
    
    initializeWhenReady() {
        // Double-check DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    init() {
        console.log('Initializing Alhambra Quran App...');
        
        // Get DOM elements safely
        this.getDOMElements();
        
        // Only proceed if essential elements exist
        if (this.audioPlayer && this.chaptersGrid) {
            this.setupEventListeners();
            this.loadChapters();
            this.showToast('Quran Reader initialized successfully');
            console.log('App initialized successfully');
        } else {
            console.error('Essential elements missing. Check HTML structure.');
            this.showFallbackMessage();
        }
    }
    
    getDOMElements() {
        // Core elements
        this.audioPlayer = document.getElementById('audioPlayer');
        this.chaptersGrid = document.getElementById('chaptersGrid');
        this.versesContainer = document.getElementById('versesContainer');
        
        // Audio controls
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.prevVerseBtn = document.getElementById('prevVerseBtn');
        this.nextVerseBtn = document.getElementById('nextVerseBtn');
        this.speedSelect = document.getElementById('speedSelect');
        this.progressFill = document.getElementById('progressFill');
        this.progressSlider = document.getElementById('progressSlider');
        this.currentTimeSpan = document.getElementById('currentTime');
        this.durationSpan = document.getElementById('duration');
        
        // Chapter display
        this.chapterTitleArabic = document.getElementById('chapterTitleArabic');
        this.chapterTitleEnglish = document.getElementById('chapterTitleEnglish');
        this.chapterTranslation = document.getElementById('chapterTranslation');
        
        // Navigation
        this.homeBtn = document.getElementById('homeBtn');
        this.bookmarksBtn = document.getElementById('bookmarksBtn');
        this.highlightsBtn = document.getElementById('highlightsBtn');
        this.backBtn = document.getElementById('backBtn');
        
        // Sections
        this.chapterList = document.getElementById('chapterList');
        this.chapterReader = document.getElementById('chapterReader');
        this.bookmarksSection = document.getElementById('bookmarksSection');
        this.highlightsSection = document.getElementById('highlightsSection');
        this.bookmarksList = document.getElementById('bookmarksList');
        this.highlightsList = document.getElementById('highlightsList');
        
        // Status elements
        this.audioLoading = document.getElementById('audioLoading');
        this.audioError = document.getElementById('audioError');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.toast = document.getElementById('toast');
        this.toastMessage = document.getElementById('toastMessage');
        
        console.log('DOM elements loaded:', {
            audioPlayer: !!this.audioPlayer,
            chaptersGrid: !!this.chaptersGrid,
            playPauseBtn: !!this.playPauseBtn
        });
    }
    
    setupEventListeners() {
        // Navigation
        this.addSafeListener(this.homeBtn, 'click', () => this.showChapterList());
        this.addSafeListener(this.bookmarksBtn, 'click', () => this.showBookmarks());
        this.addSafeListener(this.highlightsBtn, 'click', () => this.showHighlights());
        this.addSafeListener(this.backBtn, 'click', () => this.showChapterList());
        
        // Audio controls
        this.addSafeListener(this.playPauseBtn, 'click', () => this.togglePlayPause());
        this.addSafeListener(this.prevVerseBtn, 'click', () => this.previousVerse());
        this.addSafeListener(this.nextVerseBtn, 'click', () => this.nextVerse());
        this.addSafeListener(this.speedSelect, 'change', (e) => {
            if (this.audioPlayer) {
                this.audioPlayer.playbackRate = parseFloat(e.target.value);
            }
        });
        
        // Progress control
        this.addSafeListener(this.progressSlider, 'input', (e) => {
            if (this.audioPlayer && this.audioPlayer.duration) {
                this.audioPlayer.currentTime = (e.target.value / 100) * this.audioPlayer.duration;
            }
        });
        
        // Audio events
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
    
    addSafeListener(element, event, handler) {
        if (element) {
            element.addEventListener(event, handler);
        }
    }
    
    loadChapters() {
        if (!this.chaptersGrid) return;
        
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
    
    async loadChapter(chapterId) {
        try {
            this.showLoadingOverlay();
            this.hideAudioError();
            
            const chapterData = this.getChapterData().find(c => c.id === chapterId);
            if (!chapterData) {
                throw new Error(`Chapter ${chapterId} not found`);
            }
            
            this.currentChapter = chapterData;
            
            // Load audio from QuranicAudio.com
            await this.loadChapterAudio(chapterId);
            
            this.displayChapter(chapterData);
            this.loadVerses(chapterId);
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
    
    async loadChapterAudio(chapterId) {
        if (!this.audioPlayer) {
            throw new Error('Audio player not available');
        }
        
        const paddedId = chapterId.toString().padStart(3, '0');
        const audioUrl = `${this.baseAudioUrl}${this.reciterPath}${paddedId}.mp3`;
        
        console.log('Loading audio from:', audioUrl);
        
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Audio loading timed out'));
            }, 15000);
            
            const handleCanPlay = () => {
                clearTimeout(timeout);
                this.audioPlayer.removeEventListener('canplay', handleCanPlay);
                this.audioPlayer.removeEventListener('error', handleError);
                console.log('Audio loaded successfully');
                resolve();
            };
            
            const handleError = (e) => {
                clearTimeout(timeout);
                this.audioPlayer.removeEventListener('canplay', handleCanPlay);
                this.audioPlayer.removeEventListener('error', handleError);
                console.error('Audio loading failed:', e);
                reject(new Error('Failed to load audio'));
            };
            
            this.audioPlayer.addEventListener('canplay', handleCanPlay);
            this.audioPlayer.addEventListener('error', handleError);
            
            // Clear any previous source to avoid conflicts
            this.audioPlayer.src = '';
            this.audioPlayer.src = audioUrl;
            this.audioPlayer.load();
        });
    }
    
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
    
    loadVerses(chapterId) {
        if (!this.versesContainer) return;
        
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
    
    // Audio controls
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
                this.showToast('Playback failed. Please try again.');
            });
        }
    }
    
    previousVerse() {
        if (!this.audioPlayer) return;
        this.audioPlayer.currentTime = Math.max(0, this.audioPlayer.currentTime - 10);
    }
    
    nextVerse() {
        if (!this.audioPlayer) return;
        this.audioPlayer.currentTime = Math.min(
            this.audioPlayer.currentTime + 15, 
            this.audioPlayer.duration || 0
        );
    }
    
    updateProgress() {
        if (!this.audioPlayer || !this.audioPlayer.duration) return;
        
        const progress = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
        
        if (this.progressFill) this.progressFill.style.width = `${progress}%`;
        if (this.progressSlider) this.progressSlider.value = progress;
        if (this.currentTimeSpan) {
            this.currentTimeSpan.textContent = this.formatTime(this.audioPlayer.currentTime);
        }
        
        this.highlightCurrentVerse();
    }
    
    updateDuration() {
        if (this.audioPlayer && this.audioPlayer.duration && this.durationSpan) {
            this.durationSpan.textContent = this.formatTime(this.audioPlayer.duration);
        }
    }
    
    highlightCurrentVerse() {
        if (this.verses.length === 0) return;
        
        document.querySelectorAll('.verse-item').forEach(verse => {
            verse.classList.remove('playing');
        });
        
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
        
        document.querySelectorAll('.verse-item').forEach(verse => {
            verse.classList.remove('playing');
        });
        this.showToast('Chapter completed');
    }
    
    // Utility methods
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    loadFromStorage(key) {
        try {
            return JSON.parse(localStorage.getItem(key) || '{}');
        } catch (e) {
            console.error('Error loading from storage:', e);
            return {};
        }
    }
    
    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('Error saving to storage:', e);
        }
    }
    
    // Bookmark and highlight functionality
    toggleBookmark(chapterId, verseNumber) {
        const key = `${chapterId}-${verseNumber}`;
        if (this.bookmarks[key]) {
            delete this.bookmarks[key];
            this.showToast('Bookmark removed');
        } else {
            this.bookmarks[key] = {
                chapterId,
                verseNumber,
                timestamp: new Date().toISOString()
            };
            this.showToast('Verse bookmarked');
        }
        this.saveToStorage('quran_bookmarks', this.bookmarks);
        this.loadVerses(chapterId);
    }
    
    toggleHighlight(chapterId, verseNumber) {
        const key = `${chapterId}-${verseNumber}`;
        if (this.highlights[key]) {
            delete this.highlights[key];
            this.showToast('Highlight removed');
        } else {
            this.highlights[key] = {
                chapterId,
                verseNumber,
                timestamp: new Date().toISOString()
            };
            this.showToast('Verse highlighted');
        }
        this.saveToStorage('quran_highlights', this.highlights);
        this.loadVerses(chapterId);
    }
    
    isBookmarked(chapterId, verseNumber) {
        return !!this.bookmarks[`${chapterId}-${verseNumber}`];
    }
    
    isHighlighted(chapterId, verseNumber) {
        return !!this.highlights[`${chapterId}-${verseNumber}`];
    }
    
    // Navigation methods
    showChapterList() {
        this.hideAllSections();
        if (this.chapterList) this.chapterList.classList.remove('hidden');
        if (this.audioPlayer) this.audioPlayer.pause();
    }
    
    showChapterReader() {
        this.hideAllSections();
        if (this.chapterReader) this.chapterReader.classList.remove('hidden');
    }
    
    showBookmarks() {
        this.hideAllSections();
        if (this.bookmarksSection) this.bookmarksSection.classList.remove('hidden');
        this.loadBookmarksList();
    }
    
    showHighlights() {
        this.hideAllSections();
        if (this.highlightsSection) this.highlightsSection.classList.remove('hidden');
        this.loadHighlightsList();
    }
    
    hideAllSections() {
        [this.chapterList, this.chapterReader, this.bookmarksSection, this.highlightsSection]
            .forEach(section => {
                if (section) section.classList.add('hidden');
            });
    }
    
    // UI state methods
    showLoadingOverlay() {
        if (this.loadingOverlay) this.loadingOverlay.classList.remove('hidden');
    }
    
    hideLoadingOverlay() {
        if (this.loadingOverlay) this.loadingOverlay.classList.add('hidden');
    }
    
    showAudioLoading() {
        if (this.audioLoading) this.audioLoading.style.display = 'block';
    }
    
    hideAudioLoading() {
        if (this.audioLoading) this.audioLoading.style.display = 'none';
    }
    
    showAudioError() {
        if (this.audioError) this.audioError.style.display = 'block';
    }
    
    hideAudioError() {
        if (this.audioError) this.audioError.style.display = 'none';
    }
    
    handleAudioError(error) {
        console.error('Audio error:', error);
        this.hideAudioLoading();
        this.showAudioError();
        this.showToast('Failed to load audio from QuranicAudio.com');
    }
    
    showToast(message) {
        if (this.toastMessage && this.toast) {
            this.toastMessage.textContent = message;
            this.toast.classList.remove('hidden');
            setTimeout(() => {
                this.toast.classList.add('hidden');
            }, 3000);
        } else {
            console.log('Toast:', message);
        }
    }
    
    showFallbackMessage() {
        document.body.innerHTML += `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: #f8f9fa; padding: 20px; border-radius: 10px; 
                        box-shadow: 0 4px 20px rgba(0,0,0,0.1); text-align: center; z-index: 9999;">
                <h3>Quran Reader Setup</h3>
                <p>Please check your HTML structure and ensure all required elements are present.</p>
                <p>Elements needed: audioPlayer, chaptersGrid, playPauseBtn</p>
            </div>
        `;
    }
    
    loadBookmarksList() {
        if (!this.bookmarksList) return;
        
        this.bookmarksList.innerHTML = '';
        const bookmarks = Object.values(this.bookmarks);
        
        if (bookmarks.length === 0) {
            this.bookmarksList.innerHTML = '<p class="empty-state">No bookmarks yet. Start reading and bookmark your favorite verses!</p>';
            return;
        }
        
        bookmarks.forEach(bookmark => {
            const chapterData = this.getChapterData().find(c => c.id === bookmark.chapterId);
            const verseData = this.getVerseData(bookmark.chapterId).find(v => v.number === bookmark.verseNumber);
            
            if (chapterData && verseData) {
                const bookmarkElement = document.createElement('div');
                bookmarkElement.className = 'bookmark-item';
                bookmarkElement.innerHTML = `
                    <h4>${chapterData.name} - Verse ${bookmark.verseNumber}</h4>
                    <p class="verse-arabic" dir="rtl">${verseData.arabic}</p>
                    <p class="verse-english">${verseData.english}</p>
                    <button onclick="quranApp.loadChapter(${bookmark.chapterId})">Go to Chapter</button>
                `;
                this.bookmarksList.appendChild(bookmarkElement);
            }
        });
    }
    
    loadHighlightsList() {
        if (!this.highlightsList) return;
        
        this.highlightsList.innerHTML = '';
        const highlights = Object.values(this.highlights);
        
        if (highlights.length === 0) {
            this.highlightsList.innerHTML = '<p class="empty-state">No highlights yet. Highlight verses that inspire you!</p>';
            return;
        }
        
        highlights.forEach(highlight => {
            const chapterData = this.getChapterData().find(c => c.id === highlight.chapterId);
            const verseData = this.getVerseData(highlight.chapterId).find(v => v.number === highlight.verseNumber);
            
            if (chapterData && verseData) {
                const highlightElement = document.createElement('div');
                highlightElement.className = 'highlight-item';
                highlightElement.innerHTML = `
                    <h4>${chapterData.name} - Verse ${highlight.verseNumber}</h4>
                    <p class="verse-arabic" dir="rtl">${verseData.arabic}</p>
                    <p class="verse-english">${verseData.english}</p>
                    <button onclick="quranApp.loadChapter(${highlight.chapterId})">Go to Chapter</button>
                `;
                this.highlightsList.appendChild(highlightElement);
            }
        });
    }
    
    // Sample data (based on QuranicAudio.com API structure)
    getChapterData() {
        return [
            { 
                id: 1, 
                name: 'Al-Fatiha', 
                arabic: 'الفاتحة', 
                translation: 'The Opener',
                verses: 7, 
                type: 'Meccan' 
            },
            { 
                id: 2, 
                name: 'Al-Baqarah', 
                arabic: 'البقرة', 
                translation: 'The Cow',
                verses: 286, 
                type: 'Medinan' 
            },
            { 
                id: 3, 
                name: 'Al-Imran', 
                arabic: 'آل عمران', 
                translation: 'Family of Imran',
                verses: 200, 
                type: 'Medinan' 
            },
            { 
                id: 4, 
                name: 'An-Nisa', 
                arabic: 'النساء', 
                translation: 'The Women',
                verses: 176, 
                type: 'Medinan' 
            },
            { 
                id: 5, 
                name: 'Al-Maidah', 
                arabic: 'المائدة', 
                translation: 'The Table Spread',
                verses: 120, 
                type: 'Medinan' 
            }
        ];
    }
    
    getVerseData(chapterId) {
        // Al-Fatiha verses
        if (chapterId === 1) {
            return [
                {
                    number: 1,
                    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
                    english: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.'
                },
                {
                    number: 2,
                    arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
                    english: 'All praise is due to Allah, Lord of the worlds.'
                },
                {
                    number: 3,
                    arabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
                    english: 'The Entirely Merciful, the Especially Merciful,'
                },
                {
                    number: 4,
                    arabic: 'مَالِكِ يَوْمِ الدِّينِ',
                    english: 'Sovereign of the Day of Recompense.'
                },
                {
                    number: 5,
                    arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
                    english: 'It is You we worship and You we ask for help.'
                },
                {
                    number: 6,
                    arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
                    english: 'Guide us to the straight path -'
                },
                {
                    number: 7,
                    arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
                    english: 'The path of those upon whom You have bestowed favor, not of those who have evoked anger or of those who are astray.'
                }
            ];
        }
        
        return [{
            number: 1,
            arabic: 'Sample Arabic text for this chapter...',
            english: 'Sample English translation will be loaded here...'
        }];
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    console.log('Starting Quran app...');
    window.quranApp = new AlhambraQuranApp();
});
