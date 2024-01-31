import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';

const MatchControl = () => {
  const [matchStatus, setMatchStatus] = useState('Not Started');
  const [currentTime, setCurrentTime] = useState('');
  const [matchStartTime, setMatchStartTime] = useState(null);

  const startMatch = async () => {
    try {
      await fetch('http://127.0.0.1:5000/api/start_match', { method: 'POST' });
      setMatchStartTime(new Date());
      setMatchStatus('Match Started');
    } catch (error) {
      console.error('Error starting match:', error);
    }
  };

  const endMatch = async () => {
    try {
      await fetch('http://127.0.0.1:5000/api/end_match', { method: 'POST' });
      setMatchStartTime(null);
      setMatchStatus('Match Ended');
    } catch (error) {
      console.error('Error ending match:', error);
    }
  };

  useEffect(() => {
    const fetchCurrentTime = () => {
      if (matchStartTime) {
        const elapsedTime = new Date() - matchStartTime;
        const formattedTime = new Date(elapsedTime).toISOString().substr(11, 8);
        setCurrentTime(formattedTime);
      } else {
        setCurrentTime('Not Started');
      }
    };

    const intervalId = setInterval(fetchCurrentTime, 1000);
    return () => clearInterval(intervalId);
  }, [matchStartTime]);

  return (
    <div className='MatchControls'>
      <div className='MatchInfo'>
        <Button className='MatchItem' onClick={startMatch} variant="outlined" color="success">Start Match</Button>
        <Button className='MatchItem' onClick={endMatch} variant="outlined" color="error">End Match</Button>
      </div>
      <div className='MatchInfo'>
        <p className='MatchItem'>Match Status: {matchStatus}</p>
        <p className='MatchItem'>Elapsed Time: {currentTime}</p>
      </div>
    </div>
  );
};

export default MatchControl;
