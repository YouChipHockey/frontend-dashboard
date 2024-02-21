import React, { useEffect, useState } from 'react';
import TimelineSlider from './TimelineSlider';

const PlayerTrajectories = () => {
  const [playerTrajectories, setPlayerTrajectories] = useState({});
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [maxTime, setMaxTime] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/trajectories');
        if (response.ok) {
          const trajectoriesData = await response.json();
          setPlayerTrajectories(trajectoriesData);
          console.log(trajectoriesData)

          // Calculate the max time dynamically
          const maxTime = trajectoriesData[1].trajectory[trajectoriesData[1].trajectory.length - 1].time
          console.log(maxTime)
          setMaxTime(maxTime);
        } else {
          console.error('Error fetching player trajectories:', response.status);
        }
      } catch (error) {
        console.error('Error fetching player trajectories:', error);
      }
    };

    fetchData();
  }, []);

  const drawPlayerCircles = (ctx) => {
    for (const playerId in playerTrajectories) {
      const playerData = playerTrajectories[playerId];
      const x = playerData.trajectory[playerData.trajectory.length - 1].x;
      const y = playerData.trajectory[playerData.trajectory.length - 1].y;

      ctx.beginPath();
      ctx.arc(x, y, 24, 0, 2 * Math.PI);

      const playerColor = playerData.team === 0 ? '#FF0000' : '#2E318F';
      const alpha = selectedPlayerId === playerId ? 1 : 0.5;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = playerColor;
      ctx.fill();
      ctx.closePath();

      ctx.globalAlpha = 1; // Сброс прозрачности

      ctx.font = '12px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${playerData.name} ${playerData.surname}`, x, y - 32);

      ctx.font = '12px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`100 км/ч`, x, y + 42);
      ctx.fillText(`100 м.`, x, y + 56);

      ctx.font = '20px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${playerData.num}`, x, y);
    }
  };

  const drawSmoothTrajectory = (ctx, points) => {
    const tension = 0.4;
    const numOfSegments = 16;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 2; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }

    ctx.quadraticCurveTo(
      points[points.length - 2].x,
      points[points.length - 2].y,
      points[points.length - 1].x,
      points[points.length - 1].y
    );

    ctx.strokeStyle = 'rgba(46, 49, 143, 0.5)';
    ctx.lineWidth = 5;
    ctx.stroke();
  };

  const drawTrajectories = () => {
    const canvas = document.getElementById('trajectory-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 0.5;


    ctx.beginPath();
    ctx.moveTo(77, 0);
    ctx.lineTo(77, 616);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(466, 0);
  ctx.lineTo(466, 616);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(753, 0);
  ctx.lineTo(753, 616);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(1142, 0);
  ctx.lineTo(1142, 616);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.closePath();


  ctx.beginPath();
  ctx.arc(217 + 15, 122 + 15, 7.5, 0, 2 * Math.PI);
  ctx.fillStyle = "#FF0000";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(217 + 15, 472 + 15, 7.5, 0, 2 * Math.PI);
  ctx.fillStyle = "#FF0000";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(507 + 15, 122 + 15, 7.5, 0, 2 * Math.PI);
  ctx.fillStyle = "#FF0000";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(507 + 15, 472 + 15, 7.5, 0, 2 * Math.PI);
  ctx.fillStyle = "#FF0000";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(698 + 15, 122 + 15, 7.5, 0, 2 * Math.PI);
  ctx.fillStyle = "#FF0000";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(698 + 15, 472 + 15, 7.5, 0, 2 * Math.PI);
  ctx.fillStyle = "#FF0000";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(988 + 15, 122 + 15, 7.5, 0, 2 * Math.PI);
  ctx.fillStyle = "#FF0000";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(988 + 15, 472 + 15, 7.5, 0, 2 * Math.PI);
  ctx.fillStyle = "#FF0000";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(217 + 15, 122 + 15, 88.5, 0, 2 * Math.PI);
  ctx.strokeStyle = '#FF0000';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(217 + 15, 472 + 15, 88.5, 0, 2 * Math.PI);
  ctx.strokeStyle = '#FF0000';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(988 + 15, 122 + 15, 88.5, 0, 2 * Math.PI);
  ctx.strokeStyle = '#FF0000';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(988 + 15, 472 + 15, 88.5, 0, 2 * Math.PI);
  ctx.strokeStyle = '#FF0000';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();

    drawPlayerCircles(ctx);

    if (selectedPlayerId && playerTrajectories[selectedPlayerId]) {
      const playerTrajectory = playerTrajectories[selectedPlayerId].trajectory;

      if (playerTrajectory.length > 1) {
        drawSmoothTrajectory(ctx, playerTrajectory);
      }
    }
  };

  useEffect(() => {
    drawTrajectories();
  }, [playerTrajectories, selectedPlayerId]);

  const handlePlayerClick = (playerId) => {
    setSelectedPlayerId(playerId);
  };

  const handleCanvasClick = (event) => {
    const canvas = document.getElementById('trajectory-canvas');
    const ctx = canvas.getContext('2d');
    const canvasRect = canvas.getBoundingClientRect();
    const x = event.clientX - canvasRect.left;
    const y = event.clientY - canvasRect.top;

    for (const playerId in playerTrajectories) {
      const playerData = playerTrajectories[playerId];
      const playerX = playerData.trajectory[playerData.trajectory.length - 1].x;
      const playerY = playerData.trajectory[playerData.trajectory.length - 1].y;

      const distance = Math.sqrt((x - playerX) ** 2 + (y - playerY) ** 2);

      if (distance <= 24) {
        handlePlayerClick(playerId);
        return;
      }
    }

    setSelectedPlayerId(null);
  };

  const onHandleSliderChange = async (newValues) => {
    try {

      const response = await fetch('http://147.45.68.109:5000/api/filtered_trajectories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_time: newValues[0],
          end_time: newValues[1],
        }),
      });

      if (response.ok) {
        const trajectoriesData = await response.json();
        console.log(trajectoriesData)
        setPlayerTrajectories(trajectoriesData);
      } else {
        console.error('Error fetching player trajectories:', response.status);
      }
    } catch (error) {
      console.error('Error fetching player trajectories:', error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <TimelineSlider maxTimeInSeconds={maxTime} onSliderChange={onHandleSliderChange} />
      <div className='canvas-container'>
      <canvas
        id="trajectory-canvas"
        onClick={handleCanvasClick}
        style={{ border: '4px solid black', backgroundColor: 'white', borderRadius: '45px' }}
        width={1220}
        height={616.5}
      />
       <svg className="center-svg" width="197" height="195" viewBox="0 0 197 195" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.5">
      <path d="M98.89 194.49C152.97 194.49 196.81 151.071 196.81 97.51C196.81 43.9494 152.97 0.529999 98.89 0.529999C44.8103 0.529999 0.969971 43.9494 0.969971 97.51C0.969971 151.071 44.8103 194.49 98.89 194.49Z" fill="white"/>
      <path d="M99.41 188.84C149.85 188.84 190.74 147.95 190.74 97.51C190.74 47.0698 149.85 6.17999 99.41 6.17999C48.9698 6.17999 8.08002 47.0698 8.08002 97.51C8.08002 147.95 48.9698 188.84 99.41 188.84Z" fill="#0D162B" stroke="#FF0000" stroke-width="3" stroke-miterlimit="10"/>
      <path d="M141.78 55.14H57.04V139.88H141.78V55.14Z" fill="white"/>
      <path d="M138.02 58.91H60.81V136.12H138.02V58.91Z" fill="#0D162B"/>
      <path d="M128.6 68.32H70.22V126.7H128.6V68.32Z" fill="white"/>
      <path d="M59.35 92.8H34.87V102.22H59.35V92.8Z" fill="white"/>
      <path d="M59.35 66.44H34.87V75.86H59.35V66.44Z" fill="white"/>
      <path d="M81.95 34.43H72.53V58.91H81.95V34.43Z" fill="white"/>
      <path d="M164.8 66.44H140.32V75.86H164.8V66.44Z" fill="white"/>
      <path d="M164.8 92.8H140.32V102.22H164.8V92.8Z" fill="white"/>
      <path d="M164.8 119.17H140.32V128.59H164.8V119.17Z" fill="white"/>
      <path d="M59.35 119.17H34.87V128.59H59.35V119.17Z" fill="white"/>
      <path d="M104.12 34.43H94.7V58.91H104.12V34.43Z" fill="white"/>
      <path d="M126.53 34.43H117.11V58.91H126.53V34.43Z" fill="white"/>
      <path d="M126.53 137.38H117.11V161.86H126.53V137.38Z" fill="white"/>
      <path d="M81.95 137.38H72.53V161.86H81.95V137.38Z" fill="white"/>
      <path d="M104.12 137.38H94.7V161.86H104.12V137.38Z" fill="white"/>
      </g>
      </svg>
      </div>
    </div>
  );
};

export default PlayerTrajectories;
