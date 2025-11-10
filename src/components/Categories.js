import React from "react";
import "./Categories.css";
import img1 from "./../assets/movies/1.jpg";
import img2 from "./../assets/movies/2.jpg";
import img3 from "./../assets/movies/3.jpg";
import img4 from "./../assets/movies/4.jpg";
import img5 from "./../assets/movies/5.jpg";
import img6 from "./../assets/movies/6.jpg";
import img7 from "./../assets/movies/7.jpg";
import img8 from "./../assets/movies/8.jpg";
import img9 from "./../assets/movies/9.jpg";
import img10 from "./../assets/movies/10.jpg";
import img11 from "./../assets/movies/11.jpg";
import img12 from "./../assets/movies/12.jpg";
import img13 from "./../assets/movies/13.jpg";
import img14 from "./../assets/movies/14.jpg";
import img15 from "./../assets/movies/15.jpg";
import img16 from "./../assets/movies/16.jpg";
import img17 from "./../assets/movies/17.jpg";
import img18 from "./../assets/movies/18.jpg";
import img19 from "./../assets/movies/19.jpg";
import img20 from "./../assets/movies/20.jpg";
import img21 from "./../assets/movies/21.jpg";
import img22 from "./../assets/movies/22.jpg";
import img23 from "./../assets/movies/23.jpg";
import img24 from "./../assets/movies/24.jpg";
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import KayakingIcon from '@mui/icons-material/Kayaking';
import ParaglidingIcon from '@mui/icons-material/Paragliding';
import SportsMotorsportsIcon from '@mui/icons-material/SportsMotorsports';
import WavesIcon from '@mui/icons-material/Waves';
import { Link } from 'react-router-dom';

const movies = [
  {
    name: "ფანტასტიკური ოთხეული: პირველი ნაბიჯები",
    types: ["PG13", "eng", "geo"],
    times: ["19:00", "21:45", "22:15"],
    image: img1,
    main: true,
  },
  {
    name: "სმურფები კინოში",
    times: ["12:00", "12:00", "14:30"],
    types: ["PG", "eng", "geo"],
    image: img2,
    main: true,
  },
  {
    name: "მე ვიცი, რა ჩაიდინეთ წინა ზაფხულს",
    times: ["16:45", "22:00", "16:45"],
    types: ["R", "eng", "geo"],
    image: img3,
    main: true,
  },
  {
    name: "სუპერმენი",
    times: ["11:45", "13:45", "15:45"],
    types: ["PG13", "eng", "geo"],
    image: img4,
    main: true,
  },
  {
    name: "წმინდა ელექტროენერგია",
    times: ["19:30", "22:00", "22:00"],
    types: ["R", "geo"],
    image: img5,
    main: true,
  },
  {
    name: "იურული სამყარო: გამოღვიძება",
    times: ["12:45", "18:45", "22:15"],
    types: ["PG13", "eng", "geo"],
    image: img6,
    main: true,
  },
  {
    name: "F1",
    times: ["12:15", "13:15", "15:30"],
    types: ["PG13", "eng", "geo"],
    image: img7,
    main: false,
  },
  {
    name: "ლილო და სტიჩი",
    times: ["11:45", "14:30", "19:45"],
    types: ["PG", "geo"],
    image: img8,
    main: false,
  },
  {
    name: "მ3განი 2.0",
    times: ["13:45", "13:45", "13:45"],
    types: ["PG13", "geo"],
    image: img9,
    main: false,
  },
  {
    name: "ელიო",
    times: ["11:45", "16:30", "11:45"],
    types: ["PG", "geo"],
    image: img10,
    main: false,
  },
  {
    name: "არასწორი მეჯვარე",
    times: ["17:00", "21:45", "17:00"],
    types: ["R", "geo"],
    image: img11,
    main: false,
  },
  {
    name: "მატერიალისტები",
    times: ["16:45", "16:45", "19:30"],
    types: ["R", "geo"],
    image: img12,
    main: false,
  },
  {
    name: "BTS ARMY: Forever We Are Young",
    times: ["19:30", "19:30", "19:30"],
    types: ["PG13", "kor"],
    image: img13,
    main: false,
  },
  {
    name: "როგორ მოვარჯულოთ დრაკონი",
    times: ["11:45", "14:00", "11:45"],
    types: ["PG", "geo"],
    image: img14,
    main: false,
  },
];

const upcoming = [
  { name: "დააბრუნე ის", image: img15, main: false },
  { name: "ფანტასტიკური ოთხეული: პირველი ნაბიჯები", image: img16, main: false },
  { name: "ცუდი ტიპები 2", image: img17, main: false },
  { name: "შიშველი პისტოლეტი", image: img18, main: false },
  { name: "გიჟური პარასკევი 2", image: img19, main: false },
  { name: "იარაღები", image: img20, main: false },
  { name: "ჩე, ლიდერი ყოველთვის მართალია", image: img21, main: false },
  { name: "გაუნათებელი სინათლე", image: img22, main: false },
  { name: "BTS ARMY: Forever We Are Young", image: img13, main: false },
  { name: "Nobody 2", image: img23, main: false },
  { name: "Grand Prix of Europe", image: img24, main: false },
];

const seaActivities = [
  { name: 'პარაშუტი', icon: <ParaglidingIcon color="primary" sx={{ fontSize: 48 }} />, path: '/parachute' },
  { name: 'იახტა', icon: <DirectionsBoatIcon color="primary" sx={{ fontSize: 48 }} />, path: '/yacht' },
  { name: 'რაფტინგი', icon: <KayakingIcon color="primary" sx={{ fontSize: 48 }} />, path: '/rafting' },
  { name: 'ზღვის მოტოციკლი', icon: <SportsMotorsportsIcon color="primary" sx={{ fontSize: 48 }} />, path: '/sea-moto' },
  { name: 'სხვა აქტივობები', icon: <WavesIcon color="primary" sx={{ fontSize: 48 }} />, path: '/sea-other' },
];
const Categories = () => {
  return (
    <div>
      <div class="categories" id="tab-switcher">
        <div class="catmovie">ფილმები</div>
        <div className="session">სეანსები</div>
      </div>

      <div className="movie-cards">
        {movies.map((value, index) => {
          return (
            <div
              className="movie-card"
              key={index}
              style={{ width: value.main ? "380px" : "190px" }}
            >
              <div className="movinfo">
                <div className="movie-image">
                  <img src={value.image} alt="aphisha" />

                  <div className="hovcontext">
                    <div className="trailer">ტრეილერი</div>
                    <div className="full">სრულად</div>
                  </div>
                </div>
                <div className="movtimes">
                  {value.times.map((time, i) => (
                    <div className="movtime" key={i}>
                      <div>{time}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="title" title={value.name}>
                {value.name}
              </div>
              <div>
                <div className="movtypes">
                  {value.types.map((type, i) => (
                    <div className="movtype" key={i}>
                      {type}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="soon-title">იხილეთ მალე...</div>
      <div className="movie-cards">
        {upcoming.map((value, index) => {
          return (
            <div
              className="movie-card"
              key={index}
              style={{ width: value.main ? "380px" : "190px" }}
            >
              <div className="movinfo">
                <div className="movie-image">
                  <img src={value.image} alt="aphisha" />

                  <div className="uhovcontext">
                    <div className="trailer">ტრეილერი</div>
                    <div className="full">სრულად</div>
                    <div className="message">შემატყობინე</div>
                  </div>
                </div>
              </div>
              <div className="title" title={value.name}>
                {value.name}
              </div>
            </div>
          );
        })}
      </div>
      {/* Sea Activities Section */}
      <div className="soon-title" style={{ marginTop: 40 }}>ზღვის აქტივობები</div>
      <div className="movie-cards">
        {seaActivities.map((activity, idx) => (
          <Link to={activity.path} key={idx} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="movie-card" style={{ width: 190, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <div style={{ margin: '16px 0' }}>{activity.icon}</div>
              <div className="title" style={{ textAlign: 'center' }}>{activity.name}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Categories;
