// lib/i18n/translations.ts

export const translations = {
  en: {
    // App
    appName: "MoodStory",
    appTagline: "Minimal editing. Maximum vibe.",

    // Navigation
    nav: {
      home: "Home",
      create: "Create",
      preview: "Preview",
    },

    // Home page
    home: {
      greeting: "What are you feeling?",
      subtitle: "Pick your vibe, upload your moments.",
      recentStories: "Recent Stories",
      noRecent: "Your stories will appear here",
      startCreating: "Start Creating",
      pickMood: "Choose a mood",
      pickType: "Choose story type",
      continueBtn: "Continue",
      badge: "AI-powered",
    },

    // Story Types
    storyTypes: {
      moment: {
        name: "Moment",
        description: "One feeling, one shot",
        hint: "1–2 photos · 10–15s",
      },
      journey: {
        name: "Journey",
        description: "A story with a beginning and end",
        hint: "3–5 photos · 15–25s",
      },
      vibe: {
        name: "Vibe",
        description: "Just looks good, no story needed",
        hint: "1–3 photos · 10–15s",
      },
    },

    // Mood Packs
    moods: {
      "night-drive": {
        name: "Night Drive",
        description: "Late night, city lights, lo-fi",
      },
      chill: {
        name: "Chill",
        description: "Slow down, breathe easy",
      },
      sad: {
        name: "Sad",
        description: "Nostalgic, emotional, raw",
      },
      coding: {
        name: "Coding",
        description: "Focus mode, dark energy",
      },
      cinematic: {
        name: "Cinematic",
        description: "Epic, wide, dramatic",
      },
      neon: {
        name: "Neon",
        description: "Cyberpunk, city, vibrant",
      },
    },

    // Property 'selectPrompt' does not exist on type '{ title: string; subtitle: string; tapToUpload: string; dragDrop: string; formats: string; maxFiles: string; addMore: string; processing: string; uploadError: string; }'.

    // Create / Upload
    upload: {
      title: "Upload your moments",
      subtitle: "Photos or short videos",
      tapToUpload: "Tap to upload",
      dragDrop: "or drag & drop",
      formats: "JPG, PNG, MP4 · Max 50MB each",
      maxFiles: "Max {max} files for {type}",
      addMore: "Add more",
      processing: "Processing...",
      uploadError: "Upload failed, please try again",
      selectPrompt: "Select your moments",
    },

    // Editor
    editor: {
      analyzingTitle: "AI is working...",
      step1: "Analyzing your photos",
      step2: "Applying {mood} mood",
      step3: "Syncing with music",
      step4: "Generating caption",
      captionLabel: "Caption",
      captionPlaceholder: "AI will write this for you...",
      editCaption: "Edit caption",
      musicLabel: "Music",
      suggestedBy: "Suggested by AI",
      durationLabel: "Duration",
      shuffleBtn: "Shuffle style",
      previewBtn: "Preview story",
    },

    // Preview / Export
    preview: {
      title: "Your story is ready",
      shuffleBtn: "Shuffle",
      exportFor: "Export for",
      platforms: {
        instagram: "Instagram",
        tiktok: "TikTok",
        facebook: "Facebook",
        download: "Save MP4",
      },
      exportBtn: "Export story",
      rendering: "Creating your video...",
      renderDone: "Done! Your story is ready.",
      downloadBtn: "Download",
      makeAnother: "Make another",
      estimatedTime: "Est. {time}s",
    },

    // Language switcher
    language: {
      label: "Language",
      en: "English",
      vi: "Tiếng Việt",
    },

    // Errors
    errors: {
      generic: "Something went wrong. Please try again.",
      fileTooLarge: "File is too large (max 50MB)",
      invalidFormat: "Format not supported",
      aiError: "AI analysis failed. Using defaults.",
    },
  },

  vi: {
    // App
    appName: "MoodStory",
    appTagline: "Chỉnh ít. Chất nhiều.",

    // Navigation
    nav: {
      home: "Trang chủ",
      create: "Tạo mới",
      preview: "Xem trước",
    },

    // Home page
    home: {
      greeting: "Bạn đang cảm thấy thế nào?",
      subtitle: "Chọn mood, upload khoảnh khắc của bạn.",
      recentStories: "Story gần đây",
      noRecent: "Story của bạn sẽ hiện ở đây",
      startCreating: "Bắt đầu tạo",
      pickMood: "Chọn mood",
      pickType: "Chọn loại story",
      continueBtn: "Tiếp tục",
      badge: "Hỗ trợ AI",
    },

    // Story Types
    storyTypes: {
      moment: {
        name: "Khoảnh Khắc",
        description: "Một cảm xúc, một tấm ảnh",
        hint: "1–2 ảnh · 10–15 giây",
      },
      journey: {
        name: "Hành Trình",
        description: "Câu chuyện có đầu có cuối",
        hint: "3–5 ảnh · 15–25 giây",
      },
      vibe: {
        name: "Vibe",
        description: "Chỉ cần đẹp, không cần story",
        hint: "1–3 ảnh · 10–15 giây",
      },
    },

    // Mood Packs
    moods: {
      "night-drive": {
        name: "Night Drive",
        description: "Đêm muộn, đèn đường, lo-fi",
      },
      chill: {
        name: "Chill",
        description: "Thư giãn, nhẹ nhàng",
      },
      sad: {
        name: "Buồn",
        description: "Nostalgic, cảm xúc, chân thật",
      },
      coding: {
        name: "Coding",
        description: "Tập trung, dark, synthwave",
      },
      cinematic: {
        name: "Điện Ảnh",
        description: "Hoành tráng, rộng, kịch tính",
      },
      neon: {
        name: "Neon",
        description: "Cyberpunk, thành phố, rực rỡ",
      },
    },

    // Create / Upload
    upload: {
      title: "Upload khoảnh khắc của bạn",
      subtitle: "Ảnh hoặc video ngắn",
      tapToUpload: "Nhấn để upload",
      dragDrop: "hoặc kéo thả vào đây",
      formats: "JPG, PNG, MP4 · Tối đa 50MB mỗi file",
      maxFiles: "Tối đa {max} file cho loại {type}",
      addMore: "Thêm file",
      processing: "Đang xử lý...",
      uploadError: "Upload thất bại, thử lại nhé",
      selectPrompt: "Chọn khoảnh khắc của bạn",
    },

    // Editor
    editor: {
      analyzingTitle: "AI đang xử lý...",
      step1: "Phân tích ảnh của bạn",
      step2: "Áp dụng mood {mood}",
      step3: "Đồng bộ với nhạc",
      step4: "Tạo caption",
      captionLabel: "Caption",
      captionPlaceholder: "AI sẽ viết cái này cho bạn...",
      editCaption: "Chỉnh caption",
      musicLabel: "Nhạc",
      suggestedBy: "AI gợi ý",
      durationLabel: "Thời lượng",
      shuffleBtn: "Đổi style",
      previewBtn: "Xem trước story",
    },

    // Preview / Export
    preview: {
      title: "Story của bạn đã sẵn sàng",
      shuffleBtn: "Shuffle",
      exportFor: "Xuất cho",
      platforms: {
        instagram: "Instagram",
        tiktok: "TikTok",
        facebook: "Facebook",
        download: "Lưu MP4",
      },
      exportBtn: "Xuất story",
      rendering: "Đang tạo video...",
      renderDone: "Xong! Story của bạn đã sẵn sàng.",
      downloadBtn: "Tải xuống",
      makeAnother: "Tạo story khác",
      estimatedTime: "Khoảng {time}s",
    },

    // Language switcher
    language: {
      label: "Ngôn ngữ",
      en: "English",
      vi: "Tiếng Việt",
    },

    // Errors
    errors: {
      generic: "Có lỗi xảy ra. Vui lòng thử lại.",
      fileTooLarge: "File quá lớn (tối đa 50MB)",
      invalidFormat: "Định dạng không được hỗ trợ",
      aiError: "AI phân tích thất bại. Đang dùng mặc định.",
    },
  },
};

export type Locale = keyof typeof translations;
export type Translations = typeof translations.en;
