"use strict";
// 
document.addEventListener("DOMContentLoaded", () => {
  setUpDates();
  updateData();
});


// Set up dates
function setUpDates() {
  const currentTimestamp = Date.now();
  const currentDay = new Date(currentTimestamp);
  let nextDay = currentDay;

  const pageNavDay = document.querySelectorAll(".page-nav__day");

  pageNavDay.forEach((element) => {
    element.dataset.dayTimeStamp = nextDay.setHours(0, 0, 0, 0);

    let dayWeek = nextDay.getDay();
    let dayWeekText = nextDay.toLocaleDateString("ru-RU", {weekday: "short"});

    const pageNavDayWeek = element.querySelector(".page-nav__day-week");
    const pageNavDayNumber = element.querySelector(".page-nav__day-number");

    pageNavDayWeek.textContent = dayWeekText;
    pageNavDayNumber.textContent = nextDay.getDate();

    if (dayWeek === 0 || dayWeek === 6) {
      element.classList.add("page-nav__day_weekend");
    } else {
      element.classList.remove("page-nav__day_weekend");
    }

    nextDay.setDate(nextDay.getDate() + 1);
  });
}
// Sends a request to update data and calls a function to update the main HTML
function updateData() {
  createRequest("event=update", updateMainHtml);
};
// Parses a server response string into a JavaScript object.
function parseServerResponse(serverResponse) {
  return JSON.parse(serverResponse);
}
// Filters out halls that are closed.
function filterHalls(halls) {
  return halls.result.filter((item) => item.hall_open !== "0");
}
// Generates an HTML section for a movie using the provided elementFilm object.
function generateMovieHtml(elementFilm) {
  return `
    <section class="movie">
    <div class="movie__info">
    <div class="movie__poster">
      <img class="movie__poster-image" alt="${elementFilm.film_name} постер" src="${elementFilm.film_poster}">
    </div>
    <div class="movie__description">
      <h2 class="movie__title">${elementFilm.film_name}</h2>
      <p class="movie__synopsis">${elementFilm.film_description}</p>
      <p class="movie__data">
        <span class="movie__data-duration">${elementFilm.film_duration} минут</span>
        <span class="movie__data-origin">${elementFilm.film_origin}</span>
      </p>
    </div>
  </div>
    </section>
  `;
}
//Generates an HTML block representing a movie hall with the given hall name.
function generateHallHtml(elementHall, hallNameText) {
  return `
    <div class="movie-seances__hall">
    <h3 class="movie-seances__hall-title">${hallNameText}</h3>
    <ul class="movie-seances__list">
    </ul>
    </div>
  `;
}
// Generates HTML code for a movie seance.
function generateSeanceHtml(elementSeance, elementFilm, elementHall, hallNameText, seanceTimeStamp) {
  return `
  <li class="movie-seances__time-block"><a class="movie-seances__time" href="hall.html" data-film-id=${elementFilm.film_id} data-film-name="${elementFilm.film_name}" data-hall-id=${elementHall.hall_id} data-hall-name="${hallNameText}" data-price-vip=${elementHall.hall_price_vip} data-price-standart=${elementHall.hall_price_standart} data-seance-id=${elementSeance.seance_id} data-seance-time=${elementSeance.seance_time} data-seance-start=${elementSeance.seance_start} data-seance-time-stamp=${seanceTimeStamp}>${elementSeance.seance_time}</a></li>
  `;
}
// Updates the main HTML of the page with the server response data.
function updateMainHtml(serverResponse) {
  const response = parseServerResponse(serverResponse);

  const requestFilms = response.films.result;
  const requestHalls = filterHalls(response.halls);
  const requestSeances = response.seances.result;

  const configHalls = {};

  const selectedDayTimestamp = (document.querySelector("nav .page-nav__day_chosen")).dataset.dayTimeStamp;
  const nowTimestamp = Date.now();

  const mainSection = document.querySelector("main");
  mainSection.innerHTML = "";

  requestFilms.forEach((elementFilm) => {
    const movieHtml = generateMovieHtml(elementFilm);
    mainSection.insertAdjacentHTML("beforeend", movieHtml);

    const movieSection = mainSection?.querySelector(".movie:last-child");

    requestHalls.forEach(elementHall => {
      configHalls[elementHall.hall_id] = elementHall.hall_config;

      const arrSeancesFilter = requestSeances.filter((seance, index, array) => {
        return seance.seance_filmid === elementFilm.film_id && seance.seance_hallid === elementHall.hall_id;
      });
      const hallNameText = `${elementHall.hall_name.slice(0, 3)} ${elementHall.hall_name.slice(3).trim()}`;

      if (arrSeancesFilter.length) {
        const hallHtml = generateHallHtml(elementHall, hallNameText);
        movieSection.insertAdjacentHTML("beforeend", hallHtml);

        const movieSeancesList = movieSection?.querySelector(".movie-seances__hall:last-child > .movie-seances__list");

        arrSeancesFilter.forEach(elementSeance => {
          const seanceTimestamp = +selectedDayTimestamp + (+elementSeance.seance_start * 60 * 1000);

          if (nowTimestamp <seanceTimestamp) {
            const seanceHtml = generateSeanceHtml(elementSeance, elementFilm, elementHall, hallNameText, seanceTimestamp);
            movieSeancesList.insertAdjacentHTML("beforeend", seanceHtml);
          }
        });
      };
    });
  });

  setJSON("config-halls", configHalls);

  addListeners();
}
// Handles the click event of a day element.
function onDayClick(event) {
  event.preventDefault();
  const pageNavDay = document.querySelectorAll(".page-nav__day");
  pageNavDay.forEach((element) => {
    element.classList.remove("page-nav__day_chosen");
  });

  event.currentTarget.classList.add("page-nav__day_chosen");

  updateData();
}

// Handles the click event of a seance element.
function onSeanceClick(event) {
  const seanceData = this.dataset;

  setJSON("data-of-the-selected-seance", seanceData);
}
// Adds event listeners to the page.
function addListeners() {
  const pageNavDay = document.querySelectorAll(".page-nav__day");
  const movieSeancesTime = document.querySelectorAll(".movie-seances__time");

  pageNavDay.forEach(element => {
    element.addEventListener("click", onDayClick);
  });

  movieSeancesTime.forEach(element => {
    element.addEventListener("click", onSeanceClick);
  });
}
