import axios from "axios";
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

const API_URL = "https://api.tvmaze.com/search/shows";
const ALT_IMG = "https://tinyurl.com/tv-missing";


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

interface showInterface {
  id: number;
  name: string;
  summary: string | null;
  image: string;
}

async function getShowsByTerm(term: string | undefined): Promise<showInterface[]> {
  const results = await axios.get(API_URL, { params: { q: term } });
  console.log("summary", results.data.summary);
  let shows = results.data.map((s: {
    show: { id: number, name: string; },
    summary: string,
    image: { medium: string | undefined; };
  }) => {
    return (
      {
        id: s.show.id,
        name: s.show.name,
        summary: s.summary,
        image: s.image ? s.image.medium : ALT_IMG,
      }
    );
  });
  console.log("shows", shows)
  return shows;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: showInterface[]) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();

  if (typeof term === "string") {
    const shows = await getShowsByTerm(term);

    $episodesArea.hide();
    populateShows(shows);
  }
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

// async function getEpisodesOfShow(id) { }

/** Write a clear docstring for this function... */

// function populateEpisodes(episodes) { }