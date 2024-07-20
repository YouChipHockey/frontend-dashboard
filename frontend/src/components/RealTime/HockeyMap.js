import React, { useRef, useEffect, useState } from 'react';
import bezierEasing from 'bezier-easing';

const PlayerInfo = ({player}) => (
  <div className='PlayerInfo'>
    <div className='PlayerMainInfo'>
      <div className='PlayerAvatar'>
      <img className='imageInsideDiv'
        src={`data:image/jpeg;base64,${player.image}`}
        alt={`Player ${player.id} Image`}
      />
      </div>
      <div className='PlayerMainDetails'>
        <div className='PlayerHeader'>
          <h3>{player.name} {player.surname}</h3>
          <h3># {player.num}</h3>
        </div>
        <div className='PlayerBody'>
          <h3>Хват: {player.grip}</h3>
          <h3>Позиция: {player.position}</h3>
          <h3>Команда: {player.team}</h3>
        </div>
      </div>
    </div>
    <div className='PlayerAddInfo'>
      <h1>Показатели катания</h1>
      <div className='PlayerAddBody'>
        <div>
          <h3>Скорость: {player.speed} км/ч</h3>
          <h3>Расстояние: {player.dist} м.</h3>
          <h3>Угол наклона конька: 5*</h3>
        </div>
        <div>
          <h3>Ускорение: - м/c2</h3>
          <h3>Время на льду: {player.time} м</h3>
          <h3>Средняя скорость: {player.speed} км/ч</h3>
        </div>
      </div>
    </div>
  </div>
);

const HockeyMap = () => {
  const canvasRef = useRef(null);
  const playersDataRef = useRef([]);
  const serverUrl = 'http://77.221.156.184:5000/api/players';
  const [animationFrame, setAnimationFrame] = useState(null);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isClicking, setIsClicking] = useState(false); // Флаг для отслеживания клика
  const img = new Image();
  img.src = './logo.svg';


  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let isUnmounted = false; // Флаг для отслеживания размонтирования компонента

    const fetchDataAndAnimate = async () => {
      try {
        const response = await fetch(serverUrl);
        if (response.ok) {
          const newPlayersData = await response.json();
          console.log(newPlayersData)

          // Запуск анимации только если есть новые данные и компонент не размонтирован
          if (newPlayersData.length > 0 && !isUnmounted) {
            animatePlayers(ctx, newPlayersData);
          } else {
            // Если данных нет или компонент размонтирован, просто повторно запросить их через секунду
            // setAnimationFrame(setTimeout(fetchDataAndAnimate, 25));
          }
        } else {
          console.warn('Server responded with an error:', response.status);
        }
      } catch (error) {
        console.error('Error fetching player coordinates:', error);
      }
    };

    const animatePlayers = (ctx, newPlayersData) => {
      const startPlayersData = playersDataRef.current;

      const animateStep = (step) => {
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
    
    
    
        ctx.globalAlpha = 1;

        // img.onload = () => {
        // ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // }    

        if (newPlayersData && newPlayersData.length > 0) {
          newPlayersData.forEach((player, index) => {
            if (player.visibility === true){
            const startX = startPlayersData[index]?.x || player.x;
            const startY = startPlayersData[index]?.y || player.y;

            const endX = player.x;
            const endY = player.y;

            // Используем кривую Безье для сглаживания
            const easing = bezierEasing(0.25, 0.1, 0.25, 1);
            const t = easing(step / 125);

            const x = startX + (endX - startX) * t;
            const y = startY + (endY - startY) * t;
            ctx.beginPath();
            ctx.arc(x, y, 24, 0, 2 * Math.PI);

            // Определение цвета в зависимости от значения team
            const playerColor = player.team === 1 ? '#FF0000' : player.team === 2 ? '#2E318F': '#000000';

            // Прозрачность точки, если игрок был кликнут или выбран
            const isSelected = selectedPlayer && selectedPlayer.id === player.id;
            const isClicked = (
              Math.abs(x - clickPosition.x) < 8 &&
              Math.abs(y - clickPosition.y) < 8
            );

            const alpha = isSelected || (isClicked && isClicking) ? 0.5 : 1;

            ctx.globalAlpha = alpha;
            ctx.fillStyle = playerColor;
            ctx.fill();
            ctx.closePath();

            ctx.globalAlpha = 1; // Сброс прозрачности

            if (player.team !== null){

            ctx.font = '12px Arial';
            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom'; // Выравниваем текст по нижней границе точки
            ctx.fillText(`${player.name} ${player.surname}`, x, y - 32); // Располагаем текст над точкой

            ctx.font = '12px Arial';
            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom'; // Выравниваем текст по нижней границе точки
            ctx.fillText(`${player.speed} км/ч`, x, y + 42);
            ctx.fillText(`${player.dist} м.`, x, y + 56);


            ctx.font = '20px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${player.num}`, x, y);

            // Если был клик на игрока, обработка дополнительных действий
            if (isClicked) {
              setSelectedPlayer(player);
            }

            }
          }

          
          });

          if (step < 125) {
            setAnimationFrame(requestAnimationFrame(() => animateStep(step + 1)));
          } else {
            // После завершения текущей анимации, сохраняем новые координаты
            playersDataRef.current = newPlayersData;

            // Запрашиваем новые координаты и начинаем новую анимацию
            setAnimationFrame(setTimeout(() => {
              fetchDataAndAnimate();
            }, 10));
          }
        }
      };

      // Начинаем анимацию с предыдущих координат
      animateStep(0);
    };

    // Вызываем fetchDataAndAnimate при монтировании компонента
    fetchDataAndAnimate();

    // Очищаем анимацию и устанавливаем флаг размонтирования при размонтировании компонента
    return () => {
      isUnmounted = true;
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        // clearTimeout(animationFrame);
      }
    };
  }, [serverUrl, clickPosition, selectedPlayer, isClicking]);

  // Обработчик события клика на канвасе
  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const canvasRect = canvas.getBoundingClientRect();
    const x = event.clientX - canvasRect.left;
    const y = event.clientY - canvasRect.top;

    // Проверка, был ли клик на поле (вне игрока)
    const clickedOnField = !playersDataRef.current.some(
      (player) => Math.abs(x - player.x) < 8 && Math.abs(y - player.y) < 8
    );

    if (clickedOnField) {
      // Если кликнули на поле, сбрасываем выбранного игрока
      setSelectedPlayer(null);
    }

    setClickPosition({ x, y });
    setIsClicking(true);
  };

  // Обработчик события отпускания клика на канвасе
  const handleCanvasMouseUp = () => {
    setIsClicking(false);
  };

  return (
    <div>

      <div className="canvas-container">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseUp={handleCanvasMouseUp}
        style={{ border: '4px solid black', backgroundColor : "white", borderRadius: "45px" }}
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
      {selectedPlayer && <PlayerInfo player={selectedPlayer} />}
    </div>
  );
};

export default HockeyMap;