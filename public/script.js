// Fetch video URL from Backblaze
async function getVideoUrl(videoId) {
  const response = await fetch(`/video/${videoId}`);
  const data = await response.json();
  return data.url;
}

// Example usage in Fluid Player
document.addEventListener('DOMContentLoaded', async () => {
  const videoId = 'VIDEO_ID_FROM_DATABASE'; // ระบุ Video ID ที่เกี่ยวข้อง
  const videoUrl = await getVideoUrl(videoId);

  fluidPlayer('video-player', {
    layoutControls: {
      primaryColor: '#333',
      posterImage: '/uploads/poster.jpg',
    },
    vastOptions: {
      adList: [
        {
          roll: 'preRoll',
          vastTag: 'https://example.com/vast.xml',
          adText: 'Advertisement',
        },
      ],
    },
  });

  document.getElementById('video-player').setAttribute('src', videoUrl);
});
