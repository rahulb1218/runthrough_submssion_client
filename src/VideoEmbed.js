import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import YouTube from 'react-youtube';

const VideoEmbed = () => {
  const { videoLink } = useParams();
  const decodedVideoLink = decodeURIComponent(videoLink);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');
  const videoRef = useRef(null);

  const getEmbedUrl = (url) => {
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return url;
  };

  const embedUrl = getEmbedUrl(decodedVideoLink);

  const handleAddNote = async () => {
    const currentTime = this.props.player.youtubePlayer.getCurrentTime();
    console.log('Current Time:', currentTime)
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
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
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

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div className="video-embed">
      <h2>Video Submission</h2>
      <YouTube
        videoId={"O1_SKK0_jHU"}                 
        className={"video"}               
    />
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
