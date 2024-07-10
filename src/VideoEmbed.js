import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaCirclePlay } from "react-icons/fa6";
import { FaForward } from "react-icons/fa6";
import { FaBackward } from "react-icons/fa6";
import { FaCircleXmark } from "react-icons/fa6";

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
    if (playerRef.current && playerRef.current.getCurrentTime) {
      const currentTime = playerRef.current.getCurrentTime();
      const newCritique = { text: critiqueText, time: currentTime };
      setCritiques([...critiques, newCritique]);
      setCritiqueText('');

      try {
        await fetch(`https://boiling-sea-64676-b8976c1f4ca6.herokuapp.com/addCritique`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ videoLink: decodedVideoLink, critique: critiqueText, time: currentTime }),
        });
      } catch (error) {
        console.error('Error adding critique:', error);
      }
    }
  };

  const handleDeleteCritique = async (index) => {
    const critiqueToDelete = critiques[index];
    try {
      await fetch(`https://boiling-sea-64676-b8976c1f4ca6.herokuapp.com/deleteCritique`, {
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
    if (playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(time);
      playerRef.current.playVideo();
    }
  };

  const fetchCritiques = async () => {
    try {
      const response = await fetch(`https://boiling-sea-64676-b8976c1f4ca6.herokuapp.com/critiques?videoLink=${encodeURIComponent(decodedVideoLink)}`);
      const result = await response.json();
      console.log('Critiques fetched:', result.data);
      setCritiques(result.data);
    } catch (error) {
      console.error('Error fetching critiques:', error);
    }
  };

  const handlePlayPause = () => {
    if (playerRef.current && playerRef.current.getPlayerState) {
      if (playerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  };

  const handleJumpForward = () => {
    if (playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(playerRef.current.getCurrentTime() + 5);
    }
  };

  const handleJumpBackward = () => {
    if (playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(playerRef.current.getCurrentTime() - 5);
    }
  };

  return (
    <div className="video-embed">
      <div id="youtube-player"></div>
      <div className="media-controls">
        <button className="jump-backward" onClick={handleJumpBackward}>
          <FaBackward />
        </button>
        <button className="play-pause" onClick={handlePlayPause}>
          <FaCirclePlay />
        </button>
        <button className="jump-forward" onClick={handleJumpForward}>
          <FaForward />
        </button>
      </div>
      <div>
        <div className="critiques-section">
          <input
            type="text"
            placeholder="Add a critique"
            value={critiqueText}
            onChange={(e) => setCritiqueText(e.target.value)}
            className="critique-input"
          />
          <button className="add-critique" onClick={handleAddCritique}>Add</button>
        </div>
        <ul className='critiques-ul'>
    {critiques.map((critique, index) => {
        console.log('Critique:', critique); // Debugging log
        return (
            <li className='critiques-list' key={index}>
                <button className='delete-critique' onClick={() => handleDeleteCritique(index)}>
                    <FaCircleXmark />
                </button>
                <span className='critique-timestamp' onClick={() => handleTimeClick(critique.time)}>
                    {critique.time !== undefined ? new Date(critique.time * 1000).toISOString().substr(11, 8) : 'Invalid Time'}
                </span>
                : {critique.critique}
            </li>
        );
    })}
</ul>
      </div>
    </div>
  );
};

export default VideoEmbed;
