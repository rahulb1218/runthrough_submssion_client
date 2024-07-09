import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const VideoEmbed = () => {
  const { videoLink } = useParams();
  const decodedVideoLink = decodeURIComponent(videoLink);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');
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

    fetchNotes();
  }, [videoId]);

  const handleAddNote = async () => {
    const currentTime = playerRef.current.getCurrentTime();
    const newNote = { text: noteText, time: currentTime };
    setNotes([...notes, newNote]);
    setNoteText('');

    try {
      await fetch('https://boiling-sea-64676-b8976c1f4ca6.herokuapp.com/addNote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoLink: decodedVideoLink, note: noteText, time: currentTime }),
      });
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleTimeClick = (time) => {
    playerRef.current.seekTo(time);
    playerRef.current.playVideo();
  };

  const fetchNotes = async () => {
    try {
      const response = await fetch(`https://boiling-sea-64676-b8976c1f4ca6.herokuapp.com/notes?videoLink=${encodeURIComponent(decodedVideoLink)}`);
      const result = await response.json();
      setNotes(result.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  return (
    <div className="video-embed">
      <h2>Video Submission</h2>
      <div id="youtube-player"></div>
      <div className="notes-section">
        <input
          type="text"
          placeholder="Add a note"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
        />
        <button onClick={handleAddNote}>Add Note</button>
        <ul>
          {notes.map((note, index) => (
            <li key={index}>
              <span onClick={() => handleTimeClick(note.time)}>
                {note.time !== undefined ? new Date(note.time * 1000).toISOString().substr(11, 8) : 'Invalid Time'}
              </span>
              : {note.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default VideoEmbed;
