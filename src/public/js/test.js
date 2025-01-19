// JavaScript for handling dynamic data and slider
document.addEventListener("DOMContentLoaded", () => {
    const bannerSlider = document.getElementById("banner-slider");
    const pagination = document.createElement("div");
    pagination.className = "pagination";
    bannerSlider.parentNode.appendChild(pagination);

    // Fetch user info (POST request)
    fetch("/api/userinfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: document.cookie.split('=')[1] || '' }) // Example: Sending token in body
    })
        .then(response => response.json())
        .then(data => {
            console.log(data); // Debugging user info response
            if (data.success) {
                const userInfoSection = document.getElementById("user-info");
    
                // 1. 섹션 초기화
                userInfoSection.innerHTML = "";
    
                // 2. 이름 - 레벨 창 생성
                const nameLevelRow = document.createElement("div");
                nameLevelRow.className = "user-info-row";
    
                const userName = document.createElement("span");
                userName.className = "name";
                userName.textContent = data.user.name || "Unknown";
    
                const userLevel = document.createElement("span");
                userLevel.className = "level";
                userLevel.textContent = data.user.member_level || "N/A";
    
                nameLevelRow.appendChild(userName);
                nameLevelRow.appendChild(userLevel);
                userInfoSection.appendChild(nameLevelRow);
    
                // 3. 포인트 창 생성
                const pointsRow = document.createElement("div");
                pointsRow.className = "user-info-row";
    
                const pointsLabel = document.createElement("span");
                pointsLabel.textContent = "포인트";
    
                const pointsValue = document.createElement("span");
                pointsValue.textContent = data.user.stamp || "0";
    
                pointsRow.appendChild(pointsLabel);
                pointsRow.appendChild(pointsValue);
                userInfoSection.appendChild(pointsRow);
            }
        })
        .catch(error => {
            console.error("Error fetching user info:", error);
        });
    

    // Fetch banners (GET request)
    fetch("/api/getbanner")
        .then(response => response.json())
        .then(data => {
            console.log(data)
            if (data.success && Array.isArray(data.banners)) {
                data.banners.forEach((banner, index) => {
                    const img = document.createElement("div");
                    img.className = "banner-slide";
                    const imageLocation = banner.image_loc.startsWith("http") 
                        ? banner.image_loc
                        : `http://localhost:3000${banner.image_loc}`;
                    img.style.backgroundImage = `url(${imageLocation})`;

                    bannerSlider.appendChild(img);

                    // Add dots
                    const dot = document.createElement("div");
                    dot.className = "dot";
                    if (index === 0) dot.classList.add("active");
                    pagination.appendChild(dot);

                    dot.addEventListener("click", () => {
                        moveToSlide(index);
                    });
                });
            }
        })
        .catch(error => {
            console.error("Error fetching banner images:", error);
        });

    let currentSlide = 0;

    function moveToSlide(slideIndex) {
        currentSlide = slideIndex;
        const slideWidth = bannerSlider.clientWidth;
        bannerSlider.style.transform = `translateX(-${slideIndex * slideWidth}px)`;

        // Update active dot
        document.querySelectorAll(".dot").forEach((dot, index) => {
            dot.classList.toggle("active", index === slideIndex);
        });
    }

    
});
