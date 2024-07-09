// VideoEmbed.js
import React from 'react';
import { useParams } from 'react-router-dom';

const VideoEmbed = () => {
  const { videoLink } = useParams();

  return (
    <div className="video-embed">
      <h2>Video Submission</h2>
      <iframe
        width="560"
        height="315"
        src={videoLink}
        title="Video Submission"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default VideoEmbed;
