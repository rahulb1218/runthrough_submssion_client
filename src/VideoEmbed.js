import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const VideoEmbed = () => {
  const { videoLink } = useParams();
  const decodedVideoLink = decodeURIComponent(videoLink);
  const [critiques, setCritiques] = useState([]);
  const [critiqueText, setCritiqueText] = useState('');
  const playerRef = useRef(null);

  const getVideoId = (url) => {
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    return match ? match[1] : null;
  };

  const videoId = getVideoId(decodedVideoLink);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = loadVideoPlayer;
    } else {
      loadVideoPlayer();
    }

    function loadVideoPlayer() {
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '315',
        width: '560',
        videoId: videoId,
        events: {
          onReady: onPlayerReady,
        },
      });
    }

    function onPlayerReady(event) {
      // Player is ready
    }

    fetchCritiques();
  }, [videoId]);

  const handleAddCritique = async () => {
    const currentTime = playerRef.current.getCurrentTime();
    const newCritique = { text: critiqueText, time: currentTime };
    setCritiques([...critiques, newCritique]);
    setCritiqueText('');

    try {
      await fetch(`${process.env.react_app_api_url}/addCritique`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoLink: decodedVideoLink, critique: critiqueText, time: currentTime }),
      });
    } catch (error) {
      console.error('Error adding critique:', error);
    }
  };

  const handleDeleteCritique = async (index) => {
    const critiqueToDelete = critiques[index];
    try {
      await fetch(`${process.env.react_app_api_url}/deleteCritique`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoLink: decodedVideoLink, time: critiqueToDelete.time }),
      });
      setCritiques(critiques.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error deleting critique:', error);
    }
  };

  const handleTimeClick = (time) => {
    playerRef.current.seekTo(time);
    playerRef.current.playVideo();
  };

  const fetchCritiques = async () => {
    try {
      const response = await fetch(`${process.env.react_app_api_url}/critiques?videoLink=${encodeURIComponent(decodedVideoLink)}`);
      const result = await response.json();
      setCritiques(result.data);
    } catch (error) {
      console.error('Error fetching critiques:', error);
    }
  };

  const handlePlayPause = () => {
    if (playerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleJumpForward = () => {
    playerRef.current.seekTo(playerRef.current.getCurrentTime() + 5);
  };

  const handleJumpBackward = () => {
    playerRef.current.seekTo(playerRef.current.getCurrentTime() - 5);
  };

  return (
    <div className="video-embed">
      <h2>Video Submission</h2>
      <div id="youtube-player"></div>
      <div className="media-controls">
        <button onClick={handlePlayPause}>Play/Pause</button>
        <button onClick={handleJumpBackward}>-5s</button>
        <button onClick={handleJumpForward}>+5s</button>
      </div>
      <div className="critiques-section">
        <input
          type="text"
          placeholder="Add a critique"
          value={critiqueText}
          onChange={(e) => setCritiqueText(e.target.value)}
        />
        <button onClick={handleAddCritique}>Add Critique</button>
        <ul>
          {critiques.map((critique, index) => (
            <li key={index}>
              <span onClick={() => handleTimeClick(critique.time)}>
                {critique.time !== undefined ? new Date(critique.time * 1000).toISOString().substr(11, 8) : 'Invalid Time'}
              </span>
              : {critique.text}
              <button onClick={() => handleDeleteCritique(index)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default VideoEmbed;
