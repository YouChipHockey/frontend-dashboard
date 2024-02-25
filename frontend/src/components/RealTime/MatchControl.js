import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';

const MatchControl = () => {
  const [matchStatus, setMatchStatus] = useState('Not Started');
  const [currentTime, setCurrentTime] = useState('');
  const [matchStartTime, setMatchStartTime] = useState(null);

  const startMatch = async () => {
    try {
      const response = await fetch('http://81.19.137.188:5000/api/start_match', { method: 'POST' });
      const result = await response.json();
      if (result.message === "Match started") {
        setMatchStartTime(new Date());
        setMatchStatus('Match Started');
      } else {
        console.log("Match already running");
      }
    } catch (error) {
      console.error('Error starting match:', error);
    }
  };

  const endMatch = async () => {
    try {
      const response = await fetch('http://81.19.137.188:5000/api/end_match', { method: 'POST' });
      const result = await response.json();
      if (result.message === "Match ended") {
        setMatchStartTime(null);
        setMatchStatus('Match Ended');
      } else {
        console.log("Match not running");
      }
    } catch (error) {
      console.error('Error ending match:', error);
    }
  };

  const fetchMatchTime = async () => {
    try {
      const response = await fetch('http://81.19.137.188:5000/api/match_time');
      const result = await response.json();
      if (result.match_time.toFixed(0) !== 0) {
          setMatchStatus('Match Started');
      }
      setCurrentTime(result.match_time.toFixed(0));  // Округляем время до целых секунд
    } catch (error) {
      console.error('Error fetching match time:', error);
    }
  };

  const clearTrajectoryPoints = async () => {
    try {
      const response = await fetch('http://81.19.137.188:5000/api/clear_trajectory_points', { method: 'POST' });
      const result = await response.json();
      if (result.message === "Trajectory points cleared") {
        console.log("Trajectory points cleared successfully");
      } else {
        console.log("Error clearing trajectory points");
      }
    } catch (error) {
      console.error('Error clearing trajectory points:', error);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(fetchMatchTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className='MatchControls'>
      <div className='MatchInfo'>
        <Button
          className='MatchItem'
          onClick={startMatch}
          variant="outlined"
          color="success"
          disabled={matchStatus === 'Match Started'}
        >
          Start Match
        </Button>
        <Button
          className='MatchItem'
          onClick={endMatch}
          variant="outlined"
          color="error"
          disabled={matchStatus === 'Not Started'}
        >
          End Match
        </Button>
        <Button
          className='MatchItem'
          onClick={clearTrajectoryPoints}
          variant="outlined"
          color="primary"
        >
          Clear Trajectory Points
        </Button>
      </div>
      <div className='MatchInfo'>
        <p className='MatchItem'>Match Status: {matchStatus}</p>
        <p className='MatchItem'>Elapsed Time: {currentTime} seconds</p>
      </div>
    </div>
  );
};

export default MatchControl;
