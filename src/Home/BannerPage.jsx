import React, {  Suspense, useState,useEffect} from "react";
import { useDashboard } from "../contexts/DashboardContext"; 
import "./BannerPage.css";

const StatsChart = React.lazy(() => import("./StatsChart"));

const BannerPage = () => {
  const { dashboardData, loading } = useDashboard();
  const [count,setCount] =useState(0)


  useEffect(() => {
    if (!loading && dashboardData) {
      const totalPlaced = Object.values(dashboardData.yearOFPlacement || {}).reduce(
        (acc, value) => acc + value,
        0
      );
      setCount(totalPlaced===0?3500:totalPlaced); 
    }
  }, [dashboardData, loading]);
  

  return (
    <div className="coverpage-container">
      <div className="home-cover-text-container">
        <div className="home-text-container">
          <div className="home-titles">
            <p className="home-title">
              It's <span className="span-home-title">Not Just</span> A Numbers
            </p>
            <p className="tag-line">
              See Successful Students{" "}
              <span className="span-home-title">Placements</span> Journey
            </p>
          </div>

          {dashboardData && (
            <div className="placement-card">
              <h1 className="student-count">
                {count}
                <span className="plus-sign">+</span>
              </h1>
              <p className="students-placed">Students Placed</p>
              <p className="counting">
                <span className="blinking">&gt;&gt;&gt; Still Counting...!</span>
              </p>
            </div>
          )}
        </div>

        <div className="stats-studentplaced-container">
          {dashboardData && (
            <Suspense fallback={<p>Loading chart...</p>}>
              <StatsChart />
            </Suspense>
          )}

          {/* <div className="video-wrapper" style={{ width: "400px", height: "225px" }}>
            {!isPlayerVisible ? (
              <img
                src="https://res.cloudinary.com/db2bpf0xw/image/upload/v1735540724/youtube-video_f2flg8.webp"
                alt="YouTube Thumbnail"
                className="youtube-thumbnail"
                width="1280" 
                height="720"
                style={{ width: "100%", height: "100%", cursor: "pointer" }}
                onClick={handleVideoLoad}
              />
            ) : (
              <iframe
                width="380"
                height="225"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
          </div> */}

<div className="video-wrapper" style={{ width: "400px", height: "225px" }}>
      <video
        width="100%"
        height="100%"
        controls
        poster="https://res.cloudinary.com/db2bpf0xw/image/upload/v1735634876/codegnan-thumbnail_gsscbz.webp" 
        style={{ backgroundColor: "#000" }}
      >
        <source src="https://res.cloudinary.com/db2bpf0xw/video/upload/v1735634495/Placement_tt4kwi.mp4" type="video/mp4" />
      </video>
    </div>
        </div>
      </div>

      <div className="image-container">
        <img
          src="https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849439/banner-girl_i195ik.webp"
          alt="Banner Girl"
          className="banner-girl"
          loading="lazy"
           width="400" 
           height="300"
        />
      </div>

      {!dashboardData && !loading && (
        <p className="error-message">Placement data is currently unavailable.</p>
      )}


    </div>
  );
};

export default BannerPage;
