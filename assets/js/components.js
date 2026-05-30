// ========================================
// SMARTCALC ULTRA PROFESSIONAL
// COMPONENT SYSTEM
// ========================================


// ========================================
// PATH DETECTION
// ========================================

const isCalculatorPage =
window.location.pathname.includes(
  "/calculators/"
);

const basePath =
isCalculatorPage
? "../../"
: "./";


// ========================================
// LOAD COMPONENTS
// ========================================

async function loadComponents(){

  try{

    // NAVBAR

    const navResponse =
    await fetch(
      basePath +
      "components/nav.html"
    );

    const navHTML =
    await navResponse.text();

    document.getElementById(
      "navbar"
    ).innerHTML =
    navHTML;

    // FOOTER

    const footerResponse =
    await fetch(
      basePath +
      "components/footer.html"
    );

    const footerHTML =
    await footerResponse.text();

    document.getElementById(
      "footer"
    ).innerHTML =
    footerHTML;

    // INIT

    initializeNavbar();

  }

  catch(error){

    console.error(
      "COMPONENT ERROR:",
      error
    );

  }

}


// ========================================
// INITIALIZE NAVBAR
// ========================================

async function initializeNavbar(){

  // ========================================
  // ELEMENTS
  // ========================================

  const navLinks =
  document.getElementById(
    "navLinks"
  );

  const mobileMenu =
  document.getElementById(
    "mobileMenu"
  );

  const searchInput =
  document.getElementById(
    "calculatorSearch"
  );

  const searchDropdown =
  document.getElementById(
    "searchDropdown"
  );

  const mobileToggle =
  document.getElementById(
    "mobileToggle"
  );

  const mobileDrawer =
  document.getElementById(
    "mobileDrawer"
  );

  const mobileClose =
  document.getElementById(
    "mobileClose"
  );

  const mobileOverlay =
  document.getElementById(
    "mobileOverlay"
  );

  const navbar =
  document.querySelector(
    ".navbar"
  );


  // ========================================
  // SVG ICONS
  // ========================================

  const categoryIcons = {

    finance: `
    
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none">

        <path
          d="M3 21H21"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"/>

        <path
          d="M5 21V7L12 3V21"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"/>

        <path
          d="M19 21V11L12 7"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"/>

      </svg>
    
    `,

    fitness: `
    
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none">

        <path
          d="M12 21C12 21 4 16 4 9.5C4 6.5 6.5 4 9.5 4C11.24 4 12.91 4.81 14 6.09C15.09 4.81 16.76 4 18.5 4C21.5 4 24 6.5 24 9.5C24 16 16 21 16 21H12Z"
          stroke="currentColor"
          stroke-width="2"/>

      </svg>
    
    `,

    math: `
    
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none">

        <rect
          x="4"
          y="2"
          width="16"
          height="20"
          rx="2"
          stroke="currentColor"
          stroke-width="2"/>

      </svg>
    
    `,

    converter: `
    
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none">

        <path
          d="M17 1L21 5L17 9"
          stroke="currentColor"
          stroke-width="2"/>

        <path
          d="M3 11V9C3 7 4 5 7 5H21"
          stroke="currentColor"
          stroke-width="2"/>

      </svg>
    
    `

  };


  // ========================================
  // LOAD JSON
  // ========================================

  try{

    const response =
    await fetch(
      basePath +
      "data/calculators.json"
    );

    const data =
    await response.json();

    buildDesktopNavbar(data);

    buildMobileNavbar(data);

    setupSearch(data);

    setupMegaMenu();

  }

  catch(error){

    console.error(
      "JSON ERROR:",
      error
    );

  }


  // ========================================
  // DESKTOP NAVBAR
  // ========================================

  function buildDesktopNavbar(data){

    navLinks.innerHTML = "";

    Object.entries(data).forEach(
      ([categoryName, categoryData]) => {

        const li =
        document.createElement("li");

        li.className =
        "mega-parent";

        let totalCount = 0;

        let columnsHTML = "";

        Object.entries(
          categoryData.subcategories
        ).forEach(
          ([subName, subData]) => {

            totalCount +=
            subData.calculators.length;

            let calculatorHTML = "";

            subData.calculators.forEach(calc => {

              const fullURL =
              basePath.replace("./","")
              +
              calc.url.replace("/", "");

              calculatorHTML += `
              
                <a
                  href="${fullURL}">

                  ${calc.name}

                  ${calc.new
                    ? '<span class="new-badge">NEW</span>'
                    : ''
                  }

                </a>
              
              `;

            });

            columnsHTML += `
            
              <div class="mega-column">

                <h3>

                  <span>
                    ${subData.icon}
                  </span>

                  ${subName}

                </h3>

                ${calculatorHTML}

              </div>
            
            `;

          }
        );

        li.innerHTML = `
        
          <button class="mega-btn">

            <div class="
              menu-icon
              ${categoryData.iconSvg}
            ">

              ${categoryIcons[
                categoryData.icon
              ]}

            </div>

            <span>

              ${categoryName}

            </span>

            <span class="arrow">

              ▾

            </span>

            <span class="count-badge">

              ${totalCount}

            </span>

          </button>

          <div class="mega-menu">

            <div class="mega-left">

              ${columnsHTML}

            </div>

            <div class="mega-right">

              <div class="menu-box">

                <h4>

                  Trending

                </h4>

                ${getTrendingCalculators(
                  categoryData
                )}

              </div>

              <div class="menu-box">

                <h4>

                  Popular

                </h4>

                ${getPopularCalculators(
                  categoryData
                )}

              </div>

            </div>

          </div>
        
        `;

        navLinks.appendChild(li);

      }
    );

  }


  // ========================================
  // TRENDING
  // ========================================

  function getTrendingCalculators(
    categoryData
  ){

    let html = "";

    Object.values(
      categoryData.subcategories
    ).forEach(sub => {

      sub.calculators.forEach(calc => {

        if(calc.trending){

          const fullURL =
          basePath.replace("./","")
          +
          calc.url.replace("/", "");

          html += `
          
            <a href="${fullURL}">

              🔥 ${calc.name}

            </a>
          
          `;

        }

      });

    });

    return html;

  }


  // ========================================
  // POPULAR
  // ========================================

  function getPopularCalculators(
    categoryData
  ){

    let html = "";

    Object.values(
      categoryData.subcategories
    ).forEach(sub => {

      sub.calculators.forEach(calc => {

        if(calc.popular){

          const fullURL =
          basePath.replace("./","")
          +
          calc.url.replace("/", "");

          html += `
          
            <a href="${fullURL}">

              ⭐ ${calc.name}

            </a>
          
          `;

        }

      });

    });

    return html;

  }


  // ========================================
  // MOBILE MENU
  // ========================================

  function buildMobileNavbar(data){

    mobileMenu.innerHTML = "";

    Object.entries(data).forEach(
      ([categoryName, categoryData]) => {

        let subcategoryHTML = "";

        Object.entries(
          categoryData.subcategories
        ).forEach(
          ([subName, subData]) => {

            subcategoryHTML += `
            
              <div class="mobile-subcategory">

                <h4>

                  ${subData.icon}
                  ${subName}

                </h4>

                ${subData.calculators.map(calc => {

                  const fullURL =
                  basePath.replace("./","")
                  +
                  calc.url.replace("/", "");

                  return `
                  
                    <a href="${fullURL}">

                      ${calc.name}

                    </a>
                  
                  `;

                }).join("")}

              </div>
            
            `;

          }
        );

        const section =
        document.createElement("div");

        section.className =
        "mobile-menu-section";

        section.innerHTML = `
        
          <button class="mobile-menu-btn">

            <div class="mobile-btn-left">

              <div class="
                menu-icon
                ${categoryData.iconSvg}
              ">

                ${categoryIcons[
                  categoryData.icon
                ]}

              </div>

              <span>

                ${categoryName}

              </span>

            </div>

            <span class="mobile-plus">

              +

            </span>

          </button>

          <div class="mobile-submenu">

            ${subcategoryHTML}

          </div>
        
        `;

        mobileMenu.appendChild(section);

      }
    );

  }


  // ========================================
  // SEARCH ENGINE
  // ========================================

  function setupSearch(data){

    let allCalculators = [];

    Object.entries(data).forEach(
      ([categoryName, categoryData]) => {

        Object.entries(
          categoryData.subcategories
        ).forEach(
          ([subName, subData]) => {

            subData.calculators.forEach(calc => {

              allCalculators.push({

                ...calc,

                category:
                categoryName,

                subcategory:
                subName,

                icon:
                subData.icon

              });

            });

          }
        );

      }
    );

    if(!searchInput) return;

    searchInput.addEventListener(
      "input",
      function(){

        const query =
        this.value
        .toLowerCase()
        .trim();

        if(!query){

          searchDropdown.style.display =
          "none";

          return;

        }

        const results =
        allCalculators.filter(calc => {

          const name =
          calc.name.toLowerCase();

          const keywords =
          calc.keywords.join(" ")
          .toLowerCase();

          return (
            name.includes(query)
            ||
            keywords.includes(query)
          );

        });

        if(results.length === 0){

          searchDropdown.innerHTML = `
          
            <div class="search-empty">

              No calculators found

            </div>
          
          `;

          searchDropdown.style.display =
          "block";

          return;

        }

        searchDropdown.innerHTML =
        results.slice(0,8).map(calc => {

          const fullURL =
          basePath.replace("./","")
          +
          calc.url.replace("/", "");

          return `
          
            <a
              href="${fullURL}"
              class="search-item">

              <div class="
                search-item-icon
              ">

                ${calc.icon}

              </div>

              <div class="
                search-item-content
              ">

                <h5>

                  ${calc.name}

                </h5>

                <p>

                  ${calc.category}
                  •
                  ${calc.subcategory}

                </p>

              </div>

            </a>
          
          `;

        }).join("");

        searchDropdown.style.display =
        "block";

      }
    );

  }


  // ========================================
  // DESKTOP MEGA MENU
  // ========================================

  function setupMegaMenu(){

    const megaButtons =
    document.querySelectorAll(
      ".mega-btn"
    );

    megaButtons.forEach(button => {

      button.addEventListener(
        "click",
        function(e){

          e.stopPropagation();

          const parent =
          this.parentElement;

          document
          .querySelectorAll(
            ".mega-parent"
          )
          .forEach(item => {

            if(item !== parent){

              item.classList.remove(
                "active"
              );

            }

          });

          parent.classList.toggle(
            "active"
          );

        }
      );

    });

  }


  // ========================================
  // MOBILE OPEN
  // ========================================

  mobileToggle.addEventListener(
    "click",
    () => {

      mobileDrawer.classList.add(
        "active"
      );

      mobileOverlay.classList.add(
        "active"
      );

      document.body.style.overflow =
      "hidden";

    }
  );


  // ========================================
  // MOBILE CLOSE
  // ========================================

  function closeMobileMenu(){

    mobileDrawer.classList.remove(
      "active"
    );

    mobileOverlay.classList.remove(
      "active"
    );

    document.body.style.overflow =
    "";

  }

  mobileClose.addEventListener(
    "click",
    closeMobileMenu
  );

  mobileOverlay.addEventListener(
    "click",
    closeMobileMenu
  );


  // ========================================
  // MOBILE SUBMENUS
  // ========================================

  document.addEventListener(
    "click",
    function(e){

      const menuBtn =
      e.target.closest(
        ".mobile-menu-btn"
      );

      if(menuBtn){

        const submenu =
        menuBtn.nextElementSibling;

        submenu.classList.toggle(
          "active"
        );

        const plus =
        menuBtn.querySelector(
          ".mobile-plus"
        );

        plus.textContent =
        submenu.classList.contains(
          "active"
        )
        ? "−"
        : "+";

      }

    }
  );


  // ========================================
  // CLOSE MENUS
  // ========================================

  document.addEventListener(
    "click",
    function(e){

      if(
        !e.target.closest(
          ".mega-parent"
        )
      ){

        document
        .querySelectorAll(
          ".mega-parent"
        )
        .forEach(item => {

          item.classList.remove(
            "active"
          );

        });

      }

      if(
        !e.target.closest(
          ".search-wrapper"
        )
      ){

        if(searchDropdown){

          searchDropdown.style.display =
          "none";

        }

      }

    }
  );


  // ========================================
  // ESC KEY
  // ========================================

  document.addEventListener(
    "keydown",
    function(e){

      if(e.key === "Escape"){

        closeMobileMenu();

        document
        .querySelectorAll(
          ".mega-parent"
        )
        .forEach(item => {

          item.classList.remove(
            "active"
          );

        });

      }

    }
  );


  // ========================================
  // STICKY NAVBAR
  // ========================================

  window.addEventListener(
    "scroll",
    () => {

      if(window.scrollY > 40){

        navbar.classList.add(
          "scrolled"
        );

      }

      else{

        navbar.classList.remove(
          "scrolled"
        );

      }

    }
  );

}


// ========================================
// START
// ========================================

loadComponents();