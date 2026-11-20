# Sapphire Blossom — Personal Media Assets

Place your personal video and background music in this directory.

## Directory Structure:

```
public/
  ├── images/            (Optional custom images)
  │
  └── media/
      ├── birthday_video.mp4  (Your personal birthday video message for Chapter 6)
      ├── video_poster.jpg    (Optional: Preview thumbnail for the video)
      └── background_song.mp3 (Optional: Gentle romantic background music)
```

## How to Configure:
1. Copy your files into `public/images/` or `public/media/`.
2. Open `src/config.js`.
3. Update the matching path (e.g. `videoSrc: "/media/birthday_video.mp4"`).
4. Save and rebuild with `npm run build`.

> **Note on File Sizes:**
> - Keep images under 1MB each (`.jpg`, `.png`, or `.webp`) for fast mobile loading.
> - For video (`.mp4`), a resolution of 1080p or 720p with H.264 compression is recommended for smooth playback on all phones and networks.
