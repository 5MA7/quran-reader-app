// Quran Reader Application - Islamic Design
// Complete functionality with bookmarks, highlights, and audio synchronization

// Integrated Quran App with QuranicAudio.com API
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
        
        // Get all your existing HTML elements
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
        this.versesContainer = document.getElementById('versesContainer');
        this.chapterTitleArabic = document.getElementById('chapterTitleArabic');
        this.chapterTitleEnglish = document.getElementById('chapterTitleEnglish');
        this.chapterTranslation = document.getElementById('chapterTranslation');
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
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadChapters();
        this.showToast('Quran Reader initialized with Al-Afasy recitation');
        console.log('Alhambra Quran App with Audio initialized');
    }
    
    setupEventListeners() {
        // Navigation buttons
        this.homeBtn.addEventListener('click', () => this.showChapterList());
        this.bookmarksBtn.addEventListener('click', () => this.showBookmarks());
        this.highlightsBtn.addEventListener('click', () => this.showHighlights());
        this.backBtn.addEventListener('click', () => this.showChapterList());
        
        // Audio controls
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.prevVerseBtn.addEventListener('click', () => this.previousVerse());
        this.nextVerseBtn.addEventListener('click', () => this.nextVerse());
        this.speedSelect.addEventListener('change', (e) => {
            this.audioPlayer.playbackRate = parseFloat(e.target.value);
        });
        
        // Progress slider
        this.progressSlider.addEventListener('input', (e) => {
            if (this.audioPlayer.duration) {
                this.audioPlayer.currentTime = (e.target.value / 100) * this.audioPlayer.duration;
            }
        });
        
        // Audio event listeners
        this.audioPlayer.addEventListener('loadstart', () => this.showAudioLoading());
        this.audioPlayer.addEventListener('canplay', () => this.hideAudioLoading());
        this.audioPlayer.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
        this.audioPlayer.addEventListener('ended', () => this.audioEnded());
        this.audioPlayer.addEventListener('error', (e) => this.handleAudioError(e));
        this.audioPlayer.addEventListener('play', () => this.updatePlayButton(true));
        this.audioPlayer.addEventListener('pause', () => this.updatePlayButton(false));
    }
    
    // Load and display chapters
    loadChapters() {
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
            this.currentChapter = chapterData;
            
            // Load chapter audio
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
            this.showToast('Failed to load chapter audio');
        }
    }
    
    // Load chapter audio from QuranicAudio.com
    async loadChapterAudio(chapterId) {
        const paddedId = chapterId.toString().padStart(3, '0');
        const audioUrl = `${this.baseAudioUrl}${this.reciterPath}${paddedId}.mp3`;
        
        console.log('Loading audio from:', audioUrl);
        
        return new Promise((resolve, reject) => {
            this.audioPlayer.src = audioUrl;
            this.audioPlayer.load();
            
            const handleCanPlay = () => {
                this.audioPlayer.removeEventListener('canplay', handleCanPlay);
                this.audioPlayer.removeEventListener('error', handleError);
                resolve();
            };
            
            const handleError = (e) => {
                this.audioPlayer.removeEventListener('canplay', handleCanPlay);
                this.audioPlayer.removeEventListener('error', handleError);
                reject(e);
            };
            
            this.audioPlayer.addEventListener('canplay', handleCanPlay);
            this.audioPlayer.addEventListener('error', handleError);
        });
    }
    
    // Display chapter information
    displayChapter(chapterData) {
        this.chapterTitleArabic.textContent = chapterData.arabic;
        this.chapterTitleEnglish.textContent = `${chapterData.id}. ${chapterData.name}`;
        this.chapterTranslation.textContent = `"${chapterData.translation}" • ${chapterData.verses} verses • ${chapterData.type}`;
    }
    
    // Load and display verses
    loadVerses(chapterId) {
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
        // Simple implementation: rewind 10 seconds or go to beginning
        if (this.audioPlayer.currentTime > 10) {
            this.audioPlayer.currentTime -= 10;
        } else {
            this.audioPlayer.currentTime = 0;
        }
    }
    
    nextVerse() {
        // Simple implementation: forward 15 seconds
        this.audioPlayer.currentTime = Math.min(
            this.audioPlayer.currentTime + 15, 
            this.audioPlayer.duration || 0
        );
    }
    
    // Update progress and time displays
    updateProgress() {
        if (this.audioPlayer.duration) {
            const progress = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
            this.progressFill.style.width = `${progress}%`;
            this.progressSlider.value = progress;
            
            this.currentTimeSpan.textContent = this.formatTime(this.audioPlayer.currentTime);
            
            // Basic verse highlighting (can be enhanced with actual timing data)
            this.highlightCurrentVerse();
        }
    }
    
    updateDuration() {
        if (this.audioPlayer.duration) {
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
            // Smooth scroll to current verse
            currentVerseElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    }
    
    // Utility methods
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    updatePlayButton(playing) {
        this.isPlaying = playing;
        this.playPauseBtn.innerHTML = playing ? '⏸' : '▶';
        this.playPauseBtn.title = playing ? 'Pause' : 'Play';
    }
    
    audioEnded() {
        this.updatePlayButton(false);
        this.progressFill.style.width = '0%';
        this.progressSlider.value = 0;
        // Remove all verse highlighting
        document.querySelectorAll('.verse-item').forEach(verse => {
            verse.classList.remove('playing');
        });
        this.showToast('Chapter completed');
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
        localStorage.setItem('quran_bookmarks', JSON.stringify(this.bookmarks));
        this.loadVerses(chapterId); // Refresh to update icons
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
        localStorage.setItem('quran_highlights', JSON.stringify(this.highlights));
        this.loadVerses(chapterId); // Refresh to update icons
    }
    
    isBookmarked(chapterId, verseNumber) {
        return !!this.bookmarks[`${chapterId}-${verseNumber}`];
    }
    
    isHighlighted(chapterId, verseNumber) {
        return !!this.highlights[`${chapterId}-${verseNumber}`];
    }
    
    // Navigation methods
    showChapterList() {
        this.chapterList.classList.remove('hidden');
        this.chapterReader.classList.add('hidden');
        this.bookmarksSection.classList.add('hidden');
        this.highlightsSection.classList.add('hidden');
        // Pause audio when leaving chapter
        this.audioPlayer.pause();
    }
    
    showChapterReader() {
        this.chapterList.classList.add('hidden');
        this.chapterReader.classList.remove('hidden');
        this.bookmarksSection.classList.add('hidden');
        this.highlightsSection.classList.add('hidden');
    }
    
    showBookmarks() {
        this.chapterList.classList.add('hidden');
        this.chapterReader.classList.add('hidden');
        this.bookmarksSection.classList.remove('hidden');
        this.highlightsSection.classList.add('hidden');
        this.loadBookmarksList();
    }
    
    showHighlights() {
        this.chapterList.classList.add('hidden');
        this.chapterReader.classList.add('hidden');
        this.bookmarksSection.classList.add('hidden');
        this.highlightsSection.classList.remove('hidden');
        this.loadHighlightsList();
    }
    
    // UI state methods
    showLoadingOverlay() {
        this.loadingOverlay.classList.remove('hidden');
    }
    
    hideLoadingOverlay() {
        this.loadingOverlay.classList.add('hidden');
    }
    
    showAudioLoading() {
        this.audioLoading.style.display = 'block';
    }
    
    hideAudioLoading() {
        this.audioLoading.style.display = 'none';
    }
    
    showAudioError() {
        this.audioError.style.display = 'block';
    }
    
    hideAudioError() {
        this.audioError.style.display = 'none';
    }
    
    handleAudioError(error) {
        console.error('Audio error:', error);
        this.hideAudioLoading();
        this.showAudioError();
        this.showToast('Failed to load audio');
    }
    
    showToast(message) {
        this.toastMessage.textContent = message;
        this.toast.classList.remove('hidden');
        setTimeout(() => {
            this.toast.classList.add('hidden');
        }, 3000);
    }
    
    // Load bookmarks and highlights lists
    loadBookmarksList() {
        const bookmarksList = document.getElementById('bookmarksList');
        bookmarksList.innerHTML = '';
        
        Object.values(this.bookmarks).forEach(bookmark => {
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
                bookmarksList.appendChild(bookmarkElement);
            }
        });
        
        if (Object.keys(this.bookmarks).length === 0) {
            bookmarksList.innerHTML = '<p class="empty-state">No bookmarks yet. Start reading and bookmark your favorite verses!</p>';
        }
    }
    
    loadHighlightsList() {
        const highlightsList = document.getElementById('highlightsList');
        highlightsList.innerHTML = '';
        
        Object.values(this.highlights).forEach(highlight => {
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
                highlightsList.appendChild(highlightElement);
            }
        });
        
        if (Object.keys(this.highlights).length === 0) {
            highlightsList.innerHTML = '<p class="empty-state">No highlights yet. Highlight verses that inspire you!</p>';
        }
    }
    
    // Sample data (you can expand this with more chapters and verses)
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
        // Sample verse data for Al-Fatiha
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
        
        // For other chapters, return placeholder data
        return [
            {
                number: 1,
                arabic: 'Sample Arabic text for this chapter...',
                english: 'Sample English translation will be loaded here...'
            }
        ];
    }
}

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Alhambra Quran App with Audio...');
    window.quranApp = new AlhambraQuranApp();
});
