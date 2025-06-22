// Quran Reader Application - Islamic Design
// Complete functionality with bookmarks, highlights, and audio synchronization

class QuranReader {
    constructor() {
        // Application data
        this.data = {
            chapters: [
                {
                    id: 1,
                    name_arabic: "الفَاتِحَة",
                    name_english: "Al-Fatihah",
                    name_translation: "The Opening",
                    verses_count: 7,
                    audio_url: "https://www.soundjay.com/misc/bell-ringing-05.wav"
                },
                {
                    id: 2,
                    name_arabic: "البَقَرَة",
                    name_english: "Al-Baqarah",
                    name_translation: "The Cow",
                    verses_count: 286,
                    audio_url: "https://www.soundjay.com/misc/bell-ringing-05.wav"
                },
                {
                    id: 3,
                    name_arabic: "آل عِمرَان",
                    name_english: "Al-Imran",
                    name_translation: "The Family of Imran",
                    verses_count: 200,
                    audio_url: "https://www.soundjay.com/misc/bell-ringing-05.wav"
                }
            ],
            verses: {
                "1": [
                    {
                        verse_number: 1,
                        arabic: "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ",
                        translation: "In the name of Allah, The Most Gracious and The Most Merciful",
                        audio_start: 0,
                        audio_end: 3.5
                    },
                    {
                        verse_number: 2,
                        arabic: "ٱلۡحَمۡدُ لِلَّهِ رَبِّ ٱلۡعَٰلَمِينَ",
                        translation: "All praise and gratitude belong to Allah, The Sustainer of all the worlds",
                        audio_start: 3.5,
                        audio_end: 7.8
                    },
                    {
                        verse_number: 3,
                        arabic: "ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ",
                        translation: "The Most Gracious, The Most Merciful",
                        audio_start: 7.8,
                        audio_end: 10.2
                    },
                    {
                        verse_number: 4,
                        arabic: "مَٰلِكِ يَوۡمِ ٱلدِّينِ",
                        translation: "Master of the Day of Judgment",
                        audio_start: 10.2,
                        audio_end: 13.1
                    },
                    {
                        verse_number: 5,
                        arabic: "إِيَّاكَ نَعۡبُدُ وَإِيَّاكَ نَسۡتَعِينُ",
                        translation: "You alone we worship, and You alone we ask for help",
                        audio_start: 13.1,
                        audio_end: 17.4
                    },
                    {
                        verse_number: 6,
                        arabic: "ٱهۡدِنَا ٱلصِّرَٰطَ ٱلۡمُسۡتَقِيمَ",
                        translation: "Guide us to the straight path",
                        audio_start: 17.4,
                        audio_end: 21.0
                    },
                    {
                        verse_number: 7,
                        arabic: "صِرَٰطَ ٱلَّذِينَ أَنۡعَمۡتَ عَلَيۡهِمۡ غَيۡرِ ٱلۡمَغۡضُوبِ عَلَيۡهِمۡ وَلَا ٱلضَّآلِّينَ",
                        translation: "The path of those whom You have blessed; not of those who have incurred Your wrath, nor of those who have gone astray",
                        audio_start: 21.0,
                        audio_end: 28.5
                    }
                ]
            }
        };

        // Application state
        this.state = {
            currentView: 'chapters',
            currentChapter: null,
            currentVerse: 0,
            isPlaying: false,
            playbackSpeed: 1.0,
            bookmarks: this.loadFromStorage('bookmarks') || {},
            highlights: this.loadFromStorage('highlights') || {},
            audioLoaded: false,
            simulatedTime: 0,
            simulatedDuration: 30 // 30 seconds for demo
        };

        // DOM elements
        this.elements = {};
        this.audio = null;
        this.simulationInterval = null;

        // Initialize the application
        this.init();
    }

    // Initialize the application
    init() {
        this.bindElements();
        this.bindEvents();
        this.renderChapterList();
        this.loadBookmarks();
        this.loadHighlights();
        this.showToast('Welcome to the Noble Quran Reader');
    }

    // Bind DOM elements
    bindElements() {
        this.elements = {
            // Navigation
            homeBtn: document.getElementById('homeBtn'),
            bookmarksBtn: document.getElementById('bookmarksBtn'),
            highlightsBtn: document.getElementById('highlightsBtn'),
            backBtn: document.getElementById('backBtn'),

            // Sections
            chapterList: document.getElementById('chapterList'),
            chapterReader: document.getElementById('chapterReader'),
            bookmarksSection: document.getElementById('bookmarksSection'),
            highlightsSection: document.getElementById('highlightsSection'),

            // Chapter list
            chaptersGrid: document.getElementById('chaptersGrid'),

            // Reader
            chapterTitleArabic: document.getElementById('chapterTitleArabic'),
            chapterTitleEnglish: document.getElementById('chapterTitleEnglish'),
            chapterTranslation: document.getElementById('chapterTranslation'),
            versesContainer: document.getElementById('versesContainer'),

            // Audio controls
            audioPlayer: document.getElementById('audioPlayer'),
            playPauseBtn: document.getElementById('playPauseBtn'),
            prevVerseBtn: document.getElementById('prevVerseBtn'),
            nextVerseBtn: document.getElementById('nextVerseBtn'),
            progressSlider: document.getElementById('progressSlider'),
            progressFill: document.getElementById('progressFill'),
            currentTime: document.getElementById('currentTime'),
            duration: document.getElementById('duration'),
            speedSelect: document.getElementById('speedSelect'),

            // Bookmarks and highlights
            bookmarksList: document.getElementById('bookmarksList'),
            highlightsList: document.getElementById('highlightsList'),

            // Toast and loading
            toast: document.getElementById('toast'),
            toastMessage: document.getElementById('toastMessage'),
            loadingOverlay: document.getElementById('loadingOverlay')
        };

        this.audio = this.elements.audioPlayer;
    }

    // Bind event listeners
    bindEvents() {
        // Navigation events
        this.elements.homeBtn.addEventListener('click', () => this.showChapterList());
        this.elements.bookmarksBtn.addEventListener('click', () => this.showBookmarks());
        this.elements.highlightsBtn.addEventListener('click', () => this.showHighlights());
        this.elements.backBtn.addEventListener('click', () => this.showChapterList());

        // Audio control events
        this.elements.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.elements.prevVerseBtn.addEventListener('click', () => this.previousVerse());
        this.elements.nextVerseBtn.addEventListener('click', () => this.nextVerse());
        this.elements.speedSelect.addEventListener('change', (e) => this.changePlaybackSpeed(e.target.value));
        this.elements.progressSlider.addEventListener('input', (e) => this.seekAudio(e.target.value));

        // Audio events - with fallback handling
        this.audio.addEventListener('loadedmetadata', () => {
            this.state.audioLoaded = true;
            this.updateDuration();
            this.hideLoading();
        });
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.nextVerse());
        this.audio.addEventListener('loadstart', () => this.showLoading());
        this.audio.addEventListener('canplay', () => {
            this.state.audioLoaded = true;
            this.hideLoading();
        });
        this.audio.addEventListener('error', () => this.handleAudioError());

        // Add timeout for audio loading
        this.audio.addEventListener('loadstart', () => {
            setTimeout(() => {
                if (!this.state.audioLoaded) {
                    this.handleAudioError();
                }
            }, 5000); // 5 second timeout
        });
    }

    // Navigation methods
    showView(viewName) {
        // Hide all sections
        document.querySelectorAll('section').forEach(section => {
            section.classList.add('hidden');
        });

        // Show selected section
        switch(viewName) {
            case 'chapters':
                this.elements.chapterList.classList.remove('hidden');
                break;
            case 'reader':
                this.elements.chapterReader.classList.remove('hidden');
                break;
            case 'bookmarks':
                this.elements.bookmarksSection.classList.remove('hidden');
                break;
            case 'highlights':
                this.elements.highlightsSection.classList.remove('hidden');
                break;
        }

        this.state.currentView = viewName;
    }

    showChapterList() {
        this.showView('chapters');
        this.pauseAudio();
    }

    showBookmarks() {
        this.showView('bookmarks');
        this.renderBookmarks();
    }

    showHighlights() {
        this.showView('highlights');
        this.renderHighlights();
    }

    // Chapter list rendering
    renderChapterList() {
        const chaptersHTML = this.data.chapters.map(chapter => {
            const bookmark = this.state.bookmarks[chapter.id];
            const bookmarkText = bookmark ? `📖 Verse ${bookmark.verse}` : '';
            
            return `
                <div class="chapter-card" data-chapter-id="${chapter.id}">
                    <div class="chapter-number">${chapter.id}</div>
                    <div class="chapter-name-arabic">${chapter.name_arabic}</div>
                    <div class="chapter-name-english">${chapter.name_english}</div>
                    <div class="chapter-translation">${chapter.name_translation}</div>
                    <div class="chapter-meta">
                        <span>${chapter.verses_count} verses</span>
                        <span class="bookmark-indicator">${bookmarkText}</span>
                    </div>
                </div>
            `;
        }).join('');

        this.elements.chaptersGrid.innerHTML = chaptersHTML;

        // Add click events to chapter cards
        document.querySelectorAll('.chapter-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const chapterId = parseInt(e.currentTarget.dataset.chapterId);
                this.openChapter(chapterId);
            });
        });
    }

    // Chapter reader
    openChapter(chapterId) {
        this.showLoading();
        
        const chapter = this.data.chapters.find(c => c.id === chapterId);
        if (!chapter) {
            this.showToast('Chapter not found');
            this.hideLoading();
            return;
        }

        this.state.currentChapter = chapter;
        this.state.audioLoaded = false;
        this.state.simulatedTime = 0;
        
        // Load bookmarked position
        const bookmark = this.state.bookmarks[chapterId];
        this.state.currentVerse = bookmark ? bookmark.verse - 1 : 0;

        // Update chapter info
        this.elements.chapterTitleArabic.textContent = chapter.name_arabic;
        this.elements.chapterTitleEnglish.textContent = chapter.name_english;
        this.elements.chapterTranslation.textContent = chapter.name_translation;

        // Attempt to load audio
        this.audio.src = chapter.audio_url;
        this.audio.playbackRate = this.state.playbackSpeed;

        // Set simulated duration for demo
        this.elements.duration.textContent = this.formatTime(this.state.simulatedDuration);

        // Render verses
        this.renderVerses(chapterId);
        
        this.showView('reader');
        
        // Hide loading after a short delay if audio doesn't load
        setTimeout(() => {
            if (!this.state.audioLoaded) {
                this.hideLoading();
                this.showToast('Audio demo mode - click play to simulate playback');
            }
        }, 2000);
        
        this.updateActiveVerse();
    }

    renderVerses(chapterId) {
        const verses = this.data.verses[chapterId.toString()] || [];
        
        const versesHTML = verses.map(verse => {
            const isHighlighted = this.isVerseHighlighted(chapterId, verse.verse_number);
            const highlightClass = isHighlighted ? 'highlighted' : '';
            
            return `
                <div class="verse-card ${highlightClass}" data-verse-number="${verse.verse_number}">
                    <div class="verse-header">
                        <div class="verse-number">${verse.verse_number}</div>
                        <div class="verse-actions">
                            <button class="verse-action-btn bookmark-btn" data-action="bookmark">
                                📖 Bookmark
                            </button>
                            <button class="verse-action-btn highlight-btn ${isHighlighted ? 'active' : ''}" data-action="highlight">
                                ✨ Highlight
                            </button>
                        </div>
                    </div>
                    <div class="verse-arabic">${verse.arabic}</div>
                    <div class="verse-translation">${verse.translation}</div>
                </div>
            `;
        }).join('');

        this.elements.versesContainer.innerHTML = versesHTML;

        // Add click events to verse action buttons
        document.querySelectorAll('.verse-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = e.target.dataset.action;
                const verseCard = e.target.closest('.verse-card');
                const verseNumber = parseInt(verseCard.dataset.verseNumber);
                
                if (action === 'bookmark') {
                    this.bookmarkVerse(chapterId, verseNumber);
                } else if (action === 'highlight') {
                    this.toggleHighlight(chapterId, verseNumber);
                }
            });
        });

        // Add click events to verses for seeking
        document.querySelectorAll('.verse-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const verseNumber = parseInt(e.currentTarget.dataset.verseNumber);
                this.seekToVerse(verseNumber - 1);
            });
        });
    }

    // Audio controls with fallback simulation
    togglePlayPause() {
        if (this.state.isPlaying) {
            this.pauseAudio();
        } else {
            this.playAudio();
        }
    }

    playAudio() {
        if (this.state.audioLoaded && this.audio.src) {
            // Try to play actual audio
            this.audio.play().then(() => {
                this.state.isPlaying = true;
                this.elements.playPauseBtn.innerHTML = '⏸';
                this.startVerseSync();
            }).catch(error => {
                this.startSimulatedPlayback();
            });
        } else {
            // Use simulated playback
            this.startSimulatedPlayback();
        }
    }

    startSimulatedPlayback() {
        this.state.isPlaying = true;
        this.elements.playPauseBtn.innerHTML = '⏸';
        this.showToast('Demo mode: Simulating audio playback');
        
        // Start simulation interval
        this.simulationInterval = setInterval(() => {
            this.state.simulatedTime += 0.1 * this.state.playbackSpeed;
            
            if (this.state.simulatedTime >= this.state.simulatedDuration) {
                this.nextVerse();
                return;
            }
            
            this.updateSimulatedProgress();
            this.syncVerseWithSimulatedAudio();
        }, 100);
        
        this.startVerseSync();
    }

    pauseAudio() {
        if (this.state.audioLoaded && this.audio.src) {
            this.audio.pause();
        }
        
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
        
        this.state.isPlaying = false;
        this.elements.playPauseBtn.innerHTML = '▶';
    }

    previousVerse() {
        if (this.state.currentVerse > 0) {
            this.seekToVerse(this.state.currentVerse - 1);
        }
    }

    nextVerse() {
        const verses = this.getCurrentVerses();
        if (this.state.currentVerse < verses.length - 1) {
            this.seekToVerse(this.state.currentVerse + 1);
        } else {
            this.pauseAudio();
            this.showToast('Chapter completed');
        }
    }

    seekToVerse(verseIndex) {
        const verses = this.getCurrentVerses();
        if (verseIndex >= 0 && verseIndex < verses.length) {
            this.state.currentVerse = verseIndex;
            const verse = verses[verseIndex];
            
            if (this.state.audioLoaded) {
                this.audio.currentTime = verse.audio_start;
            } else {
                this.state.simulatedTime = verse.audio_start;
            }
            
            this.updateActiveVerse();
        }
    }

    seekAudio(percentage) {
        const time = (percentage / 100) * this.state.simulatedDuration;
        
        if (this.state.audioLoaded && this.audio.duration) {
            this.audio.currentTime = (percentage / 100) * this.audio.duration;
        } else {
            this.state.simulatedTime = time;
        }
    }

    changePlaybackSpeed(speed) {
        this.state.playbackSpeed = parseFloat(speed);
        if (this.state.audioLoaded) {
            this.audio.playbackRate = this.state.playbackSpeed;
        }
    }

    // Verse synchronization with simulation support
    startVerseSync() {
        if (this.verseSyncInterval) {
            clearInterval(this.verseSyncInterval);
        }
        
        this.verseSyncInterval = setInterval(() => {
            if (this.state.audioLoaded) {
                this.syncVerseWithAudio();
            } else {
                this.syncVerseWithSimulatedAudio();
            }
        }, 100);
    }

    syncVerseWithAudio() {
        if (!this.state.isPlaying) {
            clearInterval(this.verseSyncInterval);
            return;
        }

        const verses = this.getCurrentVerses();
        const currentTime = this.audio.currentTime;
        
        this.updateVerseBasedOnTime(verses, currentTime);
    }

    syncVerseWithSimulatedAudio() {
        if (!this.state.isPlaying) {
            clearInterval(this.verseSyncInterval);
            return;
        }

        const verses = this.getCurrentVerses();
        this.updateVerseBasedOnTime(verses, this.state.simulatedTime);
    }

    updateVerseBasedOnTime(verses, currentTime) {
        for (let i = 0; i < verses.length; i++) {
            const verse = verses[i];
            if (currentTime >= verse.audio_start && currentTime < verse.audio_end) {
                if (this.state.currentVerse !== i) {
                    this.state.currentVerse = i;
                    this.updateActiveVerse();
                }
                break;
            }
        }
    }

    updateActiveVerse() {
        // Remove active class from all verses
        document.querySelectorAll('.verse-card').forEach(card => {
            card.classList.remove('active');
        });

        // Add active class to current verse
        const activeVerseCard = document.querySelector(`[data-verse-number="${this.state.currentVerse + 1}"]`);
        if (activeVerseCard) {
            activeVerseCard.classList.add('active');
            activeVerseCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Progress tracking with simulation support
    updateProgress() {
        const currentTime = this.state.audioLoaded ? this.audio.currentTime : this.state.simulatedTime;
        const duration = this.state.audioLoaded ? this.audio.duration : this.state.simulatedDuration;
        
        if (duration) {
            const percentage = (currentTime / duration) * 100;
            this.elements.progressFill.style.width = percentage + '%';
            this.elements.progressSlider.value = percentage;
            this.elements.currentTime.textContent = this.formatTime(currentTime);
        }
    }

    updateSimulatedProgress() {
        const percentage = (this.state.simulatedTime / this.state.simulatedDuration) * 100;
        this.elements.progressFill.style.width = percentage + '%';
        this.elements.progressSlider.value = percentage;
        this.elements.currentTime.textContent = this.formatTime(this.state.simulatedTime);
    }

    updateDuration() {
        const duration = this.state.audioLoaded ? this.audio.duration : this.state.simulatedDuration;
        this.elements.duration.textContent = this.formatTime(duration);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Bookmarking
    bookmarkVerse(chapterId, verseNumber) {
        this.state.bookmarks[chapterId] = {
            verse: verseNumber,
            timestamp: Date.now(),
            chapterName: this.state.currentChapter.name_english
        };
        
        this.saveToStorage('bookmarks', this.state.bookmarks);
        this.showToast('Verse bookmarked successfully');
        this.renderChapterList(); // Update bookmark indicators
    }

    renderBookmarks() {
        const bookmarks = Object.entries(this.state.bookmarks);
        
        if (bookmarks.length === 0) {
            this.elements.bookmarksList.innerHTML = `
                <div class="empty-state">
                    <h3>No Bookmarks Yet</h3>
                    <p>Start reading and bookmark verses to track your progress</p>
                </div>
            `;
            return;
        }

        const bookmarksHTML = bookmarks.map(([chapterId, bookmark]) => {
            const verse = this.getVerseText(parseInt(chapterId), bookmark.verse);
            
            return `
                <div class="bookmark-item" data-chapter-id="${chapterId}" data-verse="${bookmark.verse}">
                    <div class="bookmark-chapter">${bookmark.chapterName} - Verse ${bookmark.verse}</div>
                    <div class="bookmark-verse">${verse ? verse.arabic : ''}</div>
                    <div class="bookmark-translation">${verse ? verse.translation : ''}</div>
                </div>
            `;
        }).join('');

        this.elements.bookmarksList.innerHTML = bookmarksHTML;

        // Add click events to bookmarks
        document.querySelectorAll('.bookmark-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const chapterId = parseInt(e.currentTarget.dataset.chapterId);
                const verseNumber = parseInt(e.currentTarget.dataset.verse);
                this.openChapterAtVerse(chapterId, verseNumber - 1);
            });
        });
    }

    // Highlighting
    toggleHighlight(chapterId, verseNumber) {
        const key = `${chapterId}-${verseNumber}`;
        
        if (this.state.highlights[key]) {
            delete this.state.highlights[key];
            this.showToast('Highlight removed');
        } else {
            const verse = this.getVerseText(chapterId, verseNumber);
            this.state.highlights[key] = {
                chapterId,
                verseNumber,
                chapterName: this.state.currentChapter.name_english,
                arabic: verse.arabic,
                translation: verse.translation,
                timestamp: Date.now()
            };
            this.showToast('Verse highlighted');
        }
        
        this.saveToStorage('highlights', this.state.highlights);
        this.renderVerses(chapterId); // Update highlighting
    }

    isVerseHighlighted(chapterId, verseNumber) {
        return !!this.state.highlights[`${chapterId}-${verseNumber}`];
    }

    renderHighlights() {
        const highlights = Object.values(this.state.highlights);
        
        if (highlights.length === 0) {
            this.elements.highlightsList.innerHTML = `
                <div class="empty-state">
                    <h3>No Highlights Yet</h3>
                    <p>Highlight verses that inspire you to create your personal collection</p>
                </div>
            `;
            return;
        }

        const highlightsHTML = highlights.map(highlight => {
            return `
                <div class="highlight-item" data-chapter-id="${highlight.chapterId}" data-verse="${highlight.verseNumber}">
                    <div class="bookmark-chapter">${highlight.chapterName} - Verse ${highlight.verseNumber}</div>
                    <div class="bookmark-verse">${highlight.arabic}</div>
                    <div class="bookmark-translation">${highlight.translation}</div>
                </div>
            `;
        }).join('');

        this.elements.highlightsList.innerHTML = highlightsHTML;

        // Add click events to highlights
        document.querySelectorAll('.highlight-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const chapterId = parseInt(e.currentTarget.dataset.chapterId);
                const verseNumber = parseInt(e.currentTarget.dataset.verse);
                this.openChapterAtVerse(chapterId, verseNumber - 1);
            });
        });
    }

    // Utility methods
    getCurrentVerses() {
        if (!this.state.currentChapter) return [];
        return this.data.verses[this.state.currentChapter.id.toString()] || [];
    }

    getVerseText(chapterId, verseNumber) {
        const verses = this.data.verses[chapterId.toString()] || [];
        return verses.find(v => v.verse_number === verseNumber);
    }

    openChapterAtVerse(chapterId, verseIndex) {
        this.state.currentVerse = verseIndex;
        this.openChapter(chapterId);
    }

    // Storage methods
    saveToStorage(key, data) {
        try {
            localStorage.setItem(`quran-${key}`, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to storage:', error);
        }
    }

    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(`quran-${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading from storage:', error);
            return null;
        }
    }

    loadBookmarks() {
        const bookmarks = this.loadFromStorage('bookmarks');
        if (bookmarks) {
            this.state.bookmarks = bookmarks;
        }
    }

    loadHighlights() {
        const highlights = this.loadFromStorage('highlights');
        if (highlights) {
            this.state.highlights = highlights;
        }
    }

    // UI feedback methods
    showToast(message) {
        this.elements.toastMessage.textContent = message;
        this.elements.toast.classList.add('show');
        
        setTimeout(() => {
            this.elements.toast.classList.remove('show');
        }, 3000);
    }

    showLoading() {
        this.elements.loadingOverlay.classList.remove('hidden');
    }

    hideLoading() {
        this.elements.loadingOverlay.classList.add('hidden');
    }

    handleAudioError() {
        this.hideLoading();
        this.pauseAudio();
        this.state.audioLoaded = false;
        this.showToast('Audio not available - using demo mode');
        
        // Set up demo mode
        this.elements.duration.textContent = this.formatTime(this.state.simulatedDuration);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quranReader = new QuranReader();
});